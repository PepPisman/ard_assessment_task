import { CitySearchSection } from "@/app/(modules)/weather-dashboard/sections/city-search/city-search.section";
import { WeatherReportSection } from "@/app/(modules)/weather-dashboard/sections/weather-report/weather-report.section";
import { WeatherSearchProvider } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.context";

export function WeatherDashboardPage() {
  return (
    <WeatherSearchProvider>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <CitySearchSection />
        <WeatherReportSection />
      </main>
    </WeatherSearchProvider>
  );
}
