import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
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
import { AvailabilityRulesService } from './availability-rules.service';
import { AvailabilityRuleResponseDto } from './dto/availability-rule-response.dto';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { ListAvailabilityRulesQueryDto } from './dto/list-availability-rules-query.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

@ApiTags('Scheduling')
@ApiBearerAuth('backofficeAuth')
@ApiTenantHeader()
@UseGuards(JwtAuthGuard)
@Roles(
  AppRole.SUPER_ADMIN,
  AppRole.TENANT_ADMIN,
  AppRole.OPERATOR,
  AppRole.VIEWER,
)
@Controller('api/v1/scheduling/rules')
export class AvailabilityRulesController {
  constructor(
    private readonly availabilityRulesService: AvailabilityRulesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List recurring availability rules for the current tenant',
  })
  @ApiOkResponse({
    description: 'Tenant-scoped list of recurring availability rules.',
    type: AvailabilityRuleResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filters or missing tenant context.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access scheduling rules.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListAvailabilityRulesQueryDto,
  ) {
    return this.availabilityRulesService.findAll(tenant, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a recurring availability rule for the current tenant',
  })
  @ApiOkResponse({
    description: 'Availability rule found inside the current tenant.',
    type: AvailabilityRuleResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Availability rule not found for the current tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access scheduling rules.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.availabilityRulesService.findOne(tenant, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a recurring availability rule in the current tenant',
  })
  @ApiCreatedResponse({
    description: 'Availability rule created successfully.',
    type: AvailabilityRuleResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the rule payload or related data.',
  })
  @ApiNotFoundResponse({
    description:
      'Referenced branch, service, or staff user was not found inside the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access scheduling rules.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateAvailabilityRuleDto,
  ) {
    return this.availabilityRulesService.create(tenant, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a recurring availability rule in the current tenant',
  })
  @ApiOkResponse({
    description: 'Availability rule updated successfully.',
    type: AvailabilityRuleResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the rule payload or related data.',
  })
  @ApiNotFoundResponse({
    description:
      'Availability rule, branch, service, or staff user was not found inside the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access scheduling rules.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateAvailabilityRuleDto,
  ) {
    return this.availabilityRulesService.update(tenant, id, dto);
  }
}
