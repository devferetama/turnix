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
  ServiceVisibility,
  SlotStatus,
} from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { AppointmentReschedulingService } from '../appointments/appointment-rescheduling.service';
import { CancelPublicAppointmentDto } from './dto/cancel-public-appointment.dto';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';
import { ListPublicServicesQueryDto } from './dto/list-public-services-query.dto';
import { ListPublicServiceSlotsQueryDto } from './dto/list-public-service-slots-query.dto';
import { ReschedulePublicAppointmentDto } from './dto/reschedule-public-appointment.dto';

const SERIALIZABLE_RETRY_LIMIT = 2;
const APPOINTMENT_CODE_RETRY_LIMIT = 5;

const publicBranchSelect = Prisma.validator<Prisma.BranchSelect>()({
  id: true,
  slug: true,
  name: true,
  description: true,
  timezone: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  isActive: true,
});

const publicServiceSelect = Prisma.validator<Prisma.ServiceSelect>()({
  id: true,
  categoryId: true,
  branchId: true,
  slug: true,
  name: true,
  description: true,
  visibility: true,
  mode: true,
  durationMinutes: true,
  slotCapacity: true,
  allowOnlineBooking: true,
  requiresApproval: true,
  requiresAuthentication: true,
  isActive: true,
  branch: {
    select: publicBranchSelect,
  },
});

const publicSlotSelect = Prisma.validator<Prisma.TimeSlotSelect>()({
  id: true,
  branchId: true,
  serviceId: true,
  staffUserId: true,
  slotDate: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  reservedCount: true,
  status: true,
  isPublic: true,
  branch: {
    select: publicBranchSelect,
  },
});

