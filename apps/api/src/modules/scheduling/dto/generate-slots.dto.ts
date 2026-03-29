import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsDateString, Matches } from 'class-validator';
import { IsSameOrAfter } from '../validators/is-same-or-after.decorator';

function trimDateString({ value }: TransformFnParams): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class GenerateSlotsDto {
  @ApiProperty({
    description: 'First calendar date to generate slots for.',
    type: String,
    format: 'date',
    example: '2026-04-01',
  })
  @Transform(trimDateString)
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fromDate must be provided as YYYY-MM-DD',
  })
  fromDate!: string;

  @ApiProperty({
    description: 'Last calendar date to generate slots for.',
    type: String,
    format: 'date',
    example: '2026-04-07',
  })
  @Transform(trimDateString)
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toDate must be provided as YYYY-MM-DD',
  })
  @IsSameOrAfter('fromDate', {
    message: 'toDate must not be before fromDate',
  })
  toDate!: string;
}
