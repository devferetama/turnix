import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AppRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiTenantHeader } from '../../common/tenant/api-tenant-header.decorator';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { SlotGenerationSummaryDto } from './dto/slot-generation-summary.dto';
import { SlotGenerationService } from './slot-generation.service';

@ApiTags('Scheduling')
@ApiBearerAuth('backofficeAuth')
@ApiTenantHeader()
@UseGuards(JwtAuthGuard)
@Roles(AppRole.SUPER_ADMIN, AppRole.TENANT_ADMIN, AppRole.OPERATOR)
@Controller('api/v1/scheduling/slots')
export class SlotGenerationController {
  constructor(private readonly slotGenerationService: SlotGenerationService) {}

  @Post('generate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate materialized time slots from recurring rules',
  })
  @ApiOkResponse({
    description: 'Slot generation summary for the requested tenant date range.',
    type: SlotGenerationSummaryDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid date range or unsupported generation request.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to generate slots.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  generate(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GenerateSlotsDto,
  ) {
    return this.slotGenerationService.generateSlotsForTenant(
      tenant.tenantId,
      dto.fromDate,
      dto.toDate,
    );
  }
}
