import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-border border-t-primary",
        sizeClass,
        className,
      )}
    />
  );
}
