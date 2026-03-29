import type { NextAuthOptions } from "next-auth";

import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { buildCredentialsProvider } from "@/modules/auth/providers/backend-credentials-provider";
import { authCallbacks } from "@/modules/auth/server/auth-callbacks";

export const authOptions: NextAuthOptions = {
  secret: env.authSecret,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: ROUTES.login,
  },
  providers: [buildCredentialsProvider()],
  callbacks: authCallbacks,
};
