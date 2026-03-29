"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { useI18n } from "@/providers/i18n-provider";

export function AppointmentsEmptyPanel() {
  const { dictionary } = useI18n();

  return (
    <Card className="hidden xl:block">
      <CardHeader>
        <CardTitle>{dictionary.appointments.editor.emptyTitle}</CardTitle>
        <CardDescription>
          {dictionary.appointments.editor.emptyDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
          {dictionary.appointments.editor.emptyHint}
        </p>
      </CardContent>
    </Card>
  );
}
