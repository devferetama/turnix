import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { IsSameOrAfter } from '../../scheduling/validators/is-same-or-after.decorator';

function trimDateString({ value }: TransformFnParams) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class ListPublicServiceSlotsQueryDto {
  @ApiPropertyOptional({
    description:
      'Lower bound for slot start. Date-only values are interpreted from 00:00:00Z.',
    type: String,
    format: 'date-time',
    example: '2026-04-01',
  })
  @Transform(trimDateString)
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description:
      'Upper bound for slot start. Date-only values are interpreted until 23:59:59.999Z.',
    type: String,
    format: 'date-time',
    example: '2026-04-30',
  })
  @Transform(trimDateString)
  @IsOptional()
  @IsDateString()
  @IsSameOrAfter('dateFrom', {
    message: 'dateTo must not be before dateFrom',
  })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Optionally restrict slots to a specific branch.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;
}
