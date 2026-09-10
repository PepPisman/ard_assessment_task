import type { GeoResponse } from "@/app/models/api.models";
import { readGeoCity } from "@/app/helpers/geo.helper";

export async function GET(request: Request): Promise<Response> {
  const body: GeoResponse = { city: readGeoCity(request.headers) };

  return Response.json(body);
}
