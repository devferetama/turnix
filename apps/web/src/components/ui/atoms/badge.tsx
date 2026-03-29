import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-surface text-foreground",
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  outline: "border border-border bg-background text-muted-foreground",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
