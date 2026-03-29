import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { TenantResolutionService } from './tenant-resolution.service';
import type { TenantRequest } from './tenant-request.interface';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantResolutionService: TenantResolutionService,
  ) {}

  async use(request: TenantRequest, _response: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantResolutionService.resolveFromRequest(
        request,
      );

      if (tenant) {
        request.tenant = tenant;
        request.tenantId = tenant.tenantId;
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
