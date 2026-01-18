import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopBarProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

type DateRange = "today" | "week" | "month";

export function TopBar({ lastUpdated, isRefreshing, onRefresh, className }: TopBarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/assignments?q=${encodeURIComponent(search.trim())}`);
    }
  }, [search, navigate]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <header className={cn(
      "h-16 glass border-b border-glass-border",
      "flex items-center justify-between gap-4 px-6",
      "sticky top-0 z-30",
      className
    )}>
      {/* Animated gradient border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <motion.div 
          className="relative"
          animate={{ scale: searchFocused ? 1.01 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <Input
            type="search"
            placeholder="Search assignments... (press /)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            data-search-input
            className={cn(
              "pl-10 bg-muted/40 border-border-subtle rounded-xl",
              "transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              searchFocused && "bg-muted/60 border-primary/30 shadow-glow"
            )}
          />
          <kbd className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex",
            "h-5 items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5",
            "font-mono text-[10px] font-medium text-muted-foreground/70",
            "transition-opacity duration-200",
            searchFocused && "opacity-0"
          )}>
            /
          </kbd>
        </motion.div>
      </form>

      {/* Quick Range */}
      <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
        <SelectTrigger className="w-28 bg-muted/40 border-border-subtle rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="month">Month</SelectItem>
        </SelectContent>
      </Select>

      {/* Last Updated + Refresh */}
      <div className="flex items-center gap-3">
        <motion.div 
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
          key={lastUpdated?.getTime()}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatLastUpdated()}</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl"
            aria-label="Refresh data"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{
                duration: 1,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear",
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
