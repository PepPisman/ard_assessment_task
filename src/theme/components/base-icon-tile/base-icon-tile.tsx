import type { ReactNode } from "react";

interface BaseIconTileProps {
  children: ReactNode;
  label?: string;
}

export function BaseIconTile({ children, label }: BaseIconTileProps) {
  return (
    <span
      aria-label={label}
      role={label ? "img" : undefined}
      className="gradient-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-tile text-white shadow-md"
    >
      {children}
    </span>
  );
}
