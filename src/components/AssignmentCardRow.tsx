import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ExternalLink, ChevronRight, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

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
  const { density, isPinned, togglePinAssignment } = useSettings();
  const dueDate = new Date(assignment.due_at);
  const isOverdue = isPast(dueDate) && assignment.submission_state !== "submitted" && assignment.submission_state !== "graded";
  const pinned = isPinned(assignment.id);
  const isCompact = density === "compact";

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

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinAssignment(assignment.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "card-interactive cursor-pointer group relative",
        isCompact ? "p-3" : "p-4",
        isOverdue && "card-overdue",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className={cn(
        "flex items-start justify-between gap-4",
        isCompact && "items-center"
      )}>
        <div className="flex-1 min-w-0">
          {/* Row 1: Pills */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CoursePill 
              name={assignment.course_name} 
              color={assignment.course_color} 
            />
            <StatusBadge 
              status={assignment.status} 
              submissionState={assignment.submission_state} 
            />
            {pinned && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Pin className="w-2.5 h-2.5" />
                Pinned
              </span>
            )}
          </div>
          
          {/* Row 2: Title */}
          <h3 className={cn(
            "font-semibold text-foreground truncate mb-1",
            "group-hover:text-primary transition-colors duration-120",
            isCompact ? "text-sm" : "text-base"
          )}>
            {assignment.name}
          </h3>
          
          {/* Row 3: Due + Points */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className={cn(
              "transition-colors duration-120",
              isOverdue && "text-status-overdue font-medium"
            )}>
              {formatDueDate()}
            </span>
            {showGrades && assignment.points_possible !== null && (
              <>
                <span className="text-border">•</span>
                <span>{assignment.points_possible} pts</span>
              </>
            )}
          </div>
        </div>
        
        {/* Action buttons - revealed on hover */}
        <div className="flex items-center gap-1 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handlePin}
              aria-label={pinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn(
                "w-3.5 h-3.5",
                pinned && "fill-primary text-primary"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                window.open(assignment.html_url, "_blank");
              }}
              aria-label="Open in Canvas"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
