import { Label } from "@/components/ui/atoms/label";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </Label>
        {hint ? (
          <span className="text-xs font-medium text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
