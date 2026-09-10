import { Header } from "@/app/(shared)/header/header";
import { WeatherDashboardPage } from "@/app/(modules)/weather-dashboard/weather-dashboard.page";

export default function Home() {
  return (
    <>
      <Header />
      <WeatherDashboardPage />
    </>
  );
}
