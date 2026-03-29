import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceVisibility } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function toBoolean({ value }: TransformFnParams) {
  const input: unknown = value;

  if (input === 'true') {
    return true;
  }

  if (input === 'false') {
    return false;
  }

  return input;
}

function trimSearch({ value }: TransformFnParams) {
  const input: unknown = value;

  if (typeof input !== 'string') {
    return input;
  }

  const normalized = input.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class ListServicesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter services by active state.',
    type: Boolean,
  })
  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter services by visibility.',
    enum: ServiceVisibility,
  })
  @IsOptional()
  @IsEnum(ServiceVisibility)
  visibility?: ServiceVisibility;

  @ApiPropertyOptional({
    description: 'Filter by service category identifier.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by branch identifier.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Text search across service name and slug.',
    example: 'license',
  })
  @Transform(trimSearch)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
