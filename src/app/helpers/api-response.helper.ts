import type { ApiErrorBody } from "@/app/models/api.models";
import { WeatherApiError } from "@/app/services/openweather/openweather.api";

export function errorResponse(error: unknown): Response {
  if (error instanceof WeatherApiError) {
    const body: ApiErrorBody = { error: error.message, code: error.code };

    return Response.json(body, { status: error.status });
  }

  console.error("Unhandled API error", error);

  const body: ApiErrorBody = {
    error: "Something went wrong. Please try again.",
    code: "internal_error",
  };

  return Response.json(body, { status: 500 });
}
