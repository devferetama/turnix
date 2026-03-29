import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

function mapUserToken(user: User, token: JWT): JWT {
  return {
    ...token,
    sub: user.id ?? token.sub,
    email: user.email ?? token.email,
    name: user.name ?? token.name,
    role: user.role ?? token.role ?? "VIEWER",
    tenantId: user.tenantId ?? token.tenantId,
    branchId: user.branchId ?? token.branchId,
    firstName: user.firstName ?? token.firstName,
    lastName: user.lastName ?? token.lastName,
    tenant: user.tenant ?? token.tenant,
    accessToken: user.accessToken ?? token.accessToken,
    expiresAt: user.expiresAt ?? token.expiresAt,
  };
}

function mapSession(session: Session, token: JWT): Session {
  if (!token.sub || !token.email) {
    return session;
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: token.sub,
      email: token.email,
      name: token.name ?? undefined,
      role: token.role ?? "VIEWER",
      tenantId: token.tenantId,
      branchId: token.branchId,
      firstName: token.firstName,
      lastName: token.lastName,
      tenant: token.tenant,
    },
    accessToken: token.accessToken,
    error: token.error,
  };
}

export const authCallbacks: NonNullable<NextAuthOptions["callbacks"]> = {
  async jwt({ token, user }) {
    if (user) {
      return mapUserToken(user, token);
    }

    return token;
  },
  async session({ session, token }) {
    return mapSession(session, token);
  },
};
