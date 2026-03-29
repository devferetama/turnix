import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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

export class CreatePublicAppointmentDto {
  @ApiProperty({
    description: 'Publicly bookable service identifier.',
    format: 'uuid',
  })
  @IsUUID('4')
  serviceId!: string;

  @ApiProperty({
    description: 'Branch identifier where the citizen wants to be attended.',
    format: 'uuid',
  })
  @IsUUID('4')
  branchId!: string;

  @ApiProperty({
    description: 'Materialized slot identifier selected by the citizen.',
    format: 'uuid',
  })
  @IsUUID('4')
  slotId!: string;

  @ApiProperty({
    description: 'Citizen first name.',
    example: 'Ana',
  })
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  firstName!: string;

  @ApiProperty({
    description: 'Citizen last name.',
    example: 'Gonzalez',
  })
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Citizen email used for confirmation and deduplication.',
    example: 'ana.gonzalez@example.com',
  })
  @Transform(normalizeEmail)
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    description: 'Citizen phone number.',
    example: '+56911112222',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(60)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Document type used for deduplication when available.',
    example: 'RUT',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string | null;

  @ApiPropertyOptional({
    description: 'Document number used for deduplication when available.',
    example: '12.345.678-9',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  documentNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Optional note entered by the citizen during booking.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  citizenNotes?: string | null;
}
