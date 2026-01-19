import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ExternalLink, ChevronRight, Pin, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";
import { useSettings } from "@/hooks/use-settings";
import { useToastActions } from "@/hooks/use-toast-actions";

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
  const { density, isPinned, togglePinAssignment, isCompleted, toggleCompleteAssignment, uncompleteAssignment } = useSettings();
  const { showPinned, showCompleted } = useToastActions();
  const dueDate = new Date(assignment.due_at);
  const isOverdue = isPast(dueDate) && assignment.submission_state !== "submitted" && assignment.submission_state !== "graded";
  const pinned = isPinned(assignment.id);
  const completed = isCompleted(assignment.id);
  const isCompact = density === "compact";

  const formatDueDate = () => {
    if (isToday(dueDate)) {
      return format(dueDate, "h:mm a");
    }
    if (isTomorrow(dueDate)) {
      return `Tomorrow ${format(dueDate, "h:mm a")}`;
    }
    if (isPast(dueDate)) {
      return `${formatDistanceToNow(dueDate)} ago`;
    }
    return format(dueDate, "EEE, MMM d");
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = !pinned;
    togglePinAssignment(assignment.id);
    showPinned(newPinned);
  };

  const handleCheckboxChange = (newCompleted: boolean) => {
    toggleCompleteAssignment(assignment.id);
    showCompleted(newCompleted, newCompleted ? () => uncompleteAssignment(assignment.id) : undefined);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ 
        y: -1,
        transition: { duration: 0.1 }
      }}
      whileTap={{ scale: 0.998 }}
      className={cn(
        "card-interactive cursor-pointer group relative",
        isCompact ? "py-2 px-2.5" : "py-2.5 px-3",
        isOverdue && !completed && "card-overdue",
        completed && "opacity-50",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-center gap-2.5">
        {/* Animated Checkbox */}
        <div onClick={handleCheckboxClick} className="shrink-0">
          <AnimatedCheckbox 
            checked={completed}
            onCheckedChange={handleCheckboxChange}
            size={isCompact ? "sm" : "default"}
          />
        </div>

        {/* Main Content - 2 Row Layout */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Row 1: Title + Due/Points */}
          <div className="flex items-center justify-between gap-3">
            <h3 className={cn(
              "font-medium text-foreground truncate flex-1",
              "group-hover:text-primary transition-colors duration-100",
              isCompact ? "text-[13px]" : "text-sm",
              completed && "line-through text-muted-foreground"
            )}>
              {assignment.name}
            </h3>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Due Date Chip */}
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded",
                isOverdue && !completed 
                  ? "bg-status-overdue-bg text-status-overdue" 
                  : isToday(dueDate) 
                    ? "bg-status-today-bg text-status-today"
                    : "bg-muted/50 text-muted-foreground"
              )}>
                <Clock3 className="w-2.5 h-2.5" />
                {formatDueDate()}
              </span>
              
              {/* Points */}
              {showGrades && assignment.points_possible !== null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {assignment.points_possible} pts
                </span>
              )}
            </div>
          </div>
          
          {/* Row 2: Course + Status + Indicators */}
          <div className="flex items-center gap-1.5">
            <CoursePill 
              name={assignment.course_name} 
              color={assignment.course_color}
              size="sm"
            />
            <StatusBadge 
              status={assignment.status} 
              submissionState={assignment.submission_state}
              size="sm"
            />
            {pinned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Pin className="w-2.5 h-2.5 text-primary fill-primary" />
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Hover Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded"
              onClick={handlePin}
              aria-label={pinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn(
                "w-3 h-3",
                pinned && "fill-primary text-primary"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded"
              onClick={(e) => {
                e.stopPropagation();
                window.open(assignment.html_url, "_blank");
              }}
              aria-label="Open in Canvas"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors ml-1" />
        </div>
      </div>
    </motion.div>
  );
}
