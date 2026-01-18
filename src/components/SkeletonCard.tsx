import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { iosEase } from "@/lib/animations";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("card-matte p-4 space-y-3", className)}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-5 w-20 rounded-md" />
        <div className="skeleton-shimmer h-5 w-16 rounded-md" />
      </div>
      <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
      {[...Array(lines - 1)].map((_, i) => (
        <div 
          key={i} 
          className="skeleton-shimmer h-4 rounded-md"
          style={{ width: `${60 - i * 15}%` }}
        />
      ))}
    </motion.div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: i * 0.05,
            duration: 0.3,
            ease: iosEase,
          }}
        >
          <SkeletonCard lines={2} />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonWeekStrip() {
  return (
    <div className="flex gap-2">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03, duration: 0.2 }}
          className="flex-1 p-3 rounded-xl skeleton-shimmer h-24"
        />
      ))}
    </div>
  );
}
