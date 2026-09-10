# Weather Dashboard

Search any city and see its current conditions plus a five-day forecast. Built with Next.js 16 (App Router), Bun and TypeScript.

## Quick start

```bash
bun install
cp .env.example .env      # then paste your OpenWeatherMap key
bun run dev
```

Open <http://localhost:3000>.

A free API key comes from <https://openweathermap.org/api>. A newly created key can return 401 for up to two hours while it activates — that is the key warming up, not a bug in the app.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENWEATHER_API_KEY` | yes | Server-side key for the OpenWeatherMap current-weather and forecast endpoints. Never exposed to the browser. |

### Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Development server on the Bun runtime |
| `bun run build` | Production build |
| `bun test` | Unit and integration tests |
| `bun run lint` | ESLint |

## Architecture

The codebase follows the **FFD (Frontend For Dummies)** screen-based hierarchy: the folder tree mirrors the UI tree, so a reviewer can find any piece of the screen by walking the folders.

```
Module → Page → Section → Area → (Segment)
```

- **Page** — Section container. No business logic.
- **Section** — orchestrator. Owns state, contains Areas.
- **Area** — the doer. Holds the real implementation and may call APIs.
- **Segment** — optional split of a large Area. Not needed at this size.

```
src/
├── app/
│   ├── (modules)/weather-dashboard/
│   │   ├── weather-dashboard.page.tsx
│   │   ├── state-management/weather-search/     actions, reducer, models, context
│   │   └── sections/
│   │       ├── city-search/areas/search-input/  + components/suggestion-list
│   │       └── weather-report/
│   │           ├── areas/current-conditions/
│   │           ├── areas/forecast-strip/        + components/forecast-card
│   │           └── components/report-status/    idle, loading and error states
│   ├── (shared)/header/sections/header-main/areas/{logo,theme-toggle}
│   ├── api/{weather,recent-searches}/route.ts   Route Handlers
│   ├── services/
│   │   ├── openweather/    server → OpenWeatherMap, plus raw response models
│   │   ├── recent-searches/ server-side store
│   │   └── weather/        browser → our own API
│   ├── helpers/            cache, formatting, API error responses
│   └── models/             normalized app-facing types
├── state-management/context-creator.tsx         generic reducer-context factory
└── theme/components/base-*/                     UI primitives, zero business logic
```

Two FFD rules are enforced throughout: **entities on the same level never import each other**, and **props are not used in the architectural chain** — Sections and Areas communicate through the reducer context created by `context-creator.tsx`. Props are used only for leaf components such as `forecast-card` and for the `theme/` primitives, which sit outside the chain.

### Why the module page is not called `page.tsx`

A `page.tsx` inside `(modules)/weather-dashboard/` would have created a real `/weather-dashboard` route. The module page is `weather-dashboard.page.tsx` — FFD's own dot convention — and `src/app/page.tsx` renders it, so the dashboard stays at `/` with no duplicate route. The build output confirms only `/`, `/api/weather` and `/api/recent-searches` exist.

### Server vs Client Components

`layout.tsx`, `page.tsx`, the header and the logo area are **Server Components** — they hold no interactivity, so they ship no JavaScript. The interactive boundary starts at `weather-dashboard.page.tsx`, which provides the reducer context, and at the theme toggle. Pushing the boundary as deep as possible keeps the static shell out of the client bundle while still allowing the search and results to be fully interactive.

### Separation of raw and normalized types

OpenWeatherMap's wire format (`main.temp`, `wind.speed`, `dt_txt`, …) is described by the `Owm*` interfaces in `services/openweather/models/` and never leaves the service layer. Everything downstream consumes our own `CurrentWeather` / `ForecastDay` / `WeatherResponse` types. Swapping weather providers means rewriting one mapper, not the UI.

### Caching

A module-level `Map<normalizedCityKey, { data, expiresAt }>` with a 10-minute TTL. The key is normalized (lowercased, trimmed, inner whitespace collapsed), so `London`, `london` and `  LONDON  ` are one cache entry. Responses carry a `cached` boolean and the UI says so when a result came from cache.

Next.js Route Handlers are uncached by default in this version, which is what we want — the cache lives in one explicit place rather than being split between the framework and our code.

### Error handling

`WeatherApiError` carries a `status` and a machine-readable `code`, mapped once in the service layer:

