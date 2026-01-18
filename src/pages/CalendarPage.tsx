import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, List, Grid } from "lucide-react";
import { fetchCalendar, fetchUpcoming } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import type { CalendarEvent, Assignment } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList, SkeletonCard } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "agenda" | "month";

export default function CalendarPage() {
  const { refreshInterval } = useSettings();
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

  // Combine all assignments
  const allAssignments = useMemo(() => {
    if (!upcoming) return [];
    return [
      ...upcoming.overdue,
      ...upcoming.due_today,
      ...upcoming.due_soon,
      ...upcoming.this_week,
    ].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }, [upcoming]);

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-content mb-2">Calendar</h1>
          <p className="text-secondary-content">Your schedule at a glance.</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("agenda")}
            className={cn(
              "px-3",
              viewMode === "agenda" && "bg-card"
            )}
          >
            <List className="w-4 h-4 mr-2" />
            Agenda
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("month")}
            className={cn(
              "px-3",
              viewMode === "month" && "bg-card"
            )}
          >
            <Grid className="w-4 h-4 mr-2" />
            Month
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorBanner 
          message="Couldn't load calendar"
          onRetry={() => refetch()}
        />
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <div className="card-matte p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-primary-content">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground py-2">
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
                    "aspect-square p-1 rounded-lg transition-all btn-press",
                    "flex flex-col items-center justify-start gap-1",
                    isToday(day) && "border border-primary/30 bg-primary/5",
                    isSelected && "bg-primary/20 border-primary/50",
                    !isToday(day) && !isSelected && "hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) ? "text-primary" : "text-primary-content"
                  )}>
                    {format(day, "d")}
                  </span>
                  {assignments.length > 0 && (
                    <div className="flex gap-0.5">
                      {assignments.slice(0, 3).map((a, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: a.course_color || "#4DA3FF" }}
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
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-primary-content mb-4">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              {getAssignmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
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
        </div>
      )}

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <div className="space-y-6">
          {isLoading ? (
            <SkeletonList count={5} />
          ) : Object.keys(groupedByDate).length > 0 ? (
            Object.entries(groupedByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, assignments]) => (
                <div key={dateKey} className="animate-fade-in">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-20 bg-background/80 backdrop-blur-sm py-2 z-10">
                    {format(new Date(dateKey), "EEEE, MMMM d")}
                  </h3>
                  <div className="space-y-3">
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
        </div>
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
