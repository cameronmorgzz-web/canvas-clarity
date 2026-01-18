import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";

interface WeekStripProps {
  assignments: Assignment[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export function WeekStrip({ 
  assignments, 
  selectedDate,
  onSelectDate,
  className 
}: WeekStripProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const count = assignments.filter(a => 
      isSameDay(new Date(a.due_at), date)
    ).length;
    
    return { date, count };
  });

  return (
    <div className={cn("flex gap-2", className)}>
      {days.map(({ date, count }) => {
        const isToday = isSameDay(date, today);
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelectDate?.(date)}
            className={cn(
              "flex-1 p-3 rounded-xl text-center transition-all btn-press",
              "border border-transparent",
              isToday && "border-primary/30 bg-primary/5",
              isSelected && "bg-primary/20 border-primary/50",
              !isToday && !isSelected && "hover:bg-muted"
            )}
          >
            <div className="text-xs text-muted-foreground mb-1">
              {format(date, "EEE")}
            </div>
            <div className={cn(
              "text-lg font-semibold",
              isToday ? "text-primary" : "text-primary-content"
            )}>
              {format(date, "d")}
            </div>
            {count > 0 && (
              <div className={cn(
                "mt-1 text-xs font-medium px-1.5 py-0.5 rounded-full inline-block",
                "bg-primary/20 text-primary"
              )}>
                {count}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
