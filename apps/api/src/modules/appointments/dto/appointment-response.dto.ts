import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AppointmentSource,
  AppointmentStatus,
  AppRole,
  ServiceMode,
  ServiceVisibility,
  SlotStatus,
} from '@prisma/client';

export class AppointmentBranchSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
}

export class AppointmentServiceSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ServiceVisibility })
  visibility!: ServiceVisibility;

  @ApiProperty({ enum: ServiceMode })
  mode!: ServiceMode;

  @ApiProperty()
  durationMinutes!: number;
}

export class AppointmentCitizenSummaryDto {
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

export class AppointmentStaffUserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  branchId!: string | null;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: AppRole })
  role!: AppRole;
}

export class AppointmentSlotSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'date-time' })
  slotDate!: Date;

  @ApiProperty({ format: 'date-time' })
  startsAt!: Date;

  @ApiProperty({ format: 'date-time' })
  endsAt!: Date;

  @ApiProperty()
  capacity!: number;

  @ApiProperty()
  reservedCount!: number;

  @ApiProperty({ enum: SlotStatus })
  status!: SlotStatus;

  @ApiProperty({ format: 'uuid' })
  branchId!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  staffUserId!: string | null;
}

export class AppointmentStatusHistoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  appointmentId!: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, nullable: true })
  fromStatus!: AppointmentStatus | null;

  @ApiProperty({ enum: AppointmentStatus })
  toStatus!: AppointmentStatus;

  @ApiPropertyOptional({ nullable: true })
  note!: string | null;

  @ApiPropertyOptional({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  metadata!: Record<string, unknown> | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  changedByStaffUserId!: string | null;

  @ApiProperty({ format: 'date-time' })
  changedAt!: Date;

  @ApiPropertyOptional({
    type: AppointmentStaffUserSummaryDto,
    nullable: true,
  })
  changedByStaffUser?: AppointmentStaffUserSummaryDto | null;
}

export class AppointmentCancellationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  appointmentId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  cancelledByStaffUserId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  details!: string | null;

  @ApiProperty({ format: 'date-time' })
  cancelledAt!: Date;

  @ApiPropertyOptional({
    type: AppointmentStaffUserSummaryDto,
    nullable: true,
  })
  cancelledByStaffUser?: AppointmentStaffUserSummaryDto | null;
}

export class AppointmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ format: 'uuid' })
  branchId!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiProperty({ format: 'uuid' })
  citizenId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  staffUserId!: string | null;

  @ApiProperty({ format: 'uuid' })
  slotId!: string;

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

  @ApiPropertyOptional({ nullable: true })
  internalNotes!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  checkedInAt!: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  completedAt!: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: AppointmentBranchSummaryDto })
  branch!: AppointmentBranchSummaryDto;

  @ApiProperty({ type: AppointmentServiceSummaryDto })
  service!: AppointmentServiceSummaryDto;

  @ApiProperty({ type: AppointmentCitizenSummaryDto })
  citizen!: AppointmentCitizenSummaryDto;

  @ApiProperty({ type: AppointmentSlotSummaryDto })
  slot!: AppointmentSlotSummaryDto;

  @ApiPropertyOptional({
    type: AppointmentStaffUserSummaryDto,
    nullable: true,
  })
  staffUser!: AppointmentStaffUserSummaryDto | null;

  @ApiPropertyOptional({
    type: AppointmentCancellationResponseDto,
    nullable: true,
  })
  cancellation?: AppointmentCancellationResponseDto | null;

  @ApiPropertyOptional({
    type: AppointmentStatusHistoryResponseDto,
    isArray: true,
  })
  statusHistory?: AppointmentStatusHistoryResponseDto[];
}
