import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  Prisma,
  ServiceVisibility,
  SlotStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

const SERIALIZABLE_RETRY_LIMIT = 2;

type AppointmentRescheduleMutationRecord = {
  id: string;
  code: string;
  tenantId: string;
  branchId: string;
  serviceId: string;
  staffUserId: string | null;
  slotId: string;
  source: string;
  status: AppointmentStatus;
  scheduledStart: Date;
  scheduledEnd: Date;
  service: {
    branchId: string | null;
    visibility: ServiceVisibility;
    allowOnlineBooking: boolean;
    requiresAuthentication: boolean;
    isActive: boolean;
  };
};

type SlotRescheduleRecord = {
  id: string;
  tenantId: string;
  branchId: string;
  serviceId: string;
  staffUserId: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  reservedCount: number;
  status: SlotStatus;
  isPublic: boolean;
  branch: {
    isActive: boolean;
  };
};

type RescheduleContext = {
  tenantId: string;
  appointmentLookup: {
    type: 'id';
    value: string;
  };
  actor: {
    type: 'backoffice';
    staffUserId: string;
  };
  payload: RescheduleAppointmentDto;
  visibilityMode: 'backoffice';
};

type PublicRescheduleContext = {
  tenantId: string;
  appointmentLookup: {
    type: 'code';
    value: string;
  };
  actor: {
    type: 'public';
  };
  payload: RescheduleAppointmentDto;
  visibilityMode: 'public';
};

type RescheduleOperationContext = RescheduleContext | PublicRescheduleContext;

