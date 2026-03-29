import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import type { TenantContext } from '../../common/tenant/tenant-context.interface';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthJwtPayload } from './interfaces/auth-jwt-payload.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { comparePassword } from './utils/password.util';

const authenticatedUserSelect = Prisma.validator<Prisma.StaffUserSelect>()({
  id: true,
  tenantId: true,
  branchId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  tenant: {
    select: {
      id: true,
      slug: true,
      name: true,
      timezone: true,
      isActive: true,
    },
  },
});

const loginUserSelect = Prisma.validator<Prisma.StaffUserSelect>()({
  ...authenticatedUserSelect,
  passwordHash: true,
});

type AuthenticatedStaffUserRecord = Prisma.StaffUserGetPayload<{
  select: typeof authenticatedUserSelect;
}>;

type LoginStaffUserRecord = Prisma.StaffUserGetPayload<{
  select: typeof loginUserSelect;
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(tenant: TenantContext, dto: LoginDto) {
    const user = await this.validateCredentials(
      tenant.tenantId,
      dto.email,
      dto.password,
    );
    const payload: AuthJwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '8h',
      user,
    };
  }

  getCurrentUser(user: AuthenticatedUser) {
    return user;
  }

  async validateAccessTokenUser(
    payload: AuthJwtPayload,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.staffUser.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        isActive: true,
        tenant: {
          isActive: true,
        },
      },
      select: authenticatedUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.mapAuthenticatedUser(user);
  }

  private async validateCredentials(
    tenantId: string,
    email: string,
    password: string,
  ) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.prisma.staffUser.findFirst({
      where: {
        tenantId,
        isActive: true,
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
        tenant: {
          isActive: true,
        },
      },
      select: loginUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.mapAuthenticatedUser(user);
  }

  private mapAuthenticatedUser(
    user: AuthenticatedStaffUserRecord | LoginStaffUserRecord,
  ): AuthenticatedUser {
    return {
      id: user.id,
      tenantId: user.tenantId,
      branchId: user.branchId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
        timezone: user.tenant.timezone,
        isActive: user.tenant.isActive,
      },
    };
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
