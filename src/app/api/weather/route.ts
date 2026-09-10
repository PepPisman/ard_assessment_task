import { errorResponse } from "@/app/helpers/api-response.helper";
import { WeatherApiError, getWeather } from "@/app/services/openweather/openweather.api";
import { recordSearch } from "@/app/services/recent-searches/recent-searches.api";

const MAX_CITY_LENGTH = 100;

export async function GET(request: Request): Promise<Response> {
  const city = new URL(request.url).searchParams.get("city")?.trim() ?? "";

  if (!city || city.length > MAX_CITY_LENGTH) {
    return errorResponse(new WeatherApiError(400, "invalid_city", "Please enter a city name."));
  }

  try {
    const weather = await getWeather(city);
    await recordSearch(city);

    return Response.json(weather);
  } catch (error) {
    return errorResponse(error);
  }
}
