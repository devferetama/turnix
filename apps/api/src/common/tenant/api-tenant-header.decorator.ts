import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiTenantHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'x-tenant-slug',
      required: false,
      description:
        'Optional local-development and Swagger fallback when the request host does not carry the tenant subdomain. Normal production traffic should resolve tenant from the host, for example demo.localhost or demo.turnix.local.',
    }),
    ApiHeader({
      name: 'x-tenant-id',
      required: false,
      description:
        'Legacy fallback for local development and Swagger testing only. Prefer x-tenant-slug when host-based tenant resolution is unavailable.',
    }),
  );
}
