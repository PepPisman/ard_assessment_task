export interface ApiErrorBody {
  error: string;
  code: string;
}

export interface RecentSearchesResponse {
  searches: string[];
  persistent: boolean;
}

export interface GeoResponse {
  city: string | null;
}
