import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTenantHeader } from '../../common/tenant/api-tenant-header.decorator';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { CancelPublicAppointmentDto } from './dto/cancel-public-appointment.dto';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';
import { GetPublicAppointmentByCodeDto } from './dto/get-public-appointment-by-code.dto';
import { ListPublicServicesQueryDto } from './dto/list-public-services-query.dto';
import { ListPublicServiceSlotsQueryDto } from './dto/list-public-service-slots-query.dto';
import { ReschedulePublicAppointmentDto } from './dto/reschedule-public-appointment.dto';
import {
  PublicAppointmentLookupResponseDto,
  PublicAppointmentResponseDto,
  PublicServiceResponseDto,
  PublicServiceSlotResponseDto,
} from './dto/public-booking-response.dto';
import { PublicBookingService } from './public-booking.service';

@ApiTags('Public Booking')
@ApiTenantHeader()
@Controller('api/v1/public')
export class PublicBookingController {
  constructor(private readonly publicBookingService: PublicBookingService) {}

  @Get('services')
  @ApiOperation({
    summary: 'List publicly bookable services for the current tenant',
  })
  @ApiOkResponse({
    description: 'List of public services available for citizen booking.',
    type: PublicServiceResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filters or tenant context is missing.',
  })
  findServices(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListPublicServicesQueryDto,
  ) {
    return this.publicBookingService.findServices(tenant, query);
  }

  @Get('services/:id/slots')
  @ApiOperation({
    summary:
      'List public future slots for a specific service in the current tenant',
  })
  @ApiOkResponse({
    description: 'Available public slots for the requested public service.',
    type: PublicServiceSlotResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid filters, invalid date range, or missing tenant context.',
  })
  @ApiNotFoundResponse({
    description: 'Service not found for the current tenant.',
  })
  @ApiConflictResponse({
    description: 'The requested service is not available for public booking.',
  })
  findServiceSlots(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: ListPublicServiceSlotsQueryDto,
  ) {
    return this.publicBookingService.findServiceSlots(tenant, id, query);
  }

  @Post('appointments')
  @ApiOperation({
    summary: 'Create a public appointment for the current tenant',
  })
  @ApiCreatedResponse({
    description: 'Public appointment created successfully.',
    type: PublicAppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed for the booking payload, tenant context, or slot/service relationship.',
  })
  @ApiNotFoundResponse({
    description:
      'Branch, service, or slot was not found inside the resolved tenant.',
  })
  @ApiConflictResponse({
    description:
      'The service is not publicly bookable, the slot is unavailable/full, or citizen data is ambiguous.',
  })
  createAppointment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePublicAppointmentDto,
  ) {
    return this.publicBookingService.createAppointment(tenant, dto);
  }

  @Get('appointments/:code')
  @ApiOperation({
    summary: 'Lookup a public appointment by its confirmation code',
  })
  @ApiParam({
    name: 'code',
    description: 'Public appointment code received after booking.',
    example: 'APT-20260328-ABC123',
  })
  @ApiOkResponse({
    description: 'Public appointment found for the current tenant.',
    type: PublicAppointmentLookupResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid appointment code format or missing tenant context.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found for the current tenant and code.',
  })
  findAppointmentByCode(
    @CurrentTenant() tenant: TenantContext,
    @Param() params: GetPublicAppointmentByCodeDto,
  ) {
    return this.publicBookingService.findAppointmentByCode(tenant, params.code);
  }

  @Post('appointments/:code/cancel')
  @ApiOperation({
    summary: 'Cancel a public appointment using its confirmation code',
  })
  @ApiParam({
    name: 'code',
    description: 'Public appointment code received after booking.',
    example: 'APT-20260328-ABC123',
  })
  @ApiOkResponse({
    description: 'Public appointment cancelled successfully.',
    type: PublicAppointmentLookupResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid appointment code format, invalid cancellation payload, or missing tenant context.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found for the current tenant and code.',
  })
  @ApiConflictResponse({
    description:
      'The appointment is already cancelled, cannot be cancelled in its current state, or slot capacity is inconsistent.',
  })
  cancelAppointmentByCode(
    @CurrentTenant() tenant: TenantContext,
    @Param() params: GetPublicAppointmentByCodeDto,
    @Body() dto: CancelPublicAppointmentDto,
  ) {
    return this.publicBookingService.cancelAppointmentByCode(
      tenant,
      params.code,
      dto,
    );
  }

  @Post('appointments/:code/reschedule')
  @ApiOperation({
    summary: 'Reschedule a public appointment using its confirmation code',
  })
  @ApiParam({
    name: 'code',
    description: 'Public appointment code received after booking.',
    example: 'APT-20260328-ABC123',
  })
  @ApiOkResponse({
    description: 'Public appointment rescheduled successfully.',
    type: PublicAppointmentLookupResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid appointment code format, invalid reschedule payload, or the selected slot does not match the appointment.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment or target slot not found for the current tenant.',
  })
  @ApiConflictResponse({
    description:
      'The appointment cannot be rescheduled in its current state or the selected slot is unavailable/full.',
  })
  rescheduleAppointmentByCode(
    @CurrentTenant() tenant: TenantContext,
    @Param() params: GetPublicAppointmentByCodeDto,
    @Body() dto: ReschedulePublicAppointmentDto,
  ) {
    return this.publicBookingService.rescheduleAppointmentByCode(
      tenant,
      params.code,
      dto,
    );
  }
}
