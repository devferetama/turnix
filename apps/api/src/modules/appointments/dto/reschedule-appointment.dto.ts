import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'Identifier of the new materialized slot for the appointment.',
    format: 'uuid',
  })
  @IsUUID('4')
  newSlotId!: string;

  @ApiPropertyOptional({
    description: 'Optional high-level reason for the reschedule action.',
    example: 'Citizen requested a different time',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'Optional additional reschedule details.',
    example: 'The original slot conflicted with another municipal procedure.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string | null;
}
