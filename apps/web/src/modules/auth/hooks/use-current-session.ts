"use client";

import { useSession } from "next-auth/react";

export function useCurrentSession() {
  return useSession();
}
