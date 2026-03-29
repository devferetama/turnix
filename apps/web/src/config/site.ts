import type { Metadata } from "next";

import { env } from "@/config/env";
import type { Dictionary } from "@/i18n/get-dictionary";

export const siteConfig = {
  name: "Turnix",
  shortName: "Turnix",
  description:
    "Turnix is a multi-tenant SaaS platform for appointment booking, scheduling, queues, and service-attention operations.",
  url: env.appUrl,
  defaultLocale: "es",
} as const;

export function createBaseMetadata(dictionary: Dictionary): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: dictionary.metadata.description,
    applicationName: siteConfig.name,
    referrer: "origin-when-cross-origin",
    openGraph: {
      type: "website",
      title: siteConfig.name,
      description: dictionary.metadata.description,
      siteName: siteConfig.name,
      url: siteConfig.url,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: dictionary.metadata.description,
    },
  };
}
