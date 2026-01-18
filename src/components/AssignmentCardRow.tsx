import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";

interface AssignmentCardRowProps {
  assignment: Assignment;
  onClick?: () => void;
  showGrades?: boolean;
  className?: string;
}

export function AssignmentCardRow({ 
  assignment, 
  onClick, 
  showGrades = true,
  className 
}: AssignmentCardRowProps) {
  const dueDate = new Date(assignment.due_at);
  const isOverdue = isPast(dueDate) && assignment.submission_state !== "submitted" && assignment.submission_state !== "graded";

  const formatDueDate = () => {
    if (isToday(dueDate)) {
      return `Today at ${format(dueDate, "h:mm a")}`;
    }
    if (isTomorrow(dueDate)) {
      return `Tomorrow at ${format(dueDate, "h:mm a")}`;
    }
    if (isPast(dueDate)) {
      return `${formatDistanceToNow(dueDate)} ago`;
    }
    return format(dueDate, "EEE, MMM d 'at' h:mm a");
  };

  return (
    <div 
      className={cn(
        "card-interactive p-4 cursor-pointer group",
        isOverdue && "border-status-overdue/30",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <CoursePill name={assignment.course_name} color={assignment.course_color} />
            <StatusBadge 
              status={assignment.status} 
              submissionState={assignment.submission_state} 
            />
          </div>
          <h3 className="font-medium text-primary-content truncate mb-1 group-hover:text-primary transition-colors">
            {assignment.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-secondary-content">
            <span className={cn(isOverdue && "text-status-overdue")}>
              {formatDueDate()}
            </span>
            {showGrades && assignment.points_possible !== null && (
              <span className="text-muted-foreground">
                {assignment.points_possible} pts
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity btn-press"
          onClick={(e) => {
            e.stopPropagation();
            window.open(assignment.html_url, "_blank");
          }}
          aria-label="Open in Canvas"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
