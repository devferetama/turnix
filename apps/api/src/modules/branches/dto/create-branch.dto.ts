import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

function trimString({ value }: TransformFnParams) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function normalizeSlug({ value }: TransformFnParams) {
  return typeof value === 'string' ? value.trim().toLowerCase() : undefined;
}

export class CreateBranchDto {
  @ApiProperty({
    description: 'Tenant-scoped unique slug used to identify the branch.',
    example: 'downtown-office',
  })
  @Transform(normalizeSlug)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiProperty({
    description: 'Backoffice display name of the branch.',
    example: 'Downtown Office',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional backoffice description for the branch.',
    example: 'Main branch for in-person citizen support.',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional IANA timezone for this branch.',
    example: 'America/Santiago',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Primary address line.',
    example: '123 Main Street',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Secondary address line.',
    example: 'Floor 2, Suite B',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'City where the branch is located.',
    example: 'Santiago',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({
    description: 'State, region, or province.',
    example: 'Metropolitan Region',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @ApiPropertyOptional({
    description: 'Country where the branch is located.',
    example: 'Chile',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @ApiPropertyOptional({
    description: 'Postal code for the branch address.',
    example: '8320000',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Whether the branch is active in backoffice operations.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
