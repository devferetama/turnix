import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiTenantHeader } from '../../common/tenant/api-tenant-header.decorator';
import { CurrentTenant } from '../../common/tenant/current-tenant.decorator';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { CurrentAuthUser } from './decorators/current-auth-user.decorator';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@ApiTenantHeader()
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate an internal backoffice staff user',
  })
  @ApiOkResponse({
    description: 'Credentials accepted and access token issued.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the login payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid or the account is inactive.',
  })
  login(@CurrentTenant() tenant: TenantContext, @Body() dto: LoginDto) {
    return this.authService.login(tenant, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('backofficeAuth')
  @ApiOperation({
    summary: 'Get the current authenticated backoffice user',
  })
  @ApiOkResponse({
    description: 'Current authenticated user context.',
    type: AuthenticatedUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or mismatched.',
  })
  me(@CurrentAuthUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user);
  }
}
