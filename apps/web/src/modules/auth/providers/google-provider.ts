import GoogleProvider from "next-auth/providers/google";

import { env, isGoogleAuthEnabled } from "@/config/env";

export function buildGoogleProvider() {
  if (!isGoogleAuthEnabled()) {
    return null;
  }

  return GoogleProvider({
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
      },
    },
  });
}
