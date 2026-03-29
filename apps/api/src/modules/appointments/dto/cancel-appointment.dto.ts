import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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

export class CancelAppointmentDto {
  @ApiPropertyOptional({
    description: 'High-level cancellation reason shown in backoffice context.',
    example: 'Citizen requested cancellation',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'Optional additional cancellation details.',
    example: 'Citizen called to confirm they cannot attend the appointment.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string | null;
}
