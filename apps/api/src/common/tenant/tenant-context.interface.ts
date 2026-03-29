export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  timezone: string;
  isActive: boolean;
  resolutionSource: 'host' | 'header-slug' | 'header-id' | 'authenticated-user';
  host?: string;
}
