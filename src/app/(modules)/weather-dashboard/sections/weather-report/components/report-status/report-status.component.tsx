import { BaseCard } from "@/theme/components/base-card/base-card";
import { BaseIcon } from "@/theme/components/base-icon/base-icon";
import { BaseSkeleton } from "@/theme/components/base-skeleton/base-skeleton";

interface ReportStatusProps {
  variant: "idle" | "loading" | "error";
  message?: string;
}

function LoadingReport() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading weather data</span>
      <BaseCard className="flex flex-col gap-6 p-6 sm:p-7">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2.5">
            <BaseSkeleton className="h-3 w-28" />
            <BaseSkeleton className="h-8 w-48" />
            <BaseSkeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-5">
            <BaseSkeleton className="h-24 w-24 rounded-full" />
            <BaseSkeleton className="h-20 w-36" />
          </div>
        </div>
        <span className="h-px w-full bg-subtle" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <BaseSkeleton className="h-12 w-full" />
          <BaseSkeleton className="h-12 w-full" />
          <BaseSkeleton className="h-12 w-full" />
        </div>
      </BaseCard>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((slot) => (
          <BaseCard key={slot}>
            <BaseSkeleton className="h-32 w-full" />
          </BaseCard>
        ))}
      </div>
    </div>
  );
}

export function ReportStatus({ variant, message }: ReportStatusProps) {
  if (variant === "loading") {
    return <LoadingReport />;
  }

  if (variant === "error") {
    return (
      <BaseCard className="border-danger-edge p-5 sm:p-6">
        <div role="alert" className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile bg-danger-surface text-danger">
            <BaseIcon name="alert-circle" size={24} />
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-medium text-danger">We could not load that forecast</span>
            <span className="text-sm text-muted">{message}</span>
          </span>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard className="flex flex-col items-center gap-5 px-8 py-14">
      <span className="flex h-28 w-28 items-center justify-center rounded-full bg-chip text-accent">
        <BaseIcon name="cloud-sun" size={56} strokeWidth={1.3} />
      </span>
      <span className="flex flex-col items-center gap-2">
        <span className="text-[1.375rem] font-semibold text-heading">
          Search for a city to begin
        </span>
        <span className="max-w-[26rem] text-center text-[0.9375rem] text-muted text-pretty">
          Current conditions and a five-day forecast will appear here. Results are cached for ten
          minutes, so repeat lookups are instant.
        </span>
      </span>
    </BaseCard>
  );
}
