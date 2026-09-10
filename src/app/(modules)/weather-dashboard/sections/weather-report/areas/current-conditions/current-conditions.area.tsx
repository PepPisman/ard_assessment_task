"use client";

import Image from "next/image";
import { useWeatherSearchState } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.context";
import { formatObservedAt, weatherIconUrl } from "@/app/helpers/format.helper";
import { BaseCard } from "@/theme/components/base-card/base-card";
import { BaseIcon, type IconName } from "@/theme/components/base-icon/base-icon";
import { BaseIconTile } from "@/theme/components/base-icon-tile/base-icon-tile";

interface MetricProps {
  label: string;
  value: string;
  icon: IconName;
}

function Metric({ label, value, icon }: MetricProps) {
  return (
    <div className="flex items-center gap-3">
      <BaseIconTile>
        <BaseIcon name={icon} size={22} />
      </BaseIconTile>
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted">
          {label}
        </span>
        <span className="text-xl font-medium text-heading">{value}</span>
      </span>
    </div>
  );
}

export function CurrentConditionsArea() {
  const { weather } = useWeatherSearchState();

  if (!weather) {
    return null;
  }

  const { current, cached } = weather;

  return (
    <BaseCard className="flex flex-col gap-6 p-6 sm:p-7">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-eyebrow">Current conditions</span>
          <h3 className="flex items-baseline gap-2.5">
            <span className="text-display">{current.city}</span>
            <span className="text-sm font-medium tracking-[0.04em] text-muted">
              {current.country}
            </span>
          </h3>
          <p className="text-[0.9375rem] capitalize text-muted">{current.description}</p>
          <p className="text-xs text-muted">Observed {formatObservedAt(current.observedAt)}</p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end sm:gap-5">
          {current.icon ? (
            <Image src={weatherIconUrl(current.icon)} alt="" width={96} height={96} priority />
          ) : null}
          <span className="flex flex-col items-end gap-0.5">
            <span className="flex items-start">
              <span className="text-hero">{current.temperature}</span>
              <span className="ml-1 text-3xl font-normal leading-tight text-muted">&deg;C</span>
            </span>
            <span className="text-[0.8125rem] text-muted">Feels like {current.feelsLike}&deg;</span>
          </span>
        </div>
      </div>

      <span className="h-px w-full bg-subtle" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Metric label="Feels like" value={`${current.feelsLike}°C`} icon="thermometer" />
        <Metric label="Humidity" value={`${current.humidity}%`} icon="droplet" />
        <Metric label="Wind" value={`${current.windSpeed} m/s`} icon="wind" />
      </div>

      {cached ? (
        <p className="text-xs text-muted">
          Served from cache &mdash; refreshed at most every 10 minutes.
        </p>
      ) : null}
    </BaseCard>
  );
}
