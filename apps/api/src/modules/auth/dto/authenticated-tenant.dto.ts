import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedTenantDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  timezone!: string;

  @ApiProperty()
  isActive!: boolean;
}
