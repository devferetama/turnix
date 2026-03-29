import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

type MutableServiceData = {
  categoryId?: string;
  branchId?: string;
  slug?: string;
  name?: string;
  description?: string;
  visibility?: CreateServiceDto['visibility'];
  mode?: CreateServiceDto['mode'];
  durationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  slotCapacity?: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
  requiresAuthentication?: boolean;
  allowsCancellation?: boolean;
  allowsReschedule?: boolean;
  isActive?: boolean;
};

type CreateServiceData = MutableServiceData & {
  slug: string;
  name: string;
  durationMinutes: number;
};

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: ListServicesQueryDto) {
    return this.prisma.service.findMany({
      where: this.buildWhereClause(tenant.tenantId, query),
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(tenant: TenantContext, id: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async create(tenant: TenantContext, dto: CreateServiceDto) {
    await this.ensureReferencesBelongToTenant(tenant.tenantId, dto);
    await this.ensureSlugAvailable(tenant.tenantId, dto.slug);

    try {
      return await this.prisma.service.create({
        data: {
          tenantId: tenant.tenantId,
          ...this.buildCreateServiceData(dto),
        },
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(tenant: TenantContext, id: string, dto: UpdateServiceDto) {
    await this.findOne(tenant, id);
    await this.ensureReferencesBelongToTenant(tenant.tenantId, dto);

    if (dto.slug) {
      await this.ensureSlugAvailable(tenant.tenantId, dto.slug, id);
    }

    try {
      return await this.prisma.service.update({
        where: { id },
        data: this.buildMutableServiceData(dto),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private buildWhereClause(
    tenantId: string,
    query: ListServicesQueryDto,
  ): Prisma.ServiceWhereInput {
    return {
      tenantId,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.visibility ? { visibility: query.visibility } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.search
        ? {
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
          }
        : {}),
    };
  }

  private buildMutableServiceData(
    dto: CreateServiceDto | UpdateServiceDto,
  ): MutableServiceData {
    return {
      categoryId: dto.categoryId,
      branchId: dto.branchId,
      slug: dto.slug,
      name: dto.name,
      description: dto.description,
      visibility: dto.visibility,
      mode: dto.mode,
      durationMinutes: dto.durationMinutes,
      bufferBeforeMinutes: dto.bufferBeforeMinutes,
      bufferAfterMinutes: dto.bufferAfterMinutes,
      slotCapacity: dto.slotCapacity,
      allowOnlineBooking: dto.allowOnlineBooking,
      requiresApproval: dto.requiresApproval,
      requiresAuthentication: dto.requiresAuthentication,
      allowsCancellation: dto.allowsCancellation,
      allowsReschedule: dto.allowsReschedule,
      isActive: dto.isActive,
    };
  }

  private buildCreateServiceData(dto: CreateServiceDto): CreateServiceData {
    return {
      ...this.buildMutableServiceData(dto),
      slug: dto.slug,
      name: dto.name,
      durationMinutes: dto.durationMinutes,
    };
  }

  private async ensureReferencesBelongToTenant(
    tenantId: string,
    dto: Pick<CreateServiceDto, 'categoryId' | 'branchId'>,
  ) {
    const [category, branch] = await Promise.all([
      dto.categoryId
        ? this.prisma.serviceCategory.findFirst({
            where: {
              id: dto.categoryId,
              tenantId,
            },
            select: { id: true },
          })
        : Promise.resolve(null),
      dto.branchId
        ? this.prisma.branch.findFirst({
            where: {
              id: dto.branchId,
              tenantId,
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (dto.categoryId && !category) {
      throw new NotFoundException('Service category not found');
    }

    if (dto.branchId && !branch) {
      throw new NotFoundException('Branch not found');
    }
  }

  private async ensureSlugAvailable(
    tenantId: string,
    slug: string,
    excludedServiceId?: string,
  ) {
    const existingService = await this.prisma.service.findFirst({
      where: {
        tenantId,
        slug,
        ...(excludedServiceId
          ? {
              NOT: {
                id: excludedServiceId,
              },
            }
          : {}),
      },
      select: { id: true },
    });

    if (existingService) {
      throw new ConflictException(
        `A service with slug "${slug}" already exists in this tenant`,
      );
    }
  }

  private handlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A service with the same unique fields already exists in this tenant',
      );
    }

    throw error;
  }
}
