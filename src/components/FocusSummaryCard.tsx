import { motion } from "framer-motion";
import { AlertTriangle, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSummaryCardProps {
  overdueCount: number;
  todayCount: number;
  weekCount: number;
  doneCount: number;
  activeFilter: "all" | "overdue" | "today" | "week" | "done";
  onFilterChange: (filter: "all" | "overdue" | "today" | "week" | "done") => void;
  className?: string;
}

export function FocusSummaryCard({
  overdueCount,
  todayCount,
  weekCount,
  doneCount,
  activeFilter,
  onFilterChange,
  className,
}: FocusSummaryCardProps) {
  const filters = [
    {
      key: "overdue" as const,
      label: "Overdue",
      count: overdueCount,
      icon: AlertTriangle,
      colorClass: "focus-chip-urgent",
      activeClass: "bg-status-overdue/20 border-status-overdue text-status-overdue",
    },
    {
      key: "today" as const,
      label: "Due Today",
      count: todayCount,
      icon: Clock,
      colorClass: "focus-chip-today",
      activeClass: "bg-status-today/20 border-status-today text-status-today",
    },
    {
      key: "week" as const,
      label: "This Week",
      count: weekCount,
      icon: CalendarDays,
      colorClass: "",
      activeClass: "bg-primary/20 border-primary text-primary",
    },
    {
      key: "done" as const,
      label: "Done",
      count: doneCount,
      icon: CheckCircle2,
      colorClass: "",
      activeClass: "bg-status-submitted/20 border-status-submitted text-status-submitted",
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {filters.map((filter, index) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        const isDoneFilter = filter.key === "done";
        const showFilter = filter.count > 0 || isDoneFilter;
        
        if (!showFilter) return null;
        
        return (
          <motion.button
            key={filter.key}
            onClick={() => onFilterChange(isActive ? "all" : filter.key)}
            className={cn(
              "focus-chip border transition-all cursor-pointer",
              isActive ? filter.activeClass : filter.colorClass,
              isActive && "ring-2 ring-offset-1 ring-offset-background ring-current"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 20,
              delay: index * 0.05 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-2.5 h-2.5" />
            {filter.count} {filter.label.toLowerCase()}
          </motion.button>
        );
      })}
    </div>
  );
}
