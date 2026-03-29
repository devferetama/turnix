import { ServiceMode, ServiceVisibility } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function trimString({ value }: TransformFnParams) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function normalizeSlug({ value }: TransformFnParams) {
  return typeof value === 'string' ? value.trim().toLowerCase() : undefined;
}

export class CreateServiceDto {
  @ApiPropertyOptional({
    description: 'Service category identifier for the current tenant.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Branch identifier for the current tenant.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiProperty({
    description:
      'Tenant-scoped unique slug used by backoffice and future public listings.',
    example: 'drivers-license-renewal',
  })
  @Transform(normalizeSlug)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiProperty({
    description: 'Backoffice display name of the service.',
    example: 'Driver license renewal',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional backoffice description.',
    example: 'Renew an existing driver license at the branch office.',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: ServiceVisibility,
    default: ServiceVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(ServiceVisibility)
  visibility?: ServiceVisibility;

  @ApiPropertyOptional({
    enum: ServiceMode,
    default: ServiceMode.IN_PERSON,
  })
  @IsOptional()
  @IsEnum(ServiceMode)
  mode?: ServiceMode;

  @ApiProperty({
    description: 'Primary appointment duration in minutes.',
    minimum: 1,
    example: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @ApiPropertyOptional({
    description: 'Minutes blocked before each appointment.',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bufferBeforeMinutes?: number;

  @ApiPropertyOptional({
    description: 'Minutes blocked after each appointment.',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bufferAfterMinutes?: number;

  @ApiPropertyOptional({
    description: 'Default slot capacity for this service.',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  slotCapacity?: number;

  @ApiPropertyOptional({
    description: 'Whether the service can be booked online.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowOnlineBooking?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this service requires manual approval.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Whether authentication is required before booking.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresAuthentication?: boolean;

  @ApiPropertyOptional({
    description: 'Whether booked appointments can be cancelled.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowsCancellation?: boolean;

  @ApiPropertyOptional({
    description: 'Whether booked appointments can be rescheduled.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowsReschedule?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the service is active in backoffice lists.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
