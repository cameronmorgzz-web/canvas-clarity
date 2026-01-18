import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Eye, EyeOff, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface TopBarProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  className?: string;
}

type DateRange = "today" | "week" | "month";

export function TopBar({ 
  lastUpdated, 
  isRefreshing, 
  onRefresh, 
  onOpenCommandPalette,
  className 
}: TopBarProps) {
  const navigate = useNavigate();
  const { focusMode, toggleFocusMode } = useSettings();
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
    if (!lastUpdated) return "Syncing...";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate progress for refresh ring (animated)
  const refreshProgress = isRefreshing ? 0.25 : 0;

  return (
    <header className={cn(
      "h-14 glass",
      "flex items-center justify-between gap-4 px-5",
      "sticky top-0 z-30",
      className
    )}>
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      
      {/* Search - Premium pill */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <motion.div 
          className="relative"
          animate={{ scale: searchFocused ? 1.005 : 1 }}
          transition={{ duration: 0.12 }}
        >
          <Search className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <Input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            data-search-input
            className={cn(
              "pl-10 pr-20 h-9 input-premium",
              "text-sm placeholder:text-muted-foreground/50",
              searchFocused && "border-primary/40"
            )}
          />
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex items-center gap-1.5 h-6 px-2 rounded-md",
              "bg-muted/60 border border-border-subtle",
              "text-2xs text-muted-foreground font-medium",
              "hover:bg-muted/80 transition-colors duration-120",
              searchFocused && "opacity-0"
            )}
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </motion.div>
      </form>

      {/* Segmented Control - Date Range */}
      <div className="segmented-control hidden sm:flex">
        {(["today", "week", "month"] as DateRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            data-active={dateRange === range}
            className="segmented-control-item capitalize"
          >
            {range}
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Focus Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFocusMode}
          className={cn(
            "h-8 w-8 rounded-lg",
            focusMode && "bg-primary/15 text-primary"
          )}
          aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
        >
          {focusMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.div 
              key={lastUpdated?.getTime() || "syncing"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <motion.div 
                className="sync-dot"
                animate={isRefreshing ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: isRefreshing ? Infinity : 0 }}
              />
              <span>{formatLastUpdated()}</span>
            </motion.div>
          </AnimatePresence>
          
          {/* Refresh Button with Progress Ring */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 rounded-lg relative"
            aria-label="Refresh data"
          >
            {isRefreshing ? (
              <svg className="w-4 h-4 progress-ring" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                <motion.circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="50.26"
                  initial={{ strokeDashoffset: 50.26 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