| Condition | Response |
|---|---|
| Unknown city (upstream 404) | `404 city_not_found` |
| Upstream rate limit | `429 rate_limited` |
| Network failure or timeout | `503 upstream_unavailable` |
| Missing or rejected API key | `500 configuration_error` |

The 401 case deliberately returns a **generic** message. The client is never told anything about the key. Requests also carry an 8-second `AbortController` timeout so a hanging upstream cannot hang the route.

### Recent searches, and an honest trade-off

The last **five** searched cities are stored server-side in **Bun's built-in SQLite**.

The database path branches by environment: `./data/recent.db` locally, `/tmp/recent.db` on Vercel, because Vercel Functions have a read-only filesystem apart from `/tmp`.

**The trade-off:** `/tmp` is ephemeral and per-instance. In production the recent-searches list can reset between requests or differ across concurrent instances. This is accepted deliberately — the brief allows a JSON file or Bun SQLite and states no external database is required, so adding Vercel KV or Upstash would be complexity the brief explicitly doesn't ask for. The `/api/recent-searches` response exposes a `persistent` flag so the behaviour is observable rather than hidden.

There is a second subtlety worth stating plainly. `bun:sqlite` only exists on the Bun runtime, and **Vercel Functions run Node.js by default**. `vercel.json` opts into Vercel's Bun runtime with `"bunVersion": "1.4.x"`, and the dev/build scripts use `bun run --bun next …` as those docs require. That runtime is in public beta. If it is unavailable, the store loads `bun:sqlite` through a dynamic import inside a try/catch and falls back to an in-memory array — the app keeps working and only the persistence bonus is lost. Both paths are exercised: the test suite writes a real SQLite file under Bun, and the store degrades cleanly under Node.

### Design system

The visual language — glassmorphic cards, the blue-to-cyan accent gradient, the slate typography — is expressed as Tailwind v4 `@theme` tokens in `globals.css` rather than hard-coded per component.

| Token | Value |
|---|---|
| page background | `rgb(248 249 250)` |
| card surface | `rgb(255 255 255 / 0.8)` + `backdrop-filter: saturate(200%) blur(1.875rem)` |
| heading / muted text | `rgb(52 71 103)` / `rgb(103 116 142)` |
| accent gradient | `linear-gradient(310deg, rgb(33 82 255), rgb(33 212 253))` |

Dark mode swaps those variables behind a `.dark` class on `<html>`, so no component restyles itself. A small inline script applies the stored preference before first paint to avoid a flash of the wrong theme.

Interface icons are drawn as inline SVG on a 24px grid by a single `base-icon` primitive, so they inherit `currentColor` and stay crisp at any size. Weather-condition icons remain OpenWeatherMap's own artwork, which distinguishes far more conditions than a hand-drawn set would.

Each forecast card carries a bar spanning that day's low to high, positioned against the whole five-day range. It is one element inside a track — no charting dependency — and it makes the week's shape readable at a glance rather than forcing a comparison of ten numbers.

## Testing

```bash
bun test
```

31 tests via Bun's built-in runner — no extra test framework. They target the logic most likely to break rather than happy-path rendering:

- **Cache** — hit before expiry, miss after it, and that key normalization collapses casing and padding.
- **Error mapping** — every upstream status maps to the right code, the 401 path leaks neither the key nor the phrase "api key", and an empty city short-circuits before any upstream call.
- **Normalization** — raw OWM payloads become our types, and 3-hourly slots bucket into days using the reading nearest midday rather than whichever slot came first.
- **Recent searches** — the list is capped at five, normalizes before storing, and ignores blank input.

## What I would improve given more time

- **Geolocation on first visit.** The API takes a city name; supporting coordinates means an extra route parameter and a permission-request UX worth doing properly rather than rushing.
- **A shared cache across instances.** The in-memory cache and `/tmp` SQLite are both per-instance. Redis or Vercel KV would make both correct in a multi-instance deployment.
- **Component tests.** Current coverage is server-side logic. The search interaction, suggestion list and state transitions deserve tests with a DOM testing library.
- **Debounced live suggestions.** Suggestions currently filter the recent-search list; a geocoding autocomplete would help first-time users with an empty history.
- **Richer forecast.** The range bars show each day in isolation; a continuous trend line across the five days, plus an hourly breakdown per day, would use data the API already returns.
- **Request coalescing.** Two simultaneous requests for an uncached city both hit upstream. Storing the in-flight promise in the cache would collapse them into one.
