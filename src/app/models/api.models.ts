export interface ApiErrorBody {
  error: string;
  code: string;
}

export interface RecentSearchesResponse {
  searches: string[];
  persistent: boolean;
}
