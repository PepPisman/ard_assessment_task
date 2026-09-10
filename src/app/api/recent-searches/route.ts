import type { RecentSearchesResponse } from "@/app/models/api.models";
import {
  getRecentSearches,
  isUsingFallbackStore,
} from "@/app/services/recent-searches/recent-searches.api";

export async function GET(): Promise<Response> {
  const searches = await getRecentSearches();

  const body: RecentSearchesResponse = {
    searches,
    persistent: !isUsingFallbackStore(),
  };

  return Response.json(body);
}