@Injectable()
export class AppointmentReschedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async rescheduleBackoffice(
    tenantId: string,
    user: AuthenticatedUser,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
  ) {
    const result = await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) =>
          this.rescheduleInTransaction(tx, {
            tenantId,
            appointmentLookup: {
              type: 'id',
              value: appointmentId,
            },
            actor: {
              type: 'backoffice',
              staffUserId: user.id,
            },
            payload: dto,
            visibilityMode: 'backoffice',
          }),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return result;
  }

  async reschedulePublic(
    tenantId: string,
    appointmentCode: string,
    dto: RescheduleAppointmentDto,
  ) {
    const result = await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) =>
          this.rescheduleInTransaction(tx, {
            tenantId,
            appointmentLookup: {
              type: 'code',
              value: appointmentCode,
            },
            actor: {
              type: 'public',
            },
            payload: dto,
            visibilityMode: 'public',
          }),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return result;
  }

  private async rescheduleInTransaction(
    tx: Prisma.TransactionClient,
    context: RescheduleOperationContext,
  ) {
    const appointment = await this.loadAppointmentForReschedule(
      tx,
      context.tenantId,
      context.appointmentLookup,
    );

    if (!this.isReschedulable(appointment.status)) {
      throw new ConflictException(
        'The appointment cannot be rescheduled in its current state',
      );
    }

    if (appointment.slotId === context.payload.newSlotId) {
      throw new ConflictException(
        'The selected slot is already assigned to this appointment',
      );
    }

    const [currentSlot, newSlot] = await Promise.all([
      this.loadSlotOrThrow(tx, context.tenantId, appointment.slotId),
      this.loadSlotOrThrow(tx, context.tenantId, context.payload.newSlotId),
    ]);

    this.validateNewSlot(appointment, newSlot, context.visibilityMode);

    const now = new Date();

    if (newSlot.startsAt <= now) {
      throw new ConflictException(
        'The selected slot has already started or expired',
      );
    }

    const newSlotReservation = await tx.timeSlot.updateMany({
      where: {
        id: newSlot.id,
        tenantId: context.tenantId,
        serviceId: appointment.serviceId,
        status: SlotStatus.OPEN,
        ...(context.visibilityMode === 'public' ? { isPublic: true } : {}),
        startsAt: {
          gt: now,
        },
        reservedCount: {
          lt: newSlot.capacity,
        },
      },
      data: {
        reservedCount: {
          increment: 1,
        },
      },
    });

    if (newSlotReservation.count === 0) {
      throw new ConflictException('The selected slot is full or unavailable');
    }

    const currentSlotRelease = await tx.timeSlot.updateMany({
      where: {
        id: currentSlot.id,
        tenantId: context.tenantId,
        reservedCount: {
          gt: 0,
        },
      },
      data: {
        reservedCount: {
          decrement: 1,
        },
      },
    });

    if (currentSlotRelease.count === 0) {
      throw new ConflictException(
        'The current slot reservation count is already zero',
      );
    }

    await tx.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        branchId: newSlot.branchId,
        staffUserId: newSlot.staffUserId,
        slotId: newSlot.id,
        scheduledStart: newSlot.startsAt,
        scheduledEnd: newSlot.endsAt,
      },
    });

    await tx.appointmentReschedule.create({
      data: {
        tenantId: context.tenantId,
        appointmentId: appointment.id,
        fromSlotId: currentSlot.id,
        toSlotId: newSlot.id,
        rescheduledByStaffUserId:
          context.actor.type === 'backoffice'
            ? context.actor.staffUserId
            : null,
        previousStart: appointment.scheduledStart,
        previousEnd: appointment.scheduledEnd,
        nextStart: newSlot.startsAt,
        nextEnd: newSlot.endsAt,
        reason: context.payload.reason ?? context.payload.details ?? null,
      },
    });

    await this.createStatusHistory(tx, {
      tenantId: context.tenantId,
      appointmentId: appointment.id,
      actorId:
        context.actor.type === 'backoffice' ? context.actor.staffUserId : null,
      fromStatus: appointment.status,
      toStatus: appointment.status,
      note: context.payload.reason ?? context.payload.details,
      metadata: {
        event: 'rescheduled',
        source: context.actor.type,
        fromSlotId: currentSlot.id,
        toSlotId: newSlot.id,
        previousStart: appointment.scheduledStart.toISOString(),
        previousEnd: appointment.scheduledEnd.toISOString(),
        nextStart: newSlot.startsAt.toISOString(),
        nextEnd: newSlot.endsAt.toISOString(),
        reason: context.payload.reason ?? null,
        details: context.payload.details ?? null,
      },
    });

    await this.syncSlotAvailabilityStatus(tx, currentSlot.id);
    await this.syncSlotAvailabilityStatus(tx, newSlot.id);

    return {
      appointmentId: appointment.id,
      appointmentCode: appointment.code,
    };
  }

  private async loadAppointmentForReschedule(
    tx: Prisma.TransactionClient,
    tenantId: string,
    lookup: RescheduleOperationContext['appointmentLookup'],
  ): Promise<AppointmentRescheduleMutationRecord> {
    const appointment =
      lookup.type === 'id'
        ? await tx.appointment.findFirst({
            where: {
              id: lookup.value,
              tenantId,
            },
            select: this.getAppointmentRescheduleSelect(),
          })
        : await tx.appointment.findUnique({
            where: {
              tenantId_code: {
                tenantId,
                code: lookup.value,
              },
            },
            select: this.getAppointmentRescheduleSelect(),
          });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private getAppointmentRescheduleSelect() {
    return Prisma.validator<Prisma.AppointmentSelect>()({
      id: true,
      code: true,
      tenantId: true,
      branchId: true,
      serviceId: true,
      staffUserId: true,
      slotId: true,
      source: true,
      status: true,
      scheduledStart: true,
      scheduledEnd: true,
      service: {
        select: {
          branchId: true,
          visibility: true,
          allowOnlineBooking: true,
          requiresAuthentication: true,
          isActive: true,
        },
      },
    });
  }

  private async loadSlotOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    slotId: string,
  ): Promise<SlotRescheduleRecord> {
    const slot = await tx.timeSlot.findFirst({
      where: {
        id: slotId,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        branchId: true,
        serviceId: true,
        staffUserId: true,
        startsAt: true,
        endsAt: true,
        capacity: true,
        reservedCount: true,
        status: true,
        isPublic: true,
        branch: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Time slot not found');
    }

    return slot;
  }

  private validateNewSlot(
    appointment: AppointmentRescheduleMutationRecord,
    newSlot: SlotRescheduleRecord,
    visibilityMode: RescheduleOperationContext['visibilityMode'],
  ) {
    if (!appointment.service.isActive) {
      throw new ConflictException('The appointment service is inactive');
    }

    if (!newSlot.branch.isActive) {
      throw new ConflictException('The selected slot branch is inactive');
    }

    if (newSlot.serviceId !== appointment.serviceId) {
      throw new BadRequestException(
        'The selected slot does not belong to the same service',
      );
    }

    if (
      appointment.service.branchId &&
      newSlot.branchId !== appointment.service.branchId
    ) {
      throw new BadRequestException(
        'The selected slot does not belong to the required service branch',
      );
    }

    if (newSlot.status !== SlotStatus.OPEN) {
      throw new ConflictException(
        'The selected slot is not open for reschedule',
      );
    }

    if (visibilityMode === 'public') {
      this.ensureServiceAllowsPublicReschedule(appointment.service);

      if (!newSlot.isPublic) {
        throw new ConflictException(
          'The selected slot is not available for public reschedule',
        );
      }
    }
  }

  private ensureServiceAllowsPublicReschedule(service: {
    visibility: ServiceVisibility;
    allowOnlineBooking: boolean;
    requiresAuthentication: boolean;
    isActive: boolean;
  }) {
    if (!service.isActive) {
      throw new ConflictException('Service is inactive');
    }

    if (service.visibility !== ServiceVisibility.PUBLIC) {
      throw new ConflictException('Service is not publicly visible');
    }

    if (!service.allowOnlineBooking) {
      throw new ConflictException(
        'Service is not available for online booking',
      );
    }

    if (service.requiresAuthentication) {
      throw new ConflictException(
        'Service requires authentication before public reschedule',
      );
    }
  }

  private isReschedulable(status: AppointmentStatus) {
    return (
      status === AppointmentStatus.PENDING ||
      status === AppointmentStatus.CONFIRMED
    );
  }

  private async syncSlotAvailabilityStatus(
    tx: Prisma.TransactionClient,
    slotId: string,
  ) {
    const slot = await tx.timeSlot.findUnique({
      where: {
        id: slotId,
      },
      select: {
        id: true,
        status: true,
        reservedCount: true,
        capacity: true,
      },
    });

    if (!slot) {
      return;
    }

    if (
      slot.status === SlotStatus.OPEN &&
      slot.reservedCount >= slot.capacity
    ) {
      await tx.timeSlot.update({
        where: {
          id: slot.id,
        },
        data: {
          status: SlotStatus.FULL,
        },
      });
    }

    if (slot.status === SlotStatus.FULL && slot.reservedCount < slot.capacity) {
      await tx.timeSlot.update({
        where: {
          id: slot.id,
        },
        data: {
          status: SlotStatus.OPEN,
        },
      });
    }
  }

  private async createStatusHistory(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      appointmentId: string;
      actorId: string | null;
      fromStatus: AppointmentStatus | null;
      toStatus: AppointmentStatus;
      note?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    await tx.appointmentStatusHistory.create({
      data: {
        tenantId: input.tenantId,
        appointmentId: input.appointmentId,
        changedByStaffUserId: input.actorId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        note: input.note,
        metadata: input.metadata,
      },
    });
  }

  private async runWithSerializableRetry<T>(
    operation: () => Promise<T>,
    attempt = 0,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt < SERIALIZABLE_RETRY_LIMIT &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        return this.runWithSerializableRetry(operation, attempt + 1);
      }

      throw error;
    }
  }
}
