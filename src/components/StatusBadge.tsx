import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "overdue" | "due_today" | "due_soon" | "future";
  submissionState: "not_submitted" | "submitted" | "missing" | "graded";
  className?: string;
}

export function StatusBadge({ status, submissionState, className }: StatusBadgeProps) {
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
        return { label: "Due Today", variant: "status-today" };
      case "due_soon":
        return { label: "Due Soon", variant: "status-soon" };
      default:
        return { label: "Upcoming", variant: "bg-muted text-muted-foreground" };
    }
  };

  const { label, variant } = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variant,
        className
      )}
    >
      {label}
    </span>
  );
}
