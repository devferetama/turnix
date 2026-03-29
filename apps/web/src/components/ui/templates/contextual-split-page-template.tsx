import { cn } from "@/lib/utils";

export function ContextualSplitPageTemplate({
  children,
  panel,
  gridClassName,
  panelClassName,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
  gridClassName?: string;
  panelClassName?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]",
        gridClassName,
      )}
    >
      <div className="min-w-0 space-y-6">{children}</div>
      <aside
        className={cn("min-w-0 xl:sticky xl:top-6 xl:self-start", panelClassName)}
      >
        {panel}
      </aside>
    </div>
  );
}
