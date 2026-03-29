import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTenantHeader } from '../../common/tenant/api-tenant-header.decorator';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiBearerAuth('backofficeAuth')
@ApiTenantHeader()
@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List services for the current tenant backoffice context',
  })
  @ApiOkResponse({
    description: 'Tenant-scoped list of services.',
    type: ServiceResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filters or missing tenant context.',
  })
  findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListServicesQueryDto,
  ) {
    return this.servicesService.findAll(tenant, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single service for the current tenant',
  })
  @ApiOkResponse({
    description: 'Service found inside the current tenant.',
    type: ServiceResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Service not found for the current tenant.',
  })
  findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.servicesService.findOne(tenant, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a service in the current tenant',
  })
  @ApiCreatedResponse({
    description: 'Service created successfully.',
    type: ServiceResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or tenant context is missing.',
  })
  @ApiConflictResponse({
    description: 'A service slug already exists in the tenant.',
  })
  @ApiNotFoundResponse({
    description: 'Referenced branch or category does not belong to the tenant.',
  })
  create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.create(tenant, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing service in the current tenant',
  })
  @ApiOkResponse({
    description: 'Service updated successfully.',
    type: ServiceResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or tenant context is missing.',
  })
  @ApiConflictResponse({
    description: 'A service slug already exists in the tenant.',
  })
  @ApiNotFoundResponse({
    description:
      'Service, branch, or category was not found inside the current tenant.',
  })
  update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(tenant, id, dto);
  }
}
