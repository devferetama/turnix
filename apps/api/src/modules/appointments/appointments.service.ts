import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentSource,
  AppointmentStatus,
  Prisma,
  SlotStatus,
} from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AppointmentReschedulingService } from './appointment-rescheduling.service';
import {
  AppointmentCitizenInputDto,
  CreateAppointmentDto,
} from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

const SERIALIZABLE_RETRY_LIMIT = 2;
const APPOINTMENT_CODE_RETRY_LIMIT = 5;

const staffUserSummarySelect = Prisma.validator<Prisma.StaffUserSelect>()({
  id: true,
  branchId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
});

const appointmentListInclude = Prisma.validator<Prisma.AppointmentInclude>()({
  branch: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  service: {
    select: {
      id: true,
      slug: true,
      name: true,
      visibility: true,
      mode: true,
      durationMinutes: true,
    },
  },
  citizen: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      documentType: true,
      documentNumber: true,
    },
  },
  staffUser: {
    select: staffUserSummarySelect,
  },
  slot: {
    select: {
      id: true,
      slotDate: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      reservedCount: true,
      status: true,
      branchId: true,
      serviceId: true,
      staffUserId: true,
    },
  },
});

const appointmentDetailInclude = Prisma.validator<Prisma.AppointmentInclude>()({
  ...appointmentListInclude,
  cancellation: {
    include: {
      cancelledByStaffUser: {
        select: staffUserSummarySelect,
      },
    },
  },
  statusHistory: {
    orderBy: {
      changedAt: 'desc',
    },
    include: {
      changedByStaffUser: {
        select: staffUserSummarySelect,
      },
    },
  },
});

type AppointmentListRecord = Prisma.AppointmentGetPayload<{
  include: typeof appointmentListInclude;
}>;

type AppointmentDetailRecord = Prisma.AppointmentGetPayload<{
  include: typeof appointmentDetailInclude;
}>;

type AppointmentCreateTxResult = {
  appointmentId: string;
};

type AppointmentCreateReferenceRecord = {
  branch: {
    id: string;
  };
  service: {
    id: string;
    branchId: string | null;
  };
  slot: {
    id: string;
    branchId: string;
    serviceId: string;
    staffUserId: string | null;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    reservedCount: number;
    status: SlotStatus;
  };
};

