import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, List, Grid3X3 } from "lucide-react";
import { fetchUpcoming } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import type { Assignment } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "agenda" | "month";

export default function CalendarPage() {
  const { refreshInterval, completedAssignments } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>("agenda");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { 
    data: upcoming, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ["upcoming", "calendar"],
    queryFn: () => fetchUpcoming(30),
    refetchInterval: refreshInterval,
  });

  // Combine all assignments and filter out completed
  const allAssignments = useMemo(() => {
    if (!upcoming) return [];
    return [
      ...upcoming.overdue,
      ...upcoming.due_today,
      ...upcoming.due_soon,
      ...upcoming.this_week,
    ]
      .filter(a => !completedAssignments.includes(a.id))
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }, [upcoming, completedAssignments]);

  // Group by date for agenda view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Assignment[]> = {};
    allAssignments.forEach((assignment) => {
      const dateKey = format(new Date(assignment.due_at), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(assignment);
    });
    return groups;
  }, [allAssignments]);

  // Days in month grid
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  // Get assignments for a specific date
  const getAssignmentsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return groupedByDate[dateKey] || [];
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Your schedule at a glance.</p>
        </div>
        
        {/* View Toggle */}
        <div className="segmented-control">
          <button
            onClick={() => setViewMode("agenda")}
            data-active={viewMode === "agenda"}
            className="segmented-control-item text-xs flex items-center gap-1.5"
          >
            <List className="w-3.5 h-3.5" />
            Agenda
          </button>
          <button
            onClick={() => setViewMode("month")}
            data-active={viewMode === "month"}
            className="segmented-control-item text-xs flex items-center gap-1.5"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Month
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <ErrorBanner 
          message="Couldn't load calendar"
          onRetry={() => refetch()}
        />
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
          className="card-matte p-5"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-2xs text-muted-foreground py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {daysInMonth.map((day) => {
              const assignments = getAssignmentsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-1.5 rounded-lg transition-all duration-120",
                    "flex flex-col items-center justify-start gap-1",
                    isToday(day) && "bg-primary/10 border border-primary/25",
                    isSelected && "bg-primary/20 border-primary/40",
                    !isToday(day) && !isSelected && "hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isToday(day) ? "text-primary" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  {assignments.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {assignments.slice(0, 3).map((a, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: a.course_color || "hsl(var(--primary))" }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Assignments */}
          {selectedDate && (
            <div className="mt-5 pt-5 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              {getAssignmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getAssignmentsForDate(selectedDate).map((assignment) => (
                    <AssignmentCardRow
                      key={assignment.id}
                      assignment={assignment}
                      onClick={() => handleAssignmentClick(assignment)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing due on this day.</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
          className="space-y-5"
        >
          {isLoading ? (
            <SkeletonList count={5} />
          ) : Object.keys(groupedByDate).length > 0 ? (
            Object.entries(groupedByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, assignments]) => (
                <div key={dateKey}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 sticky top-14 bg-background/90 backdrop-blur-sm py-2 z-10">
                    {format(new Date(dateKey), "EEEE, MMMM d")}
                  </h3>
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <AssignmentCardRow
                        key={assignment.id}
                        assignment={assignment}
                        onClick={() => handleAssignmentClick(assignment)}
                      />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <EmptyStateCard 
              type="caught-up" 
              title="Calendar is clear"
              description="No upcoming assignments"
            />
          )}
        </motion.div>
      )}

      {/* Details Drawer */}
      <DetailsDrawer
        assignment={selectedAssignment}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
