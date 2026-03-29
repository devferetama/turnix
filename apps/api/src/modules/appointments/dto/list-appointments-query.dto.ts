import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function trimQueryValue({ value }: TransformFnParams) {
  const input: unknown = value;

  if (typeof input !== 'string') {
    return input;
  }

  const normalized = input.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter appointments by lifecycle status.',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter appointments by service identifier.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Filter appointments by branch identifier.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Filter appointments by citizen identifier.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  citizenId?: string;

  @ApiPropertyOptional({
    description:
      'Lower bound for scheduled start. Date-only values are interpreted from 00:00:00Z.',
    type: String,
    format: 'date-time',
    example: '2026-04-01',
  })
  @Transform(trimQueryValue)
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description:
      'Upper bound for scheduled start. Date-only values are interpreted until 23:59:59.999Z.',
    type: String,
    format: 'date-time',
    example: '2026-04-30',
  })
  @Transform(trimQueryValue)
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Text search across appointment code and citizen data.',
    example: 'gonzalez',
  })
  @Transform(trimQueryValue)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;
}
