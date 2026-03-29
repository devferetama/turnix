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
import { BranchesService } from './branches.service';
import { BranchResponseDto } from './dto/branch-response.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ListBranchesQueryDto } from './dto/list-branches-query.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('Branches')
@ApiBearerAuth('backofficeAuth')
@ApiTenantHeader()
@Controller('api/v1/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({
    summary: 'List branches for the current tenant backoffice context',
  })
  @ApiOkResponse({
    description: 'Tenant-scoped list of branches.',
    type: BranchResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filters or missing tenant context.',
  })
  findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListBranchesQueryDto,
  ) {
    return this.branchesService.findAll(tenant, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single branch for the current tenant',
  })
  @ApiOkResponse({
    description: 'Branch found inside the current tenant.',
    type: BranchResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Branch not found for the current tenant.',
  })
  findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.branchesService.findOne(tenant, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a branch in the current tenant',
  })
  @ApiCreatedResponse({
    description: 'Branch created successfully.',
    type: BranchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or tenant context is missing.',
  })
  @ApiConflictResponse({
    description: 'A branch slug already exists in the tenant.',
  })
  create(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(tenant, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing branch in the current tenant',
  })
  @ApiOkResponse({
    description: 'Branch updated successfully.',
    type: BranchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or tenant context is missing.',
  })
  @ApiConflictResponse({
    description: 'A branch slug already exists in the tenant.',
  })
  @ApiNotFoundResponse({
    description: 'Branch not found inside the current tenant.',
  })
  update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(tenant, id, dto);
  }
}
