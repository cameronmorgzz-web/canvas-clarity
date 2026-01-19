import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimetable } from "@/hooks/use-timetable";
import { cn } from "@/lib/utils";
import type { Day } from "@/types/timetable";

interface TimetableCardProps {
  className?: string;
  compact?: boolean;
}

export function TimetableCard({ className, compact = false }: TimetableCardProps) {
  const { 
    timetableByDay, 
    currentDay, 
    getCurrentPeriod, 
    getNextPeriod,
    getSubjectColor,
    PERIOD_TIMES,
    DAYS 
  } = useTimetable();
  
  const [selectedDay, setSelectedDay] = useState<Day>(currentDay || "Monday");
  
  const schedule = timetableByDay[selectedDay] || [];
  const currentPeriod = selectedDay === currentDay ? getCurrentPeriod : null;
  const nextPeriod = selectedDay === currentDay ? getNextPeriod : null;
  
  // Group consecutive periods of the same subject
  const groupedSchedule = schedule.reduce<Array<{
    subject: string;
    teacher: string;
    room: string;
    periods: string[];
    startTime: string;
    endTime: string;
  }>>((acc, entry) => {
    const last = acc[acc.length - 1];
    const times = PERIOD_TIMES[entry.period];
    
    if (last && last.subject === entry.subject && last.teacher === entry.teacher) {
      last.periods.push(entry.period);
      if (times) last.endTime = times.end;
    } else {
      acc.push({
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
        periods: [entry.period],
        startTime: times?.start || entry.start,
        endTime: times?.end || "",
      });
    }
    
    return acc;
  }, []);
  
  const dayIndex = DAYS.indexOf(selectedDay);
  const prevDay = dayIndex > 0 ? DAYS[dayIndex - 1] : null;
  const nextDay = dayIndex < DAYS.length - 1 ? DAYS[dayIndex + 1] : null;
  
  if (compact) {
    // Compact view: just show current/next class
    const displayPeriod = currentPeriod || nextPeriod;
    
    if (!displayPeriod) {
      return (
        <div className={cn("card-matte p-4", className)}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>No classes right now</span>
          </div>
        </div>
      );
    }
    
    const times = PERIOD_TIMES[displayPeriod.period];
    const isCurrentClass = currentPeriod === displayPeriod;
    
    return (
      <motion.div 
        className={cn("card-matte p-4 overflow-hidden", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-1.5 h-12 rounded-full shrink-0"
            style={{ backgroundColor: getSubjectColor(displayPeriod.subject) }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-2xs font-medium px-1.5 py-0.5 rounded",
                isCurrentClass 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {isCurrentClass ? "Now" : "Next"}
              </span>
              <span className="text-2xs text-muted-foreground">
                {times?.start} - {times?.end}
              </span>
            </div>
            <p className="font-semibold text-foreground truncate text-sm">
              {displayPeriod.subject}
            </p>
            <div className="flex items-center gap-3 mt-1 text-2xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {displayPeriod.teacher}
              </span>
              {displayPeriod.room && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {displayPeriod.room}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className={cn("card-matte overflow-hidden", className)}>
      {/* Day Selector */}
      <div className="flex items-center justify-between p-3 border-b border-border-subtle">
        <button
          onClick={() => prevDay && setSelectedDay(prevDay)}
          disabled={!prevDay}
          className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className={cn(
            "font-semibold text-sm",
            selectedDay === currentDay && "text-primary"
          )}>
            {selectedDay}
          </span>
          {selectedDay === currentDay && (
            <span className="text-2xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </div>
        
        <button
          onClick={() => nextDay && setSelectedDay(nextDay)}
          disabled={!nextDay}
          className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Schedule List */}
      <div className="divide-y divide-border-subtle">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {groupedSchedule.map((item, index) => {
              const isCurrent = currentPeriod && item.periods.includes(currentPeriod.period);
              
              return (
                <motion.div
                  key={`${item.subject}-${item.startTime}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex gap-3 p-3 transition-colors",
                    isCurrent && "bg-primary/5"
                  )}
                >
                  {/* Time Column */}
                  <div className="w-14 shrink-0 text-center">
                    <div className="text-xs font-medium text-foreground">{item.startTime}</div>
                    <div className="text-2xs text-muted-foreground">{item.endTime}</div>
                  </div>
                  
                  {/* Color Bar */}
                  <div 
                    className="w-1 rounded-full shrink-0"
                    style={{ backgroundColor: getSubjectColor(item.subject) }}
                  />
                  
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.subject}
                      </p>
                      {isCurrent && (
                        <span className="text-2xs bg-primary/20 text-primary px-1.5 py-0.5 rounded shrink-0">
                          Now
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-2xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.teacher}
                      </span>
                      {item.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Room {item.room}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.periods.length > 1 
                          ? `${item.periods.length} periods` 
                          : item.periods[0]
                        }
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
