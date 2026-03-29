import { Search } from "lucide-react";

import { Input } from "@/components/ui/atoms/input";
import { cn } from "@/lib/utils";

export function SearchInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-10" type="search" {...props} />
    </div>
  );
}
