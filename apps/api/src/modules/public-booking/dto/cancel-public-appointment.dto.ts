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

export class CancelPublicAppointmentDto {
  @ApiPropertyOptional({
    description: 'Optional public-facing cancellation reason.',
    example: 'I am no longer able to attend.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'Optional additional details about the cancellation.',
    example: 'Please release the slot for another citizen.',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string | null;
}
