import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { TenantContext } from './tenant-context.interface';
import { TenantRequest } from './tenant-request.interface';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TenantContext => {
    const request = context.switchToHttp().getRequest<TenantRequest>();

    if (!request.tenant) {
      throw new BadRequestException(
        'Tenant context not found in request. Resolve tenant by host/subdomain or provide x-tenant-slug (or legacy x-tenant-id) for local development and Swagger testing.',
      );
    }

    return request.tenant;
  },
);
