import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";
import { staggerItem, cardHover, cardTap } from "@/lib/animations";

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
    <motion.div 
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={cardHover}
      whileTap={cardTap}
      className={cn(
        "card-matte p-4 cursor-pointer group relative overflow-hidden",
        isOverdue && "card-overdue",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {/* Course color accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ 
          backgroundColor: assignment.course_color || "hsl(var(--primary))",
          boxShadow: `0 0 12px 0 ${assignment.course_color || "hsl(var(--primary))"}40`,
        }}
      />
      
      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CoursePill name={assignment.course_name} color={assignment.course_color} />
            <StatusBadge 
              status={assignment.status} 
              submissionState={assignment.submission_state} 
            />
          </div>
          <h3 className="font-semibold text-primary-content truncate mb-1.5 group-hover:text-primary transition-colors duration-200">
            {assignment.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-secondary-content">
            <span className={cn(
              "transition-colors duration-200",
              isOverdue && "text-status-overdue font-medium"
            )}>
              {formatDueDate()}
            </span>
            {showGrades && assignment.points_possible !== null && (
              <span className="text-muted-foreground">
                {assignment.points_possible} pts
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons - revealed on hover */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                window.open(assignment.html_url, "_blank");
              }}
              aria-label="Open in Canvas"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </motion.div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
