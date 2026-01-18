import { motion } from "framer-motion";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/canvas";
import { iosEase } from "@/lib/animations";

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
      {days.map(({ date, count }, index) => {
        const isToday = isSameDay(date, today);
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        
        return (
          <motion.button
            key={date.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.03,
              duration: 0.3,
              ease: iosEase,
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectDate?.(date)}
            className={cn(
              "flex-1 p-3 rounded-xl text-center relative overflow-hidden",
              "transition-colors duration-200",
              "border border-transparent",
              isToday && "border-primary/30 bg-primary/5",
              isSelected && "bg-primary/15 border-primary/40",
              !isToday && !isSelected && "hover:bg-muted/50"
            )}
          >
            {/* Today indicator dot */}
            {isToday && (
              <motion.div
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  boxShadow: "0 0 8px 2px hsl(var(--primary) / 0.4)",
                }}
              />
            )}
            
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              {format(date, "EEE")}
            </div>
            <div className={cn(
              "text-lg font-bold transition-colors duration-200",
              isToday ? "text-primary" : "text-primary-content"
            )}>
              {format(date, "d")}
            </div>
            {count > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: index * 0.03 + 0.15,
                }}
                className={cn(
                  "mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full inline-block",
                  "bg-primary/20 text-primary"
                )}
                style={{
                  boxShadow: "0 0 12px -2px hsl(var(--primary) / 0.3)",
                }}
              >
                {count}
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
