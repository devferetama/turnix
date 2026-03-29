import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Weekday } from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { ListAvailabilityRulesQueryDto } from './dto/list-availability-rules-query.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

type AvailabilityRuleReferenceInput = {
  branchId: string;
  serviceId: string;
  staffUserId?: string | null;
};

type AvailabilityRuleValidationInput = AvailabilityRuleReferenceInput & {
  startMinute: number;
  endMinute: number;
  slotDurationMinutes: number;
  capacity: number;
  validFrom?: string | Date | null;
  validTo?: string | Date | null;
};

type MutableAvailabilityRuleData = {
  branchId?: string;
  serviceId?: string;
  staffUserId?: string | null;
  weekday?: Weekday;
  startMinute?: number;
  endMinute?: number;
  slotDurationMinutes?: number;
  capacity?: number;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean;
  notes?: string | null;
};

type CreateAvailabilityRuleData = MutableAvailabilityRuleData & {
  branchId: string;
  serviceId: string;
  weekday: Weekday;
  startMinute: number;
  endMinute: number;
  slotDurationMinutes: number;
};

@Injectable()
export class AvailabilityRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: ListAvailabilityRulesQueryDto) {
    return this.prisma.availabilityRule.findMany({
      where: this.buildWhereClause(tenant.tenantId, query),
      orderBy: [
        { weekday: 'asc' },
        { startMinute: 'asc' },
        { endMinute: 'asc' },
      ],
    });
  }

  async findOne(tenant: TenantContext, id: string) {
    const rule = await this.prisma.availabilityRule.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Availability rule not found');
    }

    return rule;
  }

  async create(tenant: TenantContext, dto: CreateAvailabilityRuleDto) {
    await this.validateRulePayload(tenant.tenantId, {
      branchId: dto.branchId,
      serviceId: dto.serviceId,
      staffUserId: dto.staffUserId,
      startMinute: dto.startMinute,
      endMinute: dto.endMinute,
      slotDurationMinutes: dto.slotDurationMinutes,
      capacity: dto.capacity ?? 1,
      validFrom: dto.validFrom,
      validTo: dto.validTo,
    });

    return this.prisma.availabilityRule.create({
      data: {
        tenantId: tenant.tenantId,
        ...this.buildCreateAvailabilityRuleData(dto),
      },
    });
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateAvailabilityRuleDto,
  ) {
    const existingRule = await this.findOne(tenant, id);
    const mergedRule = this.buildMergedValidationInput(existingRule, dto);

    await this.validateRulePayload(tenant.tenantId, mergedRule);

    return this.prisma.availabilityRule.update({
      where: { id },
      data: this.buildMutableAvailabilityRuleData(dto),
    });
  }

  private buildWhereClause(
    tenantId: string,
    query: ListAvailabilityRulesQueryDto,
  ): Prisma.AvailabilityRuleWhereInput {
    return {
      tenantId,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(query.staffUserId ? { staffUserId: query.staffUserId } : {}),
      ...(query.weekday ? { weekday: query.weekday } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
  }

  private buildMutableAvailabilityRuleData(
    dto: CreateAvailabilityRuleDto | UpdateAvailabilityRuleDto,
  ): MutableAvailabilityRuleData {
    return {
      branchId: dto.branchId,
      serviceId: dto.serviceId,
      staffUserId: dto.staffUserId,
      weekday: dto.weekday,
      startMinute: dto.startMinute,
      endMinute: dto.endMinute,
      slotDurationMinutes: dto.slotDurationMinutes,
      capacity: dto.capacity,
      validFrom: dto.validFrom,
      validTo: dto.validTo,
      isActive: dto.isActive,
      notes: dto.notes,
    };
  }

  private buildCreateAvailabilityRuleData(
    dto: CreateAvailabilityRuleDto,
  ): CreateAvailabilityRuleData {
    return {
      ...this.buildMutableAvailabilityRuleData(dto),
      branchId: dto.branchId,
      serviceId: dto.serviceId,
      weekday: dto.weekday,
      startMinute: dto.startMinute,
      endMinute: dto.endMinute,
      slotDurationMinutes: dto.slotDurationMinutes,
    };
  }

  private buildMergedValidationInput(
    existingRule: Awaited<ReturnType<AvailabilityRulesService['findOne']>>,
    dto: UpdateAvailabilityRuleDto,
  ): AvailabilityRuleValidationInput {
    return {
      branchId: dto.branchId ?? existingRule.branchId,
      serviceId: dto.serviceId ?? existingRule.serviceId,
      staffUserId:
        dto.staffUserId === undefined
          ? existingRule.staffUserId
          : dto.staffUserId,
      startMinute: dto.startMinute ?? existingRule.startMinute,
      endMinute: dto.endMinute ?? existingRule.endMinute,
      slotDurationMinutes:
        dto.slotDurationMinutes ?? existingRule.slotDurationMinutes,
      capacity: dto.capacity ?? existingRule.capacity,
      validFrom:
        dto.validFrom === undefined ? existingRule.validFrom : dto.validFrom,
      validTo: dto.validTo === undefined ? existingRule.validTo : dto.validTo,
    };
  }

  private async validateRulePayload(
    tenantId: string,
    input: AvailabilityRuleValidationInput,
  ) {
    this.validateMinutesAndCapacity(input);
    this.validateDateRange(input.validFrom, input.validTo);

    const [branch, service, staffUser] = await Promise.all([
      this.prisma.branch.findFirst({
        where: {
          id: input.branchId,
          tenantId,
        },
        select: {
          id: true,
        },
      }),
      this.prisma.service.findFirst({
        where: {
          id: input.serviceId,
          tenantId,
        },
        select: {
          id: true,
          branchId: true,
        },
      }),
      input.staffUserId
        ? this.prisma.staffUser.findFirst({
            where: {
              id: input.staffUserId,
              tenantId,
            },
            select: {
              id: true,
              branchId: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (input.staffUserId && !staffUser) {
      throw new NotFoundException('Staff user not found');
    }

    if (service.branchId && service.branchId !== input.branchId) {
      throw new BadRequestException(
        'Service does not belong to the selected branch',
      );
    }

    if (staffUser?.branchId && staffUser.branchId !== input.branchId) {
      throw new BadRequestException(
        'Staff user does not belong to the selected branch',
      );
    }
  }

  private validateMinutesAndCapacity(input: AvailabilityRuleValidationInput) {
    if (input.startMinute >= input.endMinute) {
      throw new BadRequestException(
        'endMinute must be greater than startMinute',
      );
    }

    if (input.slotDurationMinutes <= 0) {
      throw new BadRequestException(
        'slotDurationMinutes must be greater than zero',
      );
    }

    if (input.capacity <= 0) {
      throw new BadRequestException('capacity must be greater than zero');
    }
  }

  private validateDateRange(
    validFrom?: string | Date | null,
    validTo?: string | Date | null,
  ) {
    const fromDate = this.toComparableDate(validFrom);
    const toDate = this.toComparableDate(validTo);

    if (fromDate && toDate && toDate < fromDate) {
      throw new BadRequestException('validTo must not be before validFrom');
    }
  }

  private toComparableDate(value?: string | Date | null) {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
