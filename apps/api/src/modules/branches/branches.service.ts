import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ListBranchesQueryDto } from './dto/list-branches-query.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

type MutableBranchData = {
  slug?: string;
  name?: string;
  description?: string;
  timezone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
};

type CreateBranchData = MutableBranchData & {
  slug: string;
  name: string;
};

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: ListBranchesQueryDto) {
    return this.prisma.branch.findMany({
      where: this.buildWhereClause(tenant.tenantId, query),
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(tenant: TenantContext, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async create(tenant: TenantContext, dto: CreateBranchDto) {
    await this.ensureSlugAvailable(tenant.tenantId, dto.slug);

    try {
      return await this.prisma.branch.create({
        data: {
          tenantId: tenant.tenantId,
          ...this.buildCreateBranchData(dto),
        },
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(tenant: TenantContext, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenant, id);

    if (dto.slug) {
      await this.ensureSlugAvailable(tenant.tenantId, dto.slug, id);
    }

    try {
      return await this.prisma.branch.update({
        where: { id },
        data: this.buildMutableBranchData(dto),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private buildWhereClause(
    tenantId: string,
    query: ListBranchesQueryDto,
  ): Prisma.BranchWhereInput {
    return {
      tenantId,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
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

  private buildMutableBranchData(
    dto: CreateBranchDto | UpdateBranchDto,
  ): MutableBranchData {
    return {
      slug: dto.slug,
      name: dto.name,
      description: dto.description,
      timezone: dto.timezone,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postalCode: dto.postalCode,
      isActive: dto.isActive,
    };
  }

  private buildCreateBranchData(dto: CreateBranchDto): CreateBranchData {
    return {
      ...this.buildMutableBranchData(dto),
      slug: dto.slug,
      name: dto.name,
    };
  }

  private async ensureSlugAvailable(
    tenantId: string,
    slug: string,
    excludedBranchId?: string,
  ) {
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        tenantId,
        slug,
        ...(excludedBranchId
          ? {
              NOT: {
                id: excludedBranchId,
              },
            }
          : {}),
      },
      select: { id: true },
    });

    if (existingBranch) {
      throw new ConflictException(
        `A branch with slug "${slug}" already exists in this tenant`,
      );
    }
  }

  private handlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A branch with the same unique fields already exists in this tenant',
      );
    }

    throw error;
  }
}
