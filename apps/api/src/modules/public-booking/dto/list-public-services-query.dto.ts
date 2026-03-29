import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

function trimQueryValue({ value }: TransformFnParams) {
  const input: unknown = value;

  if (typeof input !== 'string') {
    return input;
  }

  const normalized = input.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class ListPublicServicesQueryDto {
  @ApiPropertyOptional({
    description: 'Optionally restrict public services to a specific branch.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Optionally restrict public services to a specific category.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Search public services by name or slug.',
    example: 'licencia',
  })
  @Transform(trimQueryValue)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;
}
