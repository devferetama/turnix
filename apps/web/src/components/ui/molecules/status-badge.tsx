"use client";

import { Badge } from "@/components/ui/atoms/badge";
import { useI18n } from "@/providers/i18n-provider";

const statusVariants: Record<
  string,
  "primary" | "secondary" | "success" | "warning" | "danger" | "outline"
> = {
  pending: "warning",
  confirmed: "success",
  checked_in: "secondary",
  in_progress: "primary",
  completed: "primary",
  cancelled: "danger",
  no_show: "outline",
  rescheduled: "secondary",
  open: "success",
  full: "warning",
  blocked: "danger",
  active: "success",
  inactive: "outline",
};

export function StatusBadge({ status }: { status: string }) {
  const { dictionary } = useI18n();
  const normalizedStatus = status.trim().toLowerCase();
  const label =
    dictionary.common.statuses[
      normalizedStatus as keyof typeof dictionary.common.statuses
    ] ?? status.replaceAll("_", " ");

  return (
    <Badge
      variant={statusVariants[normalizedStatus] ?? "secondary"}
      className="capitalize"
    >
      {label}
    </Badge>
  );
}
