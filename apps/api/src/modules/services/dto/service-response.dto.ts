import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceMode, ServiceVisibility } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

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
  bufferBeforeMinutes!: number;

  @ApiProperty()
  bufferAfterMinutes!: number;

  @ApiProperty()
  slotCapacity!: number;

  @ApiProperty()
  allowOnlineBooking!: boolean;

  @ApiProperty()
  requiresApproval!: boolean;

  @ApiProperty()
  requiresAuthentication!: boolean;

  @ApiProperty()
  allowsCancellation!: boolean;

  @ApiProperty()
  allowsReschedule!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
