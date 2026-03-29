"use client";

import Link from "next/link";

import { useI18n } from "@/providers/i18n-provider";

export default function NotFound() {
  const { dictionary } = useI18n();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-lg rounded-[2rem] border border-border/80 bg-card p-10 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          {dictionary.common.messages.routeNotFound}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {dictionary.common.messages.routeNotFoundTitle}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {dictionary.common.messages.routeNotFoundDescription}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {dictionary.common.actions.goHome}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            {dictionary.common.actions.openDashboard}
          </Link>
        </div>
      </div>
    </main>
  );
}
