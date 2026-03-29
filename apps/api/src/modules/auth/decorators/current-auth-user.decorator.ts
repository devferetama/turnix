import {
  UnauthorizedException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const CurrentAuthUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    context: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
