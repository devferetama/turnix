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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiTenantHeader } from '../../common/tenant/api-tenant-header.decorator';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { CurrentAuthUser } from '../auth/decorators/current-auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AppointmentsService } from './appointments.service';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@ApiTags('Appointments')
@ApiBearerAuth('backofficeAuth')
@ApiTenantHeader()
@UseGuards(JwtAuthGuard)
@Roles(
  AppRole.SUPER_ADMIN,
  AppRole.TENANT_ADMIN,
  AppRole.OPERATOR,
  AppRole.VIEWER,
)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List appointments for the current tenant backoffice context',
  })
  @ApiOkResponse({
    description: 'Tenant-scoped list of appointments.',
    type: AppointmentResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filters or missing tenant context.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access appointments.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListAppointmentsQueryDto,
  ) {
    return this.appointmentsService.findAll(tenant, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment details for the current tenant',
  })
  @ApiOkResponse({
    description: 'Appointment found inside the current tenant.',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found for the current tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to access appointments.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.appointmentsService.findOne(tenant, id);
  }

  @Post()
  @Roles(AppRole.SUPER_ADMIN, AppRole.TENANT_ADMIN, AppRole.OPERATOR)
  @ApiOperation({
    summary: 'Create an appointment in the current tenant',
  })
  @ApiCreatedResponse({
    description: 'Appointment created successfully.',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the appointment payload.',
  })
  @ApiConflictResponse({
    description:
      'The selected slot is full, unavailable, or the citizen payload is ambiguous.',
  })
  @ApiNotFoundResponse({
    description:
      'Branch, service, slot, citizen, or staff user was not found in the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to create appointments.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentAuthUser() user: AuthenticatedUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(tenant, user, dto);
  }

  @Patch(':id/status')
  @Roles(AppRole.SUPER_ADMIN, AppRole.TENANT_ADMIN, AppRole.OPERATOR)
  @ApiOperation({
    summary: 'Update the lifecycle status of an appointment',
  })
  @ApiOkResponse({
    description: 'Appointment status updated successfully.',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the status payload.',
  })
  @ApiConflictResponse({
    description:
      'The requested status transition is not allowed for the current appointment state.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found for the current tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to update appointment status.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @CurrentAuthUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(tenant, user, id, dto);
  }

  @Post(':id/cancel')
  @Roles(AppRole.SUPER_ADMIN, AppRole.TENANT_ADMIN, AppRole.OPERATOR)
  @ApiOperation({
    summary: 'Cancel an appointment and release the reserved slot capacity',
  })
  @ApiOkResponse({
    description: 'Appointment cancelled successfully.',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the cancellation payload.',
  })
  @ApiConflictResponse({
    description:
      'The appointment cannot be cancelled in its current state or the slot reservation is inconsistent.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found for the current tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to cancel appointments.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  cancel(
    @CurrentTenant() tenant: TenantContext,
    @CurrentAuthUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(tenant, user, id, dto);
  }

  @Post(':id/reschedule')
  @Roles(AppRole.SUPER_ADMIN, AppRole.TENANT_ADMIN, AppRole.OPERATOR)
  @ApiOperation({
    summary:
      'Reschedule an appointment to a new slot and keep capacity consistent',
  })
  @ApiOkResponse({
    description: 'Appointment rescheduled successfully.',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed for the reschedule payload or the selected slot does not match the appointment.',
  })
  @ApiConflictResponse({
    description:
      'The appointment cannot be rescheduled in its current state, the selected slot is unavailable/full, or slot counters are inconsistent.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment or target slot not found for the current tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required to reschedule appointments.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have the required role.',
  })
  reschedule(
    @CurrentTenant() tenant: TenantContext,
    @CurrentAuthUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(tenant, user, id, dto);
  }
}
