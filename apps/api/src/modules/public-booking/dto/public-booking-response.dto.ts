import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AppointmentSource,
  AppointmentStatus,
  ServiceMode,
  ServiceVisibility,
  SlotStatus,
} from '@prisma/client';

export class PublicBranchSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  timezone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  state!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;
}

export class PublicServiceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  categoryId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  branchId!: string | null;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: ServiceVisibility })
  visibility!: ServiceVisibility;

  @ApiProperty({ enum: ServiceMode })
  mode!: ServiceMode;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty()
  slotCapacity!: number;

  @ApiProperty()
  allowOnlineBooking!: boolean;

  @ApiProperty()
  requiresApproval!: boolean;

  @ApiPropertyOptional({
    type: PublicBranchSummaryDto,
    nullable: true,
  })
  branch!: PublicBranchSummaryDto | null;
}

export class PublicServiceSlotResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  branchId!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  staffUserId!: string | null;

  @ApiProperty({ format: 'date-time' })
  slotDate!: Date;

  @ApiProperty({ format: 'date-time' })
  startsAt!: Date;

  @ApiProperty({ format: 'date-time' })
  endsAt!: Date;

  @ApiProperty()
  capacity!: number;

  @ApiProperty()
  availableCapacity!: number;

  @ApiProperty({ enum: SlotStatus })
  status!: SlotStatus;

  @ApiProperty({ type: PublicBranchSummaryDto })
  branch!: PublicBranchSummaryDto;
}

export class PublicAppointmentCitizenSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  documentType!: string | null;

  @ApiPropertyOptional({ nullable: true })
  documentNumber!: string | null;
}

export class PublicAppointmentServiceSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ServiceMode })
  mode!: ServiceMode;

  @ApiProperty()
  durationMinutes!: number;
}

export class PublicAppointmentSlotSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  branchId!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  staffUserId!: string | null;

  @ApiProperty({ format: 'date-time' })
  slotDate!: Date;

  @ApiProperty({ format: 'date-time' })
  startsAt!: Date;

  @ApiProperty({ format: 'date-time' })
  endsAt!: Date;
}

export class PublicAppointmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: AppointmentSource })
  source!: AppointmentSource;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty({ format: 'date-time' })
  scheduledStart!: Date;

  @ApiProperty({ format: 'date-time' })
  scheduledEnd!: Date;

  @ApiPropertyOptional({ nullable: true })
  citizenNotes!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: PublicAppointmentServiceSummaryDto })
  service!: PublicAppointmentServiceSummaryDto;

  @ApiProperty({ type: PublicBranchSummaryDto })
  branch!: PublicBranchSummaryDto;

  @ApiProperty({ type: PublicAppointmentCitizenSummaryDto })
  citizen!: PublicAppointmentCitizenSummaryDto;

  @ApiProperty({ type: PublicAppointmentSlotSummaryDto })
  slot!: PublicAppointmentSlotSummaryDto;
}

export class PublicAppointmentLookupCitizenSummaryDto {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;
}

export class PublicAppointmentLookupServiceSummaryDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ServiceMode })
  mode!: ServiceMode;

  @ApiProperty()
  durationMinutes!: number;
}

export class PublicAppointmentLookupBranchSummaryDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  timezone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  state!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;
}

export class PublicAppointmentCancellationSummaryDto {
  @ApiProperty({ format: 'date-time' })
  cancelledAt!: Date;
}

export class PublicAppointmentLookupResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty({ format: 'date-time' })
  scheduledStart!: Date;

  @ApiProperty({ format: 'date-time' })
  scheduledEnd!: Date;

  @ApiProperty({
    type: PublicAppointmentLookupServiceSummaryDto,
  })
  service!: PublicAppointmentLookupServiceSummaryDto;

  @ApiProperty({
    type: PublicAppointmentLookupBranchSummaryDto,
  })
  branch!: PublicAppointmentLookupBranchSummaryDto;

  @ApiProperty({
    type: PublicAppointmentLookupCitizenSummaryDto,
  })
  citizen!: PublicAppointmentLookupCitizenSummaryDto;

  @ApiPropertyOptional({
    type: PublicAppointmentCancellationSummaryDto,
    nullable: true,
  })
  cancellation!: PublicAppointmentCancellationSummaryDto | null;
}
