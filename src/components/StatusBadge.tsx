import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "overdue" | "due_today" | "due_soon" | "future";
  submissionState: "not_submitted" | "submitted" | "missing" | "graded";
  size?: "sm" | "default";
  className?: string;
}

export function StatusBadge({ status, submissionState, size = "default", className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    // Submission state takes priority for display
    if (submissionState === "graded") {
      return { label: "Graded", variant: "status-graded" };
    }
    if (submissionState === "submitted") {
      return { label: "Submitted", variant: "status-submitted" };
    }
    if (submissionState === "missing") {
      return { label: "Missing", variant: "status-missing" };
    }

    // Otherwise use due status
    switch (status) {
      case "overdue":
        return { label: "Overdue", variant: "status-overdue" };
      case "due_today":
        return { label: "Today", variant: "status-today" };
      case "due_soon":
        return { label: "Soon", variant: "status-soon" };
      default:
        return { label: "Upcoming", variant: "bg-muted/50 text-muted-foreground border-border-subtle" };
    }
  };

  const { label, variant } = getStatusConfig();
  const isUrgent = status === "overdue" || submissionState === "missing";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "status-pill",
        variant,
        size === "sm" && "px-1.5 py-0 text-[10px]",
        className
      )}
    >
      {isUrgent && (
        <motion.span
          className={cn(
            "rounded-full bg-current",
            size === "sm" ? "w-1 h-1 mr-1" : "w-1.5 h-1.5 mr-1.5"
          )}
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      {label}
    </motion.span>
  );
}
