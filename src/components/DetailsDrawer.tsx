import { format, isPast, isToday, isTomorrow } from "date-fns";
import { X, ExternalLink, Calendar, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { StatusBadge } from "./StatusBadge";
import { CoursePill } from "./CoursePill";
import { Button } from "@/components/ui/button";
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
  if (!assignment) return null;

  const dueDate = new Date(assignment.due_at);
  const isOverdue = isPast(dueDate) && assignment.submission_state !== "submitted" && assignment.submission_state !== "graded";

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
        className="w-full sm:max-w-lg bg-card border-border"
        data-drawer-close
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <CoursePill name={assignment.course_name} color={assignment.course_color} />
            <StatusBadge 
              status={assignment.status} 
              submissionState={assignment.submission_state} 
            />
          </div>
          <SheetTitle className="text-xl text-primary-content">
            {assignment.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Due Date */}
          <div className="flex items-start gap-3">
            <Calendar className={cn(
              "w-5 h-5 mt-0.5",
              isOverdue ? "text-status-overdue" : "text-muted-foreground"
            )} />
            <div>
              <div className="text-sm text-muted-foreground">Due</div>
              <div className={cn(
                "font-medium",
                isOverdue ? "text-status-overdue" : "text-primary-content"
              )}>
                {formatDueDate()}
              </div>
            </div>
          </div>

          {/* Course */}
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Course</div>
              <div className="font-medium text-primary-content">
                {assignment.course_name}
              </div>
            </div>
          </div>

          {/* Points */}
          {assignment.points_possible !== null && (
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Points</div>
                <div className="font-medium text-primary-content">
                  {assignment.points_possible} points possible
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {assignment.description && (
            <div className="pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">Description</div>
              <p className="text-sm text-secondary-content leading-relaxed">
                {assignment.description}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full btn-press mt-4"
            onClick={() => window.open(assignment.html_url, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Canvas
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
