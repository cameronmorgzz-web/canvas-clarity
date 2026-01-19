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
      className={cn(
        "relative overflow-hidden rounded-xl p-4 space-y-3",
        "bg-card/50 backdrop-blur-sm border border-border/50",
        className
      )}
    >
      {/* Glass overlay shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.03), transparent)",
        }}
      />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="skeleton-shimmer h-5 w-20 rounded-md" />
        <div className="skeleton-shimmer h-5 w-16 rounded-md" />
      </div>
      <div className="skeleton-shimmer h-5 w-3/4 rounded-md relative z-10" />
      {[...Array(lines - 1)].map((_, i) => (
        <div 
          key={i} 
          className="skeleton-shimmer h-4 rounded-md relative z-10"
          style={{ width: `${60 - i * 15}%` }}
        />
      ))}
    </motion.div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
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
          <SkeletonRow />
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl py-2.5 px-3",
      "bg-card/50 backdrop-blur-sm border border-border/50",
      "flex items-center gap-2.5"
    )}>
      {/* Glass shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.03), transparent)",
        }}
      />
      
      {/* Checkbox placeholder */}
      <div className="skeleton-shimmer h-4 w-4 rounded shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton-shimmer h-4 w-2/3 rounded" />
          <div className="skeleton-shimmer h-4 w-16 rounded" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="skeleton-shimmer h-4 w-20 rounded" />
          <div className="skeleton-shimmer h-4 w-12 rounded" />
        </div>
      </div>
      
      {/* Chevron placeholder */}
      <div className="skeleton-shimmer h-4 w-4 rounded shrink-0" />
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
          className={cn(
            "flex-1 p-3 rounded-xl h-20",
            "bg-card/50 backdrop-blur-sm border border-border/50",
            "relative overflow-hidden"
          )}
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.03), transparent)",
              animationDelay: `${i * 0.1}s`,
            }}
          />
          <div className="space-y-2 relative z-10">
            <div className="skeleton-shimmer h-3 w-8 rounded mx-auto" />
            <div className="skeleton-shimmer h-5 w-6 rounded mx-auto" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
