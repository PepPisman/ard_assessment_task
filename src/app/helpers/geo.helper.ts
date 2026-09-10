const GEO_CITY_HEADER = "x-vercel-ip-city";

function decodeCity(raw: string): string | null {
  try {
    return decodeURIComponent(raw).trim() || null;
  } catch {
    return null;
  }
}

export function readGeoCity(headers: Headers): string | null {
  const header = headers.get(GEO_CITY_HEADER)?.trim();

  if (header) {
    return decodeCity(header);
  }

  return process.env.GEO_FALLBACK_CITY?.trim() || null;
}
