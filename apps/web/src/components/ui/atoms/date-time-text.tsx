import type { Locale } from "@/i18n/config";
import { formatDateTime } from "@/lib/utils";

export function DateTimeText({
  value,
  locale,
  timeZone,
}: {
  value: string;
  locale: Locale;
  timeZone?: string | null;
}) {
  return (
    <span suppressHydrationWarning>
      {formatDateTime(value, locale, timeZone)}
    </span>
  );
}
