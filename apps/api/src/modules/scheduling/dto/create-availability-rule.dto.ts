import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Weekday } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsGreaterThan } from '../validators/is-greater-than.decorator';
import { IsSameOrAfter } from '../validators/is-same-or-after.decorator';

function trimNullableString({ value }: TransformFnParams) {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class CreateAvailabilityRuleDto {
  @ApiProperty({
    description: 'Branch identifier for the current tenant.',
    format: 'uuid',
  })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({
    description: 'Service identifier for the current tenant.',
    format: 'uuid',
  })
  @IsUUID('4')
  serviceId!: string;

  @ApiPropertyOptional({
    description:
      'Optional staff user identifier for a rule assigned to a specific staff member.',
    format: 'uuid',
    nullable: true,
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsUUID('4')
  staffUserId?: string | null;

  @ApiProperty({
    description: 'Weekday where this recurring rule applies.',
    enum: Weekday,
  })
  @IsEnum(Weekday)
  weekday!: Weekday;

  @ApiProperty({
    description: 'Rule start minute counted from 00:00.',
    minimum: 0,
    maximum: 1439,
    example: 540,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute!: number;

  @ApiProperty({
    description: 'Rule end minute counted from 00:00.',
    minimum: 1,
    maximum: 1440,
    example: 1020,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  @IsGreaterThan('startMinute', {
    message: 'endMinute must be greater than startMinute',
  })
  endMinute!: number;

  @ApiProperty({
    description: 'Duration of generated slots in minutes.',
    minimum: 1,
    example: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  slotDurationMinutes!: number;

  @ApiPropertyOptional({
    description: 'Capacity available for each materialized slot.',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Optional first date when the rule becomes active.',
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-04-01',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsDateString()
  validFrom?: string | null;

  @ApiPropertyOptional({
    description: 'Optional last date when the rule remains active.',
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-12-31',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsDateString()
  @IsSameOrAfter('validFrom', {
    message: 'validTo must not be before validFrom',
  })
  validTo?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the rule is currently active.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Optional internal note for scheduling operators.',
    nullable: true,
    example: 'Morning block dedicated to in-person renewals.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
