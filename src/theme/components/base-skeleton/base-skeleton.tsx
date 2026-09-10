interface BaseSkeletonProps {
  className?: string;
}

export function BaseSkeleton({ className = "h-4 w-full" }: BaseSkeletonProps) {
  return <span aria-hidden="true" className={`shimmer block rounded-tile ${className}`.trimEnd()} />;
}
