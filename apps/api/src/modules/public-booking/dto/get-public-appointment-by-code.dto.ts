import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

function normalizeCode({ value }: TransformFnParams) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();

  return normalized.length > 0 ? normalized : undefined;
}

export class GetPublicAppointmentByCodeDto {
  @ApiProperty({
    description: 'Public appointment code returned after booking confirmation.',
    example: 'APT-20260328-ABC123',
  })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'code must contain only letters, numbers, and hyphens',
  })
  code!: string;
}
