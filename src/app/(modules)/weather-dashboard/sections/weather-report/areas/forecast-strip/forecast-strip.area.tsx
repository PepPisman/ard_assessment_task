"use client";

import { useWeatherSearchState } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.context";
import { ForecastCard } from "@/app/(modules)/weather-dashboard/sections/weather-report/areas/forecast-strip/components/forecast-card/forecast-card.component";

export function ForecastStripArea() {
  const { weather } = useWeatherSearchState();

  if (!weather || weather.forecast.length === 0) {
    return null;
  }

  const weekMinimum = Math.min(...weather.forecast.map((day) => day.minTemperature));
  const weekMaximum = Math.max(...weather.forecast.map((day) => day.maxTemperature));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-medium text-heading">Five-day forecast</h3>
        <p className="text-xs text-muted">
          Bars span each day&rsquo;s low to high across {weekMinimum}&deg; to {weekMaximum}&deg;
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {weather.forecast.map((day) => (
          <li key={day.date}>
            <ForecastCard day={day} weekMinimum={weekMinimum} weekMaximum={weekMaximum} />
          </li>
        ))}
      </ul>
    </div>
  );
}
