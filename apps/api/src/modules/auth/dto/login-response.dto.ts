import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedUserDto } from './authenticated-user.dto';

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: '8h' })
  expiresIn!: string;

  @ApiProperty({ type: AuthenticatedUserDto })
  user!: AuthenticatedUserDto;
}
