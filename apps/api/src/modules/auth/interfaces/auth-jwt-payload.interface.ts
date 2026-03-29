import { AppRole } from '@prisma/client';

export interface AuthJwtPayload {
  sub: string;
  tenantId: string;
  role: AppRole;
  email: string;
}
