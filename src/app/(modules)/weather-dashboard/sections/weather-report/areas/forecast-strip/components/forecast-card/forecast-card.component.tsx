import Image from "next/image";
import type { ForecastDay } from "@/app/models/weather.models";
import { formatDateLabel, formatDayLabel, weatherIconUrl } from "@/app/helpers/format.helper";
import { BaseCard } from "@/theme/components/base-card/base-card";

interface ForecastCardProps {
  day: ForecastDay;
  weekMinimum: number;
  weekMaximum: number;
}

function toPercentage(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export function ForecastCard({ day, weekMinimum, weekMaximum }: ForecastCardProps) {
  const span = weekMaximum - weekMinimum;
  const offset = span > 0 ? (day.minTemperature - weekMinimum) / span : 0;
  const width = span > 0 ? (day.maxTemperature - day.minTemperature) / span : 1;

  return (
    <BaseCard className="flex h-full flex-col items-center gap-2.5">
      <span className="text-sm font-medium text-heading">{formatDayLabel(day.date)}</span>
      <span className="text-xs text-muted">{formatDateLabel(day.date)}</span>

      {day.icon ? (
        <Image src={weatherIconUrl(day.icon)} alt="" width={56} height={56} />
      ) : null}

      <span className="text-xs capitalize text-muted">{day.description}</span>

      <span className="mt-auto flex w-full items-baseline justify-between">
        <span className="text-lg font-semibold text-heading">{day.maxTemperature}&deg;</span>
        <span className="text-sm text-muted">{day.minTemperature}&deg;</span>
      </span>

      <span className="block h-1.5 w-full rounded-full bg-track">
        <span
          className="gradient-accent block h-1.5 rounded-full"
          style={{ marginInlineStart: toPercentage(offset), width: toPercentage(width) }}
        />
      </span>
    </BaseCard>
  );
}
