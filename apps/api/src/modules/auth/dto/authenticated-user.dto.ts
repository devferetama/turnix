import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { AuthenticatedTenantDto } from './authenticated-tenant.dto';

export class AuthenticatedUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  branchId!: string | null;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: AppRole })
  role!: AppRole;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: AuthenticatedTenantDto })
  tenant!: AuthenticatedTenantDto;
}
