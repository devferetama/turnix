import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

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

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Next lifecycle status for the appointment.',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @ApiPropertyOptional({
    description:
      'Optional operator note recorded in the appointment status history.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;
}
