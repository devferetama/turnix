import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

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

export class ListBranchesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter branches by active state.',
    type: Boolean,
  })
  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Text search across branch name and slug.',
    example: 'downtown',
  })
  @Transform(trimSearch)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
