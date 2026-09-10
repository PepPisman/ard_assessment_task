import { afterEach, describe, expect, test } from "bun:test";
import { readGeoCity } from "@/app/helpers/geo.helper";

function headersWithCity(city: string): Headers {
  return new Headers({ "x-vercel-ip-city": city });
}

describe("readGeoCity", () => {
  afterEach(() => {
    delete process.env.GEO_FALLBACK_CITY;
  });

  test("reads the city Vercel resolved from the request IP", () => {
    expect(readGeoCity(headersWithCity("Amman"))).toBe("Amman");
  });

  test("decodes the percent-encoding Vercel applies to non-ascii names", () => {
    expect(readGeoCity(headersWithCity("S%C3%A3o%20Paulo"))).toBe("São Paulo");
  });

  test("returns null rather than throwing on a malformed header", () => {
    expect(readGeoCity(headersWithCity("%E0%A4%A"))).toBeNull();
  });

  test("returns null when the platform sent no city", () => {
    expect(readGeoCity(new Headers())).toBeNull();
    expect(readGeoCity(headersWithCity("   "))).toBeNull();
  });

  test("falls back to the configured city so local development can exercise the path", () => {
    process.env.GEO_FALLBACK_CITY = "Amman";

    expect(readGeoCity(new Headers())).toBe("Amman");
  });

  test("prefers the real header over the development fallback", () => {
    process.env.GEO_FALLBACK_CITY = "Amman";

    expect(readGeoCity(headersWithCity("Reykjavik"))).toBe("Reykjavik");
  });
});
