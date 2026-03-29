import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantResolutionService } from '../../../common/tenant/tenant-resolution.service';
import type { TenantRequest } from '../../../common/tenant/tenant-request.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly tenantResolutionService: TenantResolutionService,
  ) {
    super();
  }

  handleRequest<TUser extends AuthenticatedUser>(
    err: unknown,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Authentication required');
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();

    if (request.tenant && request.tenant.tenantId !== user.tenantId) {
      throw new UnauthorizedException(
        'Resolved tenant does not match the authenticated user.',
      );
    }

    if (!request.tenant) {
      request.tenant = this.tenantResolutionService.mapAuthenticatedUserToTenantContext(
        user,
        request.hostname,
      );
      request.tenantId = user.tenantId;
    }

    return user;
  }
}
