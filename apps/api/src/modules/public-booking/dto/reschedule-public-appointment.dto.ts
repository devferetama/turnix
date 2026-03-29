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

export class ReschedulePublicAppointmentDto {
  @ApiProperty({
    description: 'Identifier of the new public slot selected by the citizen.',
    format: 'uuid',
  })
  @IsUUID('4')
  newSlotId!: string;

  @ApiPropertyOptional({
    description: 'Optional public-facing reschedule reason.',
    example: 'I need a later time on the same day.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'Optional extra details about the requested reschedule.',
    example: 'I can attend after 15:00 instead.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string | null;
}
