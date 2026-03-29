import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AppointmentSource } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

function trimString({ value }: TransformFnParams) {
  return typeof value === 'string' ? value.trim() : undefined;
}

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

function normalizeEmail({ value }: TransformFnParams) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  return normalized.length > 0 ? normalized : undefined;
}

export class AppointmentCitizenInputDto {
  @ApiProperty({
    description: 'Citizen first name used when creating or matching a citizen.',
    example: 'Ana',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName!: string;

  @ApiProperty({
    description: 'Citizen last name used when creating or matching a citizen.',
    example: 'Gonzalez',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Optional citizen email used for create-or-find matching.',
    example: 'ana.gonzalez@example.com',
  })
  @Transform(normalizeEmail)
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    description: 'Optional citizen phone number.',
    example: '+56911112222',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(60)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Optional document type used for create-or-find matching.',
    example: 'RUT',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string | null;

  @ApiPropertyOptional({
    description: 'Optional document number used for create-or-find matching.',
    example: '12.345.678-9',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  documentNumber?: string | null;
}

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Branch identifier for the appointment.',
    format: 'uuid',
  })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({
    description: 'Service identifier for the appointment.',
    format: 'uuid',
  })
  @IsUUID('4')
  serviceId!: string;

  @ApiProperty({
    description: 'Materialized time slot identifier selected for the booking.',
    format: 'uuid',
  })
  @IsUUID('4')
  slotId!: string;

  @ApiPropertyOptional({
    description: 'Existing citizen identifier inside the current tenant.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  citizenId?: string;

  @ApiPropertyOptional({
    description:
      'Citizen payload used when booking for a citizen that does not yet have a selected identifier.',
    type: AppointmentCitizenInputDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentCitizenInputDto)
  citizen?: AppointmentCitizenInputDto;

  @ApiPropertyOptional({
    description:
      'Optional staff user assigned to the appointment. If omitted, the slot staff assignment is used when present.',
    format: 'uuid',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsUUID('4')
  staffUserId?: string | null;

  @ApiPropertyOptional({
    description: 'Source that originated the appointment.',
    enum: AppointmentSource,
    default: AppointmentSource.STAFF,
  })
  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @ApiPropertyOptional({
    description: 'Optional note provided by the citizen or captured by staff.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  citizenNotes?: string | null;

  @ApiPropertyOptional({
    description: 'Optional internal backoffice note.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string | null;
}

export class UpdateCitizenInputDto extends PartialType(
  AppointmentCitizenInputDto,
) {}
