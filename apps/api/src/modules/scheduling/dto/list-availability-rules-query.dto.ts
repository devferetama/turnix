import { ApiPropertyOptional } from '@nestjs/swagger';
import { Weekday } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';

function toBoolean({ value }: TransformFnParams): boolean | string | undefined {
  const input: unknown = value;

  if (input === 'true') {
    return true;
  }

  if (input === 'false') {
    return false;
  }

  if (typeof input === 'boolean') {
    return input;
  }

  return typeof input === 'string' ? input : undefined;
}

function trimNullableString({ value }: TransformFnParams): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class ListAvailabilityRulesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter rules by branch identifier.',
    format: 'uuid',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Filter rules by service identifier.',
    format: 'uuid',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsUUID('4')
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Filter rules by staff user identifier.',
    format: 'uuid',
  })
  @Transform(trimNullableString)
  @IsOptional()
  @IsUUID('4')
  staffUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter rules by weekday.',
    enum: Weekday,
  })
  @IsOptional()
  @IsEnum(Weekday)
  weekday?: Weekday;

  @ApiPropertyOptional({
    description: 'Filter rules by active state.',
    type: Boolean,
  })
  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
