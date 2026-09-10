"use client";

import { useWeatherSearchState } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.context";
import { CurrentConditionsArea } from "@/app/(modules)/weather-dashboard/sections/weather-report/areas/current-conditions/current-conditions.area";
import { ForecastStripArea } from "@/app/(modules)/weather-dashboard/sections/weather-report/areas/forecast-strip/forecast-strip.area";
import { ReportStatus } from "@/app/(modules)/weather-dashboard/sections/weather-report/components/report-status/report-status.component";

export function WeatherReportSection() {
  const { status, errorMessage } = useWeatherSearchState();

  return (
    <section aria-labelledby="weather-report-heading" className="w-full">
      <h2 id="weather-report-heading" className="sr-only">
        Weather report
      </h2>

      {status === "idle" ? <ReportStatus variant="idle" /> : null}
      {status === "loading" ? <ReportStatus variant="loading" /> : null}
      {status === "error" ? <ReportStatus variant="error" message={errorMessage} /> : null}

      {status === "success" ? (
        <div className="flex flex-col gap-6">
          <CurrentConditionsArea />
          <ForecastStripArea />
        </div>
      ) : null}
    </section>
  );
}
