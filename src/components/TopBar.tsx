import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments... (press /)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-search-input
            className={cn(
              "pl-10 bg-muted/50 border-border-subtle",
              "focus:bg-muted focus:border-border-bright",
              "placeholder:text-muted-foreground"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </div>
      </form>

      {/* Quick Range */}
      <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
        <SelectTrigger className="w-28 bg-muted/50 border-border-subtle">
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
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatLastUpdated()}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn-press"
          aria-label="Refresh data"
        >
          <RefreshCw className={cn(
            "w-4 h-4",
            isRefreshing && "animate-spin"
          )} />
        </Button>
      </div>
    </header>
  );
}
