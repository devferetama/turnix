import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";

export default async function BookingLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const { dictionary } = await getRequestDictionary();

  return (
    <>
      <BookingPageTemplate className="pb-0">
        <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {dictionary.booking.flow.title}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {dictionary.booking.flow.steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[1.25rem] border border-border/70 bg-surface px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {dictionary.booking.flow.stepLabel} {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </BookingPageTemplate>
      {children}
      {modal}
    </>
  );
}
