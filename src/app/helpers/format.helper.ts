const OWM_ICON_BASE_URL = "https://openweathermap.org/img/wn";

export function weatherIconUrl(icon: string): string {
  return `${OWM_ICON_BASE_URL}/${icon}@2x.png`;
}

export function formatDayLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
}

export function formatDateLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatObservedAt(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
}

export function formatCityLabel(city: string): string {
  return city
    .split(/([\s-])/)
    .map((part) => (/^[\s-]$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}
