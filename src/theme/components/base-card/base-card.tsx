import type { ReactNode } from "react";

interface BaseCardProps {
  children: ReactNode;
  className?: string;
}

export function BaseCard({ children, className = "" }: BaseCardProps) {
  return (
    <div
      className={`glass-surface rounded-card border border-subtle p-4 ${className}`.trimEnd()}
    >
      {children}
    </div>
  );
}
