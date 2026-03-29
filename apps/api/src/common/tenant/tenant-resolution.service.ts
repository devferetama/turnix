import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import {
  FORWARDED_HOST_HEADER,
  isReservedTenantHostLabel,
  LEGACY_TENANT_ID_HEADER,
  TENANT_SLUG_HEADER,
} from './tenant.constants';
import type { TenantContext } from './tenant-context.interface';
import type { TenantRequest } from './tenant-request.interface';

const tenantContextSelect = Prisma.validator<Prisma.TenantSelect>()({
  id: true,
  slug: true,
  name: true,
  timezone: true,
  isActive: true,
});

type TenantRecord = Prisma.TenantGetPayload<{
  select: typeof tenantContextSelect;
}>;

type TenantResolutionSource =
  | 'host'
  | 'header-slug'
  | 'header-id'
  | 'authenticated-user';

@Injectable()
export class TenantResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveFromRequest(
    request: Pick<TenantRequest, 'headers' | 'hostname'>,
  ): Promise<TenantContext | undefined> {
    const rawHost =
      getHeaderValue(request.headers[FORWARDED_HOST_HEADER]) ??
      getHeaderValue(request.headers.host) ??
      request.hostname;
    const normalizedHost = normalizeHost(rawHost);
    const hostTenantSlug = normalizedHost
      ? extractTenantSlugFromHost(normalizedHost)
      : undefined;

    let hostTenant: TenantContext | undefined;

    if (hostTenantSlug) {
      hostTenant = await this.findTenantBySlugOrThrow(
        hostTenantSlug,
        'host',
        normalizedHost,
      );
    }

    const headerTenantSlug = getHeaderValue(request.headers[TENANT_SLUG_HEADER]);

    if (headerTenantSlug) {
      const resolvedFromHeader = await this.findTenantBySlugOrThrow(
        normalizeTenantSlug(headerTenantSlug),
        'header-slug',
        normalizedHost,
      );

      if (hostTenant && hostTenant.tenantId !== resolvedFromHeader.tenantId) {
        throw new BadRequestException(
          'Resolved tenant host does not match x-tenant-slug.',
        );
      }

      return hostTenant ?? resolvedFromHeader;
    }

    const headerTenantId = getHeaderValue(
      request.headers[LEGACY_TENANT_ID_HEADER],
    );

    if (headerTenantId) {
      const resolvedFromHeader = await this.findTenantByIdOrThrow(
        headerTenantId,
        'header-id',
        normalizedHost,
      );

      if (hostTenant && hostTenant.tenantId !== resolvedFromHeader.tenantId) {
        throw new BadRequestException(
          'Resolved tenant host does not match x-tenant-id.',
        );
      }

      return hostTenant ?? resolvedFromHeader;
    }

    return hostTenant;
  }

  mapAuthenticatedUserToTenantContext(
    user: NonNullable<TenantRequest['user']>,
    host?: string,
  ): TenantContext {
    return {
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
      tenantName: user.tenant.name,
      timezone: user.tenant.timezone,
      isActive: user.tenant.isActive,
      resolutionSource: 'authenticated-user',
      host,
    };
  }

  private async findTenantBySlugOrThrow(
    tenantSlug: string,
    resolutionSource: Exclude<TenantResolutionSource, 'header-id'>,
    host?: string,
  ): Promise<TenantContext> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug: tenantSlug,
      },
      select: tenantContextSelect,
    });

    return this.ensureActiveTenantOrThrow(
      tenant,
      resolutionSource,
      host,
      tenantSlug,
    );
  }

  private async findTenantByIdOrThrow(
    tenantId: string,
    resolutionSource: 'header-id',
    host?: string,
  ): Promise<TenantContext> {
    if (!isUuid(tenantId)) {
      throw new BadRequestException('Malformed x-tenant-id header.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
      select: tenantContextSelect,
    });

    return this.ensureActiveTenantOrThrow(tenant, resolutionSource, host);
  }

  private ensureActiveTenantOrThrow(
    tenant: TenantRecord | null,
    resolutionSource: TenantResolutionSource,
    host?: string,
    tenantSlug?: string,
  ): TenantContext {
    if (!tenant) {
      throw new NotFoundException(
        tenantSlug
          ? `Tenant "${tenantSlug}" was not found for the current request host.`
          : 'Tenant was not found for the current request context.',
      );
    }

    if (!tenant.isActive) {
      throw new ForbiddenException('The resolved tenant is inactive.');
    }

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      timezone: tenant.timezone,
      isActive: tenant.isActive,
      resolutionSource,
      host,
    };
  }
}

function getHeaderValue(
  headerValue: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  return value?.split(',')[0]?.trim() || undefined;
}

function normalizeHost(rawHost?: string): string | undefined {
  if (!rawHost) {
    return undefined;
  }

  const trimmed = rawHost.trim().toLowerCase();

  if (!trimmed) {
    return undefined;
  }

  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\//, '');

  if (withoutProtocol.startsWith('[')) {
    const closingIndex = withoutProtocol.indexOf(']');

    if (closingIndex === -1) {
      throw new BadRequestException('Malformed request host.');
    }

    return withoutProtocol.slice(1, closingIndex);
  }

  const firstSegment = withoutProtocol.split('/')[0]?.trim() ?? '';

  if (!firstSegment) {
    throw new BadRequestException('Malformed request host.');
  }

  return firstSegment.split(':')[0]?.trim().replace(/\.$/, '') || undefined;
}

function extractTenantSlugFromHost(host: string): string | undefined {
  if (!host || isIpAddress(host) || host === 'localhost') {
    return undefined;
  }

  const labels = host.split('.').filter(Boolean);

  if (labels.length < 2) {
    return undefined;
  }

  const candidate =
    labels[labels.length - 1] === 'localhost'
      ? labels[labels.length - 2]
      : labels.length >= 3
        ? labels[labels.length - 3]
        : undefined;

  if (!candidate || isReservedTenantHostLabel(candidate)) {
    return undefined;
  }

  return normalizeTenantSlug(candidate);
}

function normalizeTenantSlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(normalizedSlug)) {
    throw new BadRequestException('Malformed tenant slug.');
  }

  return normalizedSlug;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isIpAddress(host: string) {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    /^[0-9a-f:]+$/i.test(host)
  );
}
