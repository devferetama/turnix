import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Weekday } from '@prisma/client';

export class AvailabilityRuleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ format: 'uuid' })
  branchId!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  staffUserId!: string | null;

  @ApiProperty({ enum: Weekday })
  weekday!: Weekday;

  @ApiProperty()
  startMinute!: number;

  @ApiProperty()
  endMinute!: number;

  @ApiProperty()
  slotDurationMinutes!: number;

  @ApiProperty()
  capacity!: number;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  validFrom!: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  validTo!: Date | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
