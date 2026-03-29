export const TENANT_SLUG_HEADER = 'x-tenant-slug';
export const LEGACY_TENANT_ID_HEADER = 'x-tenant-id';
export const FORWARDED_HOST_HEADER = 'x-forwarded-host';

const RESERVED_HOST_LABELS = new Set(['api', 'app', 'www']);

export function isReservedTenantHostLabel(label: string) {
  return RESERVED_HOST_LABELS.has(label);
}
