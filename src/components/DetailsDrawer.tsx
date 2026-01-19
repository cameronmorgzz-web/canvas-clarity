import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ExternalLink, Calendar, BookOpen, Award, Pin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useToastActions } from "@/hooks/use-toast-actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DetailsDrawerProps {
  assignment: Assignment | null;
  open: boolean;
  onClose: () => void;
}

export function DetailsDrawer({ assignment, open, onClose }: DetailsDrawerProps) {
  const { isPinned, togglePinAssignment, isCompleted, toggleCompleteAssignment, uncompleteAssignment } = useSettings();
  const { showPinned, showCompleted } = useToastActions();
  
  if (!assignment) return null;

  const dueDate = new Date(assignment.due_at);
  const isOverdue = isPast(dueDate) && assignment.submission_state !== "submitted" && assignment.submission_state !== "graded";
  const pinned = isPinned(assignment.id);
  const completed = isCompleted(assignment.id);

  const handlePin = () => {
    const newPinned = !pinned;
    togglePinAssignment(assignment.id);
    showPinned(newPinned);
  };

  const handleComplete = () => {
    const newCompleted = !completed;
    toggleCompleteAssignment(assignment.id);
    showCompleted(newCompleted, newCompleted ? () => uncompleteAssignment(assignment.id) : undefined);
    if (newCompleted) {
      onClose();
    }
  };

  const formatDueDate = () => {
    if (isToday(dueDate)) {
      return `Today at ${format(dueDate, "h:mm a")}`;
    }
    if (isTomorrow(dueDate)) {
      return `Tomorrow at ${format(dueDate, "h:mm a")}`;
    }
    return format(dueDate, "EEEE, MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent 
        className="w-full sm:max-w-md bg-card border-l border-border p-0 overflow-hidden"
        data-drawer-close
      >
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <SheetHeader className="text-left space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CoursePill name={assignment.course_name} color={assignment.course_color} />
              <StatusBadge 
                status={assignment.status} 
                submissionState={assignment.submission_state} 
              />
              {completed && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                  <Check className="w-2.5 h-2.5" />
                  Done
                </span>
              )}
            </div>
            <SheetTitle className={cn(
              "text-xl font-semibold text-foreground leading-tight",
              completed && "line-through text-muted-foreground"
            )}>
              {assignment.name}
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Due Date */}
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              isOverdue && !completed ? "bg-status-overdue-bg" : "bg-muted/50"
            )}>
              <Calendar className={cn(
                "w-4 h-4",
                isOverdue && !completed ? "text-status-overdue" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Due</div>
              <div className={cn(
                "font-medium text-sm",
                isOverdue && !completed ? "text-status-overdue" : "text-foreground"
              )}>
                {formatDueDate()}
              </div>
            </div>
          </div>

          {/* Course */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Course</div>
              <div className="font-medium text-sm text-foreground">
                {assignment.course_name}
              </div>
            </div>
          </div>

          {/* Points */}
          {assignment.points_possible !== null && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Points</div>
                <div className="font-medium text-sm text-foreground">
                  {assignment.points_possible} points possible
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {assignment.description && (
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Description</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {assignment.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              className={cn(
                "flex-shrink-0",
                completed && "bg-green-500/10 border-green-500/30 text-green-500"
              )}
            >
              <Check className={cn("w-4 h-4 mr-1.5", completed && "fill-current")} />
              {completed ? "Done" : "Complete"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePin}
              className={cn(
                "flex-shrink-0",
                pinned && "bg-primary/10 border-primary/30 text-primary"
              )}
            >
              <Pin className={cn("w-4 h-4 mr-1.5", pinned && "fill-current")} />
              {pinned ? "Pinned" : "Pin"}
            </Button>
            <Button
              className="flex-1 btn-press"
              size="sm"
              onClick={() => window.open(assignment.html_url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Open in Canvas
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
