import type { Request } from 'express';
import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import type { TenantContext } from './tenant-context.interface';

export interface TenantRequest extends Request {
  tenant?: TenantContext;
  tenantId?: string;
  user?: AuthenticatedUser;
}
