import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, List, Grid3X3, CalendarDays } from "lucide-react";
import { fetchUpcoming } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import { useCalendarKeyboard } from "@/hooks/use-calendar-keyboard";
import type { Assignment } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "agenda" | "month";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
};

const dayVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function CalendarPage() {
  const { refreshInterval, completedAssignments } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);

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

  // Days in month grid (include days from prev/next month to fill the grid)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i));
    }
    return days;
  }, [monthStart]);

  // Keyboard navigation
  const { containerProps, focusedIndex } = useCalendarKeyboard({
    calendarDays,
    selectedDate,
    onSelectDate: setSelectedDate,
  });

  // Get assignments for a specific date
  const getAssignmentsForDate = useCallback((date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return groupedByDate[dateKey] || [];
  }, [groupedByDate]);

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-0.5 tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Your schedule at a glance.</p>
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
          className="card-matte p-4 overflow-hidden"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <motion.h2 
                key={format(currentMonth, "yyyy-MM")}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-foreground min-w-[160px] text-center"
              >
                {format(currentMonth, "MMMM yyyy")}
              </motion.h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-7 px-2.5 text-xs gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Today
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1" role="row">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} role="columnheader" className="text-center text-2xs text-muted-foreground py-1.5 font-semibold uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid with Keyboard Navigation */}
          <motion.div 
            key={format(currentMonth, "yyyy-MM")}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-7 gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            {...containerProps}
          >
            {calendarDays.map((day, index) => {
              const assignments = getAssignmentsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isOutsideMonth = !isCurrentMonth(day);
              const hasOverdue = assignments.some(a => new Date(a.due_at) < new Date());
              const isFocused = focusedIndex === index;
              
              return (
                <motion.button
                  key={day.toISOString()}
                  variants={dayVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(day)}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${format(day, "EEEE, MMMM d, yyyy")}${assignments.length > 0 ? `, ${assignments.length} assignments` : ""}`}
                  className={cn(
                    "calendar-cell aspect-square p-1 rounded-lg transition-all duration-150",
                    "flex flex-col items-center justify-start gap-0.5",
                    "relative overflow-hidden",
                    "focus:outline-none",
                    isOutsideMonth && "opacity-30",
                    isTodayDate && "calendar-cell-today",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isFocused && !isSelected && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background",
                    !isTodayDate && !isSelected && "hover:bg-muted/50"
                  )}
                  style={{
                    background: isTodayDate 
                      ? "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)"
                      : undefined,
                  }}
                >
                  {/* Date number */}
                  <span className={cn(
                    "text-xs font-medium relative z-10",
                    isTodayDate ? "text-primary font-bold" : isOutsideMonth ? "text-muted-foreground/50" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  {/* Assignment dots */}
                  {assignments.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                      {assignments.slice(0, 3).map((a, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.005 + i * 0.03 }}
                          className="event-dot"
                          style={{ 
                            backgroundColor: a.course_color || "hsl(var(--primary))",
                            boxShadow: `0 0 6px ${a.course_color || "hsl(var(--primary))"}`,
                          }}
                        />
                      ))}
                      {assignments.length > 3 && (
                        <span className="text-[9px] text-muted-foreground font-medium">
                          +{assignments.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Overdue indicator */}
                  {hasOverdue && (
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-status-overdue" 
                      style={{ boxShadow: "0 0 4px hsl(var(--status-overdue))" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Keyboard hints */}
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
            <span>↑↓←→ Navigate</span>
            <span>Enter Select</span>
            <span>Home/End Week</span>
          </div>

          {/* Selected Date Assignments */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-border overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {getAssignmentsForDate(selectedDate).length} {getAssignmentsForDate(selectedDate).length === 1 ? "item" : "items"}
                  </span>
                </div>
                {getAssignmentsForDate(selectedDate).length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-1.5"
                  >
                    {getAssignmentsForDate(selectedDate).map((assignment) => (
                      <motion.div key={assignment.id} variants={itemVariants}>
                        <AssignmentCardRow
                          assignment={assignment}
                          onClick={() => handleAssignmentClick(assignment)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground py-3 text-center"
                  >
                    Nothing due on this day ✨
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
          className="space-y-4"
        >
          {isLoading ? (
            <SkeletonList count={5} />
          ) : Object.keys(groupedByDate).length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {Object.entries(groupedByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([dateKey, assignments], groupIndex) => {
                  const date = new Date(dateKey);
                  const isDateToday = isToday(date);
                  
                  return (
                    <motion.div 
                      key={dateKey}
                      variants={itemVariants}
                      className="relative"
                    >
                      {/* Timeline marker */}
                      <div className="timeline-marker" />
                      
                      {/* Date header */}
                      <div className={cn(
                        "sticky top-14 z-10 py-2 pl-4 -ml-4",
                        "bg-background/95 backdrop-blur-md"
                      )}>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isDateToday ? "bg-primary" : "bg-muted-foreground/30"
                          )} 
                            style={isDateToday ? { boxShadow: "0 0 8px hsl(var(--primary))" } : undefined}
                          />
                          <h3 className={cn(
                            "text-xs font-semibold uppercase tracking-wide",
                            isDateToday ? "text-primary" : "text-muted-foreground"
                          )}>
                            {isDateToday ? "Today" : format(date, "EEEE, MMMM d")}
                          </h3>
                          <span className="text-xs text-muted-foreground/50">
                            ({assignments.length})
                          </span>
                        </div>
                      </div>
                      
                      {/* Assignments */}
                      <div className="space-y-1.5 pl-4">
                        {assignments.map((assignment, index) => (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: groupIndex * 0.03 + index * 0.02 }}
                          >
                            <AssignmentCardRow
                              assignment={assignment}
                              onClick={() => handleAssignmentClick(assignment)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
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