type AppointmentRecordForMutation = {
  id: string;
  tenantId: string;
  slotId: string;
  status: AppointmentStatus;
  checkedInAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

const allowedStatusTransitions: Record<AppointmentStatus, AppointmentStatus[]> =
  {
    [AppointmentStatus.PENDING]: [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.CONFIRMED]: [
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ],
    [AppointmentStatus.CHECKED_IN]: [AppointmentStatus.IN_PROGRESS],
    [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
    [AppointmentStatus.COMPLETED]: [],
    [AppointmentStatus.CANCELLED]: [],
    [AppointmentStatus.NO_SHOW]: [],
    [AppointmentStatus.RESCHEDULED]: [],
  };

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentReschedulingService: AppointmentReschedulingService,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: ListAppointmentsQueryDto,
  ): Promise<AppointmentListRecord[]> {
    return this.prisma.appointment.findMany({
      where: this.buildWhereClause(tenant.tenantId, query),
      include: appointmentListInclude,
      orderBy: [{ scheduledStart: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(
    tenant: TenantContext,
    id: string,
  ): Promise<AppointmentDetailRecord> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
      include: appointmentDetailInclude,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async create(
    tenant: TenantContext,
    user: AuthenticatedUser,
    dto: CreateAppointmentDto,
  ) {
    const result = await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) => this.createInTransaction(tx, tenant.tenantId, user, dto),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return this.findOne(tenant, result.appointmentId);
  }

  async updateStatus(
    tenant: TenantContext,
    user: AuthenticatedUser,
    id: string,
    dto: UpdateAppointmentStatusDto,
  ) {
    if (dto.status === AppointmentStatus.CANCELLED) {
      return this.cancel(tenant, user, id, {
        details: dto.note,
      });
    }

    await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const appointment = await this.getAppointmentForMutation(
            tx,
            tenant.tenantId,
            id,
          );

          this.ensureStatusTransitionAllowed(appointment.status, dto.status);

          await tx.appointment.update({
            where: {
              id: appointment.id,
            },
            data: {
              status: dto.status,
              ...this.buildStatusTimestampData(dto.status, new Date()),
            },
          });

          await this.createStatusHistory(tx, {
            tenantId: tenant.tenantId,
            appointmentId: appointment.id,
            actorId: user.id,
            fromStatus: appointment.status,
            toStatus: dto.status,
            note: dto.note,
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return this.findOne(tenant, id);
  }

  async cancel(
    tenant: TenantContext,
    user: AuthenticatedUser,
    id: string,
    dto: CancelAppointmentDto,
  ) {
    await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) => this.cancelInTransaction(tx, tenant.tenantId, user, id, dto),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return this.findOne(tenant, id);
  }

  async reschedule(
    tenant: TenantContext,
    user: AuthenticatedUser,
    id: string,
    dto: RescheduleAppointmentDto,
  ) {
    await this.appointmentReschedulingService.rescheduleBackoffice(
      tenant.tenantId,
      user,
      id,
      dto,
    );

    return this.findOne(tenant, id);
  }

  private buildWhereClause(
    tenantId: string,
    query: ListAppointmentsQueryDto,
  ): Prisma.AppointmentWhereInput {
    const scheduledStartFilter = this.buildScheduledStartFilter(
      query.dateFrom,
      query.dateTo,
    );

    return {
      tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.citizenId ? { citizenId: query.citizenId } : {}),
      ...(scheduledStartFilter ? { scheduledStart: scheduledStartFilter } : {}),
      ...(query.search
        ? {
            OR: [
              {
                code: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                citizen: {
                  OR: [
                    {
                      firstName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      email: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };
  }

  private buildScheduledStartFilter(dateFrom?: string, dateTo?: string) {
    if (!dateFrom && !dateTo) {
      return undefined;
    }

    const from = dateFrom ? parseDateBoundary(dateFrom, 'start') : undefined;
    const to = dateTo ? parseDateBoundary(dateTo, 'end') : undefined;

    if (from && to && to < from) {
      throw new BadRequestException('dateTo must not be before dateFrom');
    }

    return {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  private async createInTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    user: AuthenticatedUser,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentCreateTxResult> {
    this.validateCitizenPayload(dto);

    const references = await this.loadCreateReferences(tx, tenantId, dto);
    const citizen = await this.resolveCitizen(tx, tenantId, dto);

    if (
      references.service.branchId &&
      references.service.branchId !== dto.branchId
    ) {
      throw new BadRequestException(
        'Service does not belong to the selected branch',
      );
    }

    if (references.slot.branchId !== dto.branchId) {
      throw new BadRequestException(
        'Slot does not belong to the selected branch',
      );
    }

    if (references.slot.serviceId !== dto.serviceId) {
      throw new BadRequestException(
        'Slot does not belong to the selected service',
      );
    }

    if (references.slot.status !== SlotStatus.OPEN) {
      throw new ConflictException('Slot is not open for booking');
    }

    const requestedStaffUserId = dto.staffUserId ?? null;

    if (
      requestedStaffUserId &&
      references.slot.staffUserId &&
      requestedStaffUserId !== references.slot.staffUserId
    ) {
      throw new BadRequestException(
        'Slot is assigned to a different staff user',
      );
    }

    const finalStaffUserId =
      requestedStaffUserId ?? references.slot.staffUserId;
    await this.validateStaffAssignment(
      tx,
      tenantId,
      dto.branchId,
      finalStaffUserId,
    );

    const slotReservation = await tx.timeSlot.updateMany({
      where: {
        id: references.slot.id,
        tenantId,
        status: SlotStatus.OPEN,
        reservedCount: {
          lt: references.slot.capacity,
        },
      },
      data: {
        reservedCount: {
          increment: 1,
        },
      },
    });

    if (slotReservation.count === 0) {
      throw new ConflictException('Slot is full or unavailable');
    }

    const slotAfterReservation = await tx.timeSlot.findUnique({
      where: {
        id: references.slot.id,
      },
      select: {
        id: true,
        reservedCount: true,
        capacity: true,
        status: true,
      },
    });

    if (
      slotAfterReservation &&
      slotAfterReservation.status === SlotStatus.OPEN &&
      slotAfterReservation.reservedCount >= slotAfterReservation.capacity
    ) {
      await tx.timeSlot.update({
        where: {
          id: slotAfterReservation.id,
        },
        data: {
          status: SlotStatus.FULL,
        },
      });
    }

    const appointmentId = await this.createAppointmentWithUniqueCode(
      tx,
      tenantId,
      user.id,
      {
        branchId: dto.branchId,
        serviceId: dto.serviceId,
        citizenId: citizen.id,
        staffUserId: finalStaffUserId,
        slotId: references.slot.id,
        source: dto.source ?? AppointmentSource.STAFF,
        status: AppointmentStatus.CONFIRMED,
        scheduledStart: references.slot.startsAt,
        scheduledEnd: references.slot.endsAt,
        citizenNotes: dto.citizenNotes,
        internalNotes: dto.internalNotes,
      },
    );

    return {
      appointmentId,
    };
  }

  private async cancelInTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    user: AuthenticatedUser,
    id: string,
    dto: CancelAppointmentDto,
  ) {
    const appointment = await this.getAppointmentForMutation(tx, tenantId, id);

    if (!this.isCancellable(appointment.status)) {
      throw new ConflictException(
        'The appointment cannot be cancelled in its current state',
      );
    }

    const cancellationRecord = await tx.appointmentCancellation.findUnique({
      where: {
        appointmentId: appointment.id,
      },
      select: {
        id: true,
      },
    });

    if (cancellationRecord) {
      throw new ConflictException('The appointment is already cancelled');
    }

    const slotRelease = await tx.timeSlot.updateMany({
      where: {
        id: appointment.slotId,
        tenantId,
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

    if (slotRelease.count === 0) {
      throw new ConflictException(
        'The selected slot reservation count is already zero',
      );
    }

    await tx.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await tx.appointmentCancellation.create({
      data: {
        tenantId,
        appointmentId: appointment.id,
        cancelledByStaffUserId: user.id,
        reason: dto.reason,
        details: dto.details,
      },
    });

    await this.createStatusHistory(tx, {
      tenantId,
      appointmentId: appointment.id,
      actorId: user.id,
      fromStatus: appointment.status,
      toStatus: AppointmentStatus.CANCELLED,
      note: dto.reason ?? dto.details,
    });

    const slotAfterRelease = await tx.timeSlot.findUnique({
      where: {
        id: appointment.slotId,
      },
      select: {
        id: true,
        status: true,
        reservedCount: true,
        capacity: true,
      },
    });

    if (
      slotAfterRelease &&
      slotAfterRelease.status === SlotStatus.FULL &&
      slotAfterRelease.reservedCount < slotAfterRelease.capacity
    ) {
      await tx.timeSlot.update({
        where: {
          id: slotAfterRelease.id,
        },
        data: {
          status: SlotStatus.OPEN,
        },
      });
    }
  }

  private async loadCreateReferences(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentCreateReferenceRecord> {
    const [branch, service, slot] = await Promise.all([
      tx.branch.findFirst({
        where: {
          id: dto.branchId,
          tenantId,
        },
        select: {
          id: true,
        },
      }),
      tx.service.findFirst({
        where: {
          id: dto.serviceId,
          tenantId,
        },
        select: {
          id: true,
          branchId: true,
        },
      }),
      tx.timeSlot.findFirst({
        where: {
          id: dto.slotId,
          tenantId,
        },
        select: {
          id: true,
          branchId: true,
          serviceId: true,
          staffUserId: true,
          startsAt: true,
          endsAt: true,
          capacity: true,
          reservedCount: true,
          status: true,
        },
      }),
    ]);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!slot) {
      throw new NotFoundException('Time slot not found');
    }

    return {
      branch,
      service,
      slot,
    };
  }

  private async validateStaffAssignment(
    tx: Prisma.TransactionClient,
    tenantId: string,
    branchId: string,
    staffUserId?: string | null,
  ) {
    if (!staffUserId) {
      return;
    }

    const staffUser = await tx.staffUser.findFirst({
      where: {
        id: staffUserId,
        tenantId,
      },
      select: {
        id: true,
        branchId: true,
        isActive: true,
      },
    });

    if (!staffUser) {
      throw new NotFoundException('Staff user not found');
    }

    if (!staffUser.isActive) {
      throw new ConflictException('Staff user is inactive');
    }

    if (staffUser.branchId && staffUser.branchId !== branchId) {
      throw new BadRequestException(
        'Staff user does not belong to the selected branch',
      );
    }
  }

  private validateCitizenPayload(dto: CreateAppointmentDto) {
    if (!dto.citizenId && !dto.citizen) {
      throw new BadRequestException(
        'Either citizenId or citizen payload must be provided',
      );
    }

    if (!dto.citizen) {
      return;
    }

    const hasDocumentType = Boolean(dto.citizen.documentType);
    const hasDocumentNumber = Boolean(dto.citizen.documentNumber);

    if (hasDocumentType !== hasDocumentNumber) {
      throw new BadRequestException(
        'documentType and documentNumber must be provided together',
      );
    }
  }

  private async resolveCitizen(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: CreateAppointmentDto,
  ) {
    if (dto.citizenId) {
      const citizen = await tx.citizen.findFirst({
        where: {
          id: dto.citizenId,
          tenantId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!citizen) {
        throw new NotFoundException('Citizen not found');
      }

      if (!citizen.isActive) {
        throw new ConflictException('Citizen is inactive');
      }

      return citizen;
    }

    const citizenInput = dto.citizen as AppointmentCitizenInputDto;
    const existingCitizen = await this.findExistingCitizen(
      tx,
      tenantId,
      citizenInput,
    );

    if (existingCitizen) {
      if (!existingCitizen.isActive) {
        throw new ConflictException('Citizen is inactive');
      }

      return existingCitizen;
    }

    return tx.citizen.create({
      data: {
        tenantId,
        firstName: citizenInput.firstName,
        lastName: citizenInput.lastName,
        email: citizenInput.email,
        phone: citizenInput.phone,
        documentType: citizenInput.documentType,
        documentNumber: citizenInput.documentNumber,
      },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  private async findExistingCitizen(
    tx: Prisma.TransactionClient,
    tenantId: string,
    citizen: AppointmentCitizenInputDto,
  ) {
    const [matchByDocument, matchByEmail] = await Promise.all([
      citizen.documentType && citizen.documentNumber
        ? tx.citizen.findFirst({
            where: {
              tenantId,
              documentType: citizen.documentType,
              documentNumber: citizen.documentNumber,
            },
            select: {
              id: true,
              isActive: true,
            },
          })
        : Promise.resolve(null),
      citizen.email
        ? tx.citizen.findFirst({
            where: {
              tenantId,
              email: citizen.email,
            },
            select: {
              id: true,
              isActive: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (
      matchByDocument &&
      matchByEmail &&
      matchByDocument.id !== matchByEmail.id
    ) {
      throw new ConflictException(
        'Citizen data matches multiple existing records in this tenant',
      );
    }

    return matchByDocument ?? matchByEmail;
  }

  private async createAppointmentWithUniqueCode(
    tx: Prisma.TransactionClient,
    tenantId: string,
    actorId: string,
    payload: {
      branchId: string;
      serviceId: string;
      citizenId: string;
      staffUserId?: string | null;
      slotId: string;
      source: AppointmentSource;
      status: AppointmentStatus;
      scheduledStart: Date;
      scheduledEnd: Date;
      citizenNotes?: string | null;
      internalNotes?: string | null;
    },
  ) {
    for (
      let attempt = 0;
      attempt < APPOINTMENT_CODE_RETRY_LIMIT;
      attempt += 1
    ) {
      const code = generateAppointmentCode();

      try {
        const appointment = await tx.appointment.create({
          data: {
            tenantId,
            branchId: payload.branchId,
            serviceId: payload.serviceId,
            citizenId: payload.citizenId,
            staffUserId: payload.staffUserId,
            slotId: payload.slotId,
            code,
            source: payload.source,
            status: payload.status,
            scheduledStart: payload.scheduledStart,
            scheduledEnd: payload.scheduledEnd,
            citizenNotes: payload.citizenNotes,
            internalNotes: payload.internalNotes,
          },
          select: {
            id: true,
            status: true,
            source: true,
          },
        });

        await this.createStatusHistory(tx, {
          tenantId,
          appointmentId: appointment.id,
          actorId,
          fromStatus: null,
          toStatus: appointment.status,
          metadata: {
            source: appointment.source,
            createdVia: 'backoffice',
          },
        });

        return appointment.id;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Unable to generate a unique appointment code for this tenant',
    );
  }

  private async getAppointmentForMutation(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<AppointmentRecordForMutation> {
    const appointment = await tx.appointment.findFirst({
      where: {
        id,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        slotId: true,
        status: true,
        checkedInAt: true,
        completedAt: true,
        cancelledAt: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private ensureStatusTransitionAllowed(
    currentStatus: AppointmentStatus,
    nextStatus: AppointmentStatus,
  ) {
    if (currentStatus === nextStatus) {
      throw new ConflictException(
        `Appointment is already in status ${nextStatus}`,
      );
    }

    const allowedStatuses = allowedStatusTransitions[currentStatus] ?? [];

    if (!allowedStatuses.includes(nextStatus)) {
      throw new ConflictException(
        `Cannot transition appointment from ${currentStatus} to ${nextStatus}`,
      );
    }
  }

  private isCancellable(status: AppointmentStatus) {
    return (
      status === AppointmentStatus.PENDING ||
      status === AppointmentStatus.CONFIRMED
    );
  }

  private buildStatusTimestampData(
    nextStatus: AppointmentStatus,
    now: Date,
  ): Prisma.AppointmentUpdateInput {
    switch (nextStatus) {
      case AppointmentStatus.CHECKED_IN:
        return {
          checkedInAt: now,
        };
      case AppointmentStatus.COMPLETED:
        return {
          completedAt: now,
        };
      default:
        return {};
    }
  }

  private async createStatusHistory(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      appointmentId: string;
      actorId: string;
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

function parseDateBoundary(input: string, boundary: 'start' | 'end') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(
      boundary === 'start'
        ? `${input}T00:00:00.000Z`
        : `${input}T23:59:59.999Z`,
    );
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Invalid date value: ${input}`);
  }

  return parsed;
}

function generateAppointmentCode(now = new Date()) {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `APT-${datePart}-${randomPart}`;
}
