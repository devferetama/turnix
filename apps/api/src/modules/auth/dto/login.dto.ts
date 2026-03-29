import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@turnix.local',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'ChangeMe123!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
