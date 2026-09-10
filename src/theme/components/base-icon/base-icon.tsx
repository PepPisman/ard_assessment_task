import type { ReactNode } from "react";

export type IconName =
  | "cloud-sun"
  | "search"
  | "moon"
  | "sun"
  | "thermometer"
  | "droplet"
  | "wind"
  | "clock"
  | "alert-circle"
  | "alert-triangle";

interface BaseIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const PATHS: Record<IconName, ReactNode> = {
  "cloud-sun": (
    <>
      <path d="M8 6.2a3.6 3.6 0 0 1 6.9 1.3" />
      <path d="M15.6 4.1v1.6" />
      <path d="M19.4 7.9h-1.6" />
      <path d="m18.4 5.1-1.1 1.1" />
      <path d="M7.5 19.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.1 3 3 0 0 0 .3 5.9Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3.2v2" />
      <path d="M12 18.8v2" />
      <path d="M3.2 12h2" />
      <path d="M18.8 12h2" />
      <path d="m5.9 5.9 1.4 1.4" />
      <path d="m16.7 16.7 1.4 1.4" />
      <path d="m18.1 5.9-1.4 1.4" />
      <path d="m7.3 16.7-1.4 1.4" />
    </>
  ),
  thermometer: (
    <>
      <path d="M10 13.6V5.2a2 2 0 1 1 4 0v8.4a4 4 0 1 1-4 0Z" />
      <path d="M12 9.6v5.2" />
    </>
  ),
  droplet: <path d="M12 3.4 6.9 9.5a7 7 0 1 0 10.2 0Z" />,
  wind: (
    <>
      <path d="M3 8.4h9.2a3 3 0 1 0-3-3" />
      <path d="M3 15.6h13.2a3 3 0 1 1-3 3" />
      <path d="M3 12h16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5" />
      <path d="M12 16h.01" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 4.5 3.5 19h17L12 4.5Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
};

export function BaseIcon({ name, size = 20, strokeWidth = 1.75, className = "" }: BaseIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