const publicAppointmentInclude = Prisma.validator<Prisma.AppointmentInclude>()({
  branch: {
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      timezone: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  },
  service: {
    select: {
      id: true,
      slug: true,
      name: true,
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
  slot: {
    select: {
      id: true,
      branchId: true,
      serviceId: true,
      staffUserId: true,
      slotDate: true,
      startsAt: true,
      endsAt: true,
    },
  },
});

type PublicServiceRecord = Prisma.ServiceGetPayload<{
  select: typeof publicServiceSelect;
}>;

type PublicSlotRecord = Prisma.TimeSlotGetPayload<{
  select: typeof publicSlotSelect;
}>;

type PublicAppointmentRecord = Prisma.AppointmentGetPayload<{
  include: typeof publicAppointmentInclude;
}>;

const publicAppointmentLookupInclude =
  Prisma.validator<Prisma.AppointmentInclude>()({
    branch: {
      select: {
        slug: true,
        name: true,
        description: true,
        timezone: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
    },
    service: {
      select: {
        slug: true,
        name: true,
        mode: true,
        durationMinutes: true,
      },
    },
    citizen: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    },
    cancellation: {
      select: {
        cancelledAt: true,
      },
    },
  });

type PublicAppointmentLookupRecord = Prisma.AppointmentGetPayload<{
  include: typeof publicAppointmentLookupInclude;
}>;

type PublicCreateReferenceRecord = {
  branch: {
    id: string;
    isActive: boolean;
  };
  service: {
    id: string;
    branchId: string | null;
    visibility: ServiceVisibility;
    allowOnlineBooking: boolean;
    requiresApproval: boolean;
    requiresAuthentication: boolean;
    isActive: boolean;
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
    isPublic: boolean;
  };
};

type PublicAppointmentCancellationRecord = {
  id: string;
  slotId: string;
  status: AppointmentStatus;
};

@Injectable()
export class PublicBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentReschedulingService: AppointmentReschedulingService,
  ) {}

  async findServices(tenant: TenantContext, query: ListPublicServicesQueryDto) {
    const services = await this.prisma.service.findMany({
      where: this.buildPublicServicesWhereClause(tenant.tenantId, query),
      select: publicServiceSelect,
      orderBy: [{ name: 'asc' }],
    });

    return services
      .filter((service) => !service.branch || service.branch.isActive)
      .map((service) => this.mapPublicService(service));
  }

  async findServiceSlots(
    tenant: TenantContext,
    serviceId: string,
    query: ListPublicServiceSlotsQueryDto,
  ) {
    const service = await this.loadPublicServiceOrThrow(
      tenant.tenantId,
      serviceId,
    );

    const startsAtFilter = this.buildPublicSlotStartsAtFilter(
      query.dateFrom,
      query.dateTo,
    );

    const slots = await this.prisma.timeSlot.findMany({
      where: {
        tenantId: tenant.tenantId,
        serviceId: service.id,
        ...(query.branchId ? { branchId: query.branchId } : {}),
        isPublic: true,
        status: SlotStatus.OPEN,
        startsAt: startsAtFilter,
      },
      select: publicSlotSelect,
      orderBy: [{ startsAt: 'asc' }],
    });

    return slots
      .filter((slot) => slot.branch.isActive)
      .filter((slot) => slot.reservedCount < slot.capacity)
      .map((slot) => this.mapPublicSlot(slot));
  }

  async createAppointment(
    tenant: TenantContext,
    dto: CreatePublicAppointmentDto,
  ) {
    const result = await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) => this.createAppointmentInTransaction(tx, tenant.tenantId, dto),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return this.findPublicAppointmentOrThrow(
      tenant.tenantId,
      result.appointmentId,
    );
  }

  async findAppointmentByCode(tenant: TenantContext, code: string) {
    const appointment = await this.findPublicAppointmentByCodeOrThrow(
      tenant.tenantId,
      code,
    );

    return this.mapPublicAppointmentLookup(appointment);
  }

  async cancelAppointmentByCode(
    tenant: TenantContext,
    code: string,
    dto: CancelPublicAppointmentDto,
  ) {
    await this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) =>
          this.cancelAppointmentByCodeInTransaction(
            tx,
            tenant.tenantId,
            code,
            dto,
          ),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );

    return this.findAppointmentByCode(tenant, code);
  }

  async rescheduleAppointmentByCode(
    tenant: TenantContext,
    code: string,
    dto: ReschedulePublicAppointmentDto,
  ) {
    await this.appointmentReschedulingService.reschedulePublic(
      tenant.tenantId,
      code,
      dto,
    );

    return this.findAppointmentByCode(tenant, code);
  }

  private buildPublicServicesWhereClause(
    tenantId: string,
    query: ListPublicServicesQueryDto,
  ): Prisma.ServiceWhereInput {
    const andFilters: Prisma.ServiceWhereInput[] = [
      {
        tenantId,
        visibility: ServiceVisibility.PUBLIC,
        allowOnlineBooking: true,
        requiresAuthentication: false,
        isActive: true,
      },
    ];

    if (query.branchId) {
      andFilters.push({
        branchId: query.branchId,
      });
    }

    if (query.categoryId) {
      andFilters.push({
        categoryId: query.categoryId,
      });
    }

    if (query.search) {
      andFilters.push({
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    return {
      AND: andFilters,
    };
  }

  private buildPublicSlotStartsAtFilter(dateFrom?: string, dateTo?: string) {
    const now = new Date();
    const from = dateFrom ? parseDateBoundary(dateFrom, 'start') : undefined;
    const to = dateTo ? parseDateBoundary(dateTo, 'end') : undefined;
    const lowerBound = from && from.getTime() > now.getTime() ? from : now;

    if (from && to && to < from) {
      throw new BadRequestException('dateTo must not be before dateFrom');
    }

    return {
      gte: lowerBound,
      ...(to ? { lte: to } : {}),
    };
  }

  private async loadPublicServiceOrThrow(tenantId: string, serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        tenantId,
      },
      select: publicServiceSelect,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    this.ensureServiceIsPubliclyBookable(service);

    if (service.branch && !service.branch.isActive) {
      throw new ConflictException(
        'Service branch is not available for public booking',
      );
    }

    return service;
  }

  private async createAppointmentInTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: CreatePublicAppointmentDto,
  ): Promise<{ appointmentId: string }> {
    this.validateCitizenPayload(dto);

    const references = await this.loadCreateReferences(tx, tenantId, dto);
    const now = new Date();

    if (!references.branch.isActive) {
      throw new ConflictException('Branch is not available for public booking');
    }

    this.ensureServiceIsPubliclyBookable(references.service);

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

    if (!references.slot.isPublic) {
      throw new ConflictException('Slot is not available for public booking');
    }

    if (references.slot.status !== SlotStatus.OPEN) {
      throw new ConflictException('Slot is not open for booking');
    }

    if (references.slot.startsAt <= now) {
      throw new ConflictException('Slot has already started or expired');
    }

    const citizen = await this.resolveCitizen(tx, tenantId, dto);

    const slotReservation = await tx.timeSlot.updateMany({
      where: {
        id: references.slot.id,
        tenantId,
        branchId: dto.branchId,
        serviceId: dto.serviceId,
        status: SlotStatus.OPEN,
        isPublic: true,
        startsAt: {
          gt: now,
        },
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

    const initialStatus = references.service.requiresApproval
      ? AppointmentStatus.PENDING
      : AppointmentStatus.CONFIRMED;

    const appointmentId = await this.createAppointmentWithUniqueCode(
      tx,
      tenantId,
      {
        branchId: dto.branchId,
        serviceId: dto.serviceId,
        citizenId: citizen.id,
        staffUserId: references.slot.staffUserId,
        slotId: references.slot.id,
        source: AppointmentSource.WEB,
        status: initialStatus,
        scheduledStart: references.slot.startsAt,
        scheduledEnd: references.slot.endsAt,
        citizenNotes: dto.citizenNotes,
      },
      {
        source: AppointmentSource.WEB,
        createdVia: 'public-booking',
        requiresApproval: references.service.requiresApproval,
      },
    );

    return {
      appointmentId,
    };
  }

  private async cancelAppointmentByCodeInTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    code: string,
    dto: CancelPublicAppointmentDto,
  ) {
    const appointment = await this.getPublicAppointmentForCancellation(
      tx,
      tenantId,
      code,
    );

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new ConflictException('Appointment is already cancelled');
    }

    if (!this.isPubliclyCancellable(appointment.status)) {
      throw new ConflictException(
        'The appointment cannot be cancelled in its current state',
      );
    }

    const existingCancellation = await tx.appointmentCancellation.findUnique({
      where: {
        appointmentId: appointment.id,
      },
      select: {
        id: true,
      },
    });

    if (existingCancellation) {
      throw new ConflictException('Appointment is already cancelled');
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

    const cancelledAt = new Date();

    await tx.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt,
      },
    });

    await tx.appointmentCancellation.create({
      data: {
        tenantId,
        appointmentId: appointment.id,
        reason: dto.reason,
        details: dto.details,
        cancelledAt,
      },
    });

    await this.createStatusHistory(tx, {
      tenantId,
      appointmentId: appointment.id,
      fromStatus: appointment.status,
      toStatus: AppointmentStatus.CANCELLED,
      note: dto.reason ?? dto.details,
      metadata: {
        source: AppointmentSource.WEB,
        createdVia: 'public-cancel',
      },
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
    dto: CreatePublicAppointmentDto,
  ): Promise<PublicCreateReferenceRecord> {
    const [branch, service, slot] = await Promise.all([
      tx.branch.findFirst({
        where: {
          id: dto.branchId,
          tenantId,
        },
        select: {
          id: true,
          isActive: true,
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
          visibility: true,
          allowOnlineBooking: true,
          requiresApproval: true,
          requiresAuthentication: true,
          isActive: true,
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
          isPublic: true,
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

  private ensureServiceIsPubliclyBookable(service: {
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
        'Service requires authentication before public booking',
      );
    }
  }

  private validateCitizenPayload(dto: CreatePublicAppointmentDto) {
    if (!dto.firstName.trim() || !dto.lastName.trim()) {
      throw new BadRequestException('firstName and lastName are required');
    }

    const hasDocumentType = Boolean(dto.documentType);
    const hasDocumentNumber = Boolean(dto.documentNumber);

    if (hasDocumentType !== hasDocumentNumber) {
      throw new BadRequestException(
        'documentType and documentNumber must be provided together',
      );
    }
  }

  private async resolveCitizen(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: CreatePublicAppointmentDto,
  ) {
    const existingCitizen = await this.findExistingCitizen(tx, tenantId, dto);

    if (existingCitizen) {
      if (!existingCitizen.isActive) {
        throw new ConflictException('Citizen is inactive');
      }

      return existingCitizen;
    }

    return tx.citizen.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
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
    dto: CreatePublicAppointmentDto,
  ) {
    const [matchByDocument, matchByEmail] = await Promise.all([
      dto.documentType && dto.documentNumber
        ? tx.citizen.findFirst({
            where: {
              tenantId,
              documentType: dto.documentType,
              documentNumber: dto.documentNumber,
            },
            select: {
              id: true,
              isActive: true,
            },
          })
        : Promise.resolve(null),
      dto.email
        ? tx.citizen.findFirst({
            where: {
              tenantId,
              email: dto.email,
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
    },
    metadata: Prisma.InputJsonValue,
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
          },
          select: {
            id: true,
            status: true,
          },
        });

        await this.createStatusHistory(tx, {
          tenantId,
          appointmentId: appointment.id,
          fromStatus: null,
          toStatus: appointment.status,
          metadata,
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

  private async createStatusHistory(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      appointmentId: string;
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
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        note: input.note,
        metadata: input.metadata,
      },
    });
  }

  private async getPublicAppointmentForCancellation(
    tx: Prisma.TransactionClient,
    tenantId: string,
    code: string,
  ): Promise<PublicAppointmentCancellationRecord> {
    const appointment = await tx.appointment.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
      select: {
        id: true,
        slotId: true,
        status: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async findPublicAppointmentOrThrow(
    tenantId: string,
    appointmentId: string,
  ): Promise<PublicAppointmentRecord> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        tenantId,
      },
      include: publicAppointmentInclude,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async findPublicAppointmentByCodeOrThrow(
    tenantId: string,
    code: string,
  ): Promise<PublicAppointmentLookupRecord> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
      include: publicAppointmentLookupInclude,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private mapPublicService(service: PublicServiceRecord) {
    return {
      id: service.id,
      categoryId: service.categoryId,
      branchId: service.branchId,
      slug: service.slug,
      name: service.name,
      description: service.description,
      visibility: service.visibility,
      mode: service.mode,
      durationMinutes: service.durationMinutes,
      slotCapacity: service.slotCapacity,
      allowOnlineBooking: service.allowOnlineBooking,
      requiresApproval: service.requiresApproval,
      branch: service.branch ? this.mapPublicBranch(service.branch) : null,
    };
  }

  private mapPublicSlot(slot: PublicSlotRecord) {
    return {
      id: slot.id,
      branchId: slot.branchId,
      serviceId: slot.serviceId,
      staffUserId: slot.staffUserId,
      slotDate: slot.slotDate,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      capacity: slot.capacity,
      availableCapacity: Math.max(slot.capacity - slot.reservedCount, 0),
      status: slot.status,
      branch: this.mapPublicBranch(slot.branch),
    };
  }

  private mapPublicBranch(branch: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    timezone: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
  }) {
    return {
      id: branch.id,
      slug: branch.slug,
      name: branch.name,
      description: branch.description,
      timezone: branch.timezone,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      postalCode: branch.postalCode,
    };
  }

  private mapPublicAppointmentLookup(
    appointment: PublicAppointmentLookupRecord,
  ) {
    return {
      code: appointment.code,
      status: appointment.status,
      scheduledStart: appointment.scheduledStart,
      scheduledEnd: appointment.scheduledEnd,
      service: {
        slug: appointment.service.slug,
        name: appointment.service.name,
        mode: appointment.service.mode,
        durationMinutes: appointment.service.durationMinutes,
      },
      branch: {
        slug: appointment.branch.slug,
        name: appointment.branch.name,
        description: appointment.branch.description,
        timezone: appointment.branch.timezone,
        city: appointment.branch.city,
        state: appointment.branch.state,
        country: appointment.branch.country,
        postalCode: appointment.branch.postalCode,
      },
      citizen: {
        firstName: appointment.citizen.firstName,
        lastName: appointment.citizen.lastName,
        email: appointment.citizen.email,
        phone: appointment.citizen.phone,
      },
      cancellation: appointment.cancellation
        ? {
            cancelledAt: appointment.cancellation.cancelledAt,
          }
        : null,
    };
  }

  private isPubliclyCancellable(status: AppointmentStatus) {
    return (
      status === AppointmentStatus.PENDING ||
      status === AppointmentStatus.CONFIRMED
    );
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
