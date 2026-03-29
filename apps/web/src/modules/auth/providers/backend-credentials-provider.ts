import CredentialsProvider from "next-auth/providers/credentials";

import { mapAuthenticatedSessionToAuthUser } from "@/modules/auth/mappers/session.mapper";
import { authenticateWithBackend } from "@/modules/auth/server/backend-auth.server";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";

export function buildCredentialsProvider() {
  return CredentialsProvider({
    id: "credentials",
    name: "Turnix credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        return null;
      }

      try {
        const session = await authenticateWithBackend({
          email: credentials.email,
          password: credentials.password,
        });

        return mapAuthenticatedSessionToAuthUser(session);
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error) ?? "Unable to sign in with these credentials.",
        );
      }
    },
  });
}
