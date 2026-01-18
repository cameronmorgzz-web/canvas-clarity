import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("card-matte p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-5 w-16 rounded-md" />
      </div>
      <div className="skeleton-shimmer h-5 w-3/4 rounded" />
      {[...Array(lines - 1)].map((_, i) => (
        <div key={i} className="skeleton-shimmer h-4 w-1/2 rounded" />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
