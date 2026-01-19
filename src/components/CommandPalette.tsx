import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Calendar,
  BookOpen,
  Settings,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  Clock,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCourseCode } from "@/lib/format";
import { useSettings } from "@/hooks/use-settings";
import { fetchUpcoming, fetchCourses } from "@/lib/api";
import type { Assignment, Course } from "@/types/canvas";

interface CommandItem {
  id: string;
  type: "navigation" | "action" | "assignment" | "course";
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleFocusMode, focusMode } = useSettings();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch data for search
  const { data: upcoming } = useQuery({
    queryKey: ["upcoming"],
    queryFn: () => fetchUpcoming(14),
    staleTime: 30000,
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 60000,
  });

  // Build command items
  const allItems = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: "nav-home",
        type: "navigation",
        label: "Home",
        description: "Go to dashboard",
        icon: <Home className="w-4 h-4" />,
        shortcut: "G H",
        action: () => { navigate("/"); onClose(); },
      },
      {
        id: "nav-assignments",
        type: "navigation",
        label: "Assignments",
        description: "View all assignments",
        icon: <FileText className="w-4 h-4" />,
        shortcut: "G A",
        action: () => { navigate("/assignments"); onClose(); },
      },
      {
        id: "nav-calendar",
        type: "navigation",
        label: "Calendar",
        description: "View your schedule",
        icon: <Calendar className="w-4 h-4" />,
        shortcut: "G C",
        action: () => { navigate("/calendar"); onClose(); },
      },
      {
        id: "nav-courses",
        type: "navigation",
        label: "Courses",
        description: "View enrolled courses",
        icon: <BookOpen className="w-4 h-4" />,
        shortcut: "G O",
        action: () => { navigate("/courses"); onClose(); },
      },
      {
        id: "nav-settings",
        type: "navigation",
        label: "Settings",
        description: "Customize preferences",
        icon: <Settings className="w-4 h-4" />,
        shortcut: "G S",
        action: () => { navigate("/settings"); onClose(); },
      },
      // Actions
      {
        id: "action-refresh",
        type: "action",
        label: "Refresh Data",
        description: "Sync all data now",
        icon: <RefreshCw className="w-4 h-4" />,
        action: () => { 
          queryClient.invalidateQueries(); 
          onClose(); 
        },
      },
      {
        id: "action-focus",
        type: "action",
        label: focusMode ? "Exit Focus Mode" : "Enter Focus Mode",
        description: "Minimize distractions",
        icon: <Eye className="w-4 h-4" />,
        action: () => { 
          toggleFocusMode(); 
          onClose(); 
        },
      },
      {
        id: "action-overdue",
        type: "action",
        label: "Show Overdue",
        description: "Filter to overdue items",
        icon: <AlertTriangle className="w-4 h-4" />,
        action: () => { 
          navigate("/assignments?status=missing"); 
          onClose(); 
        },
      },
      {
        id: "action-today",
        type: "action",
        label: "Show Due Today",
        description: "View today's tasks",
        icon: <Clock className="w-4 h-4" />,
        action: () => { 
          navigate("/assignments?due=today"); 
          onClose(); 
        },
      },
    ];

    // Add assignments
    if (upcoming) {
      const allAssignments = [
        ...upcoming.overdue,
        ...upcoming.due_today,
        ...upcoming.due_soon,
        ...upcoming.this_week,
      ];
      
      allAssignments.forEach((assignment) => {
        items.push({
          id: `assignment-${assignment.id}`,
          type: "assignment",
          label: assignment.name,
          description: assignment.course_name,
          icon: <FileText className="w-4 h-4" />,
          action: () => { 
            navigate(`/assignments?q=${encodeURIComponent(assignment.name)}`); 
            onClose(); 
          },
        });
      });
    }

    // Add courses
    if (courses) {
      courses.forEach((course) => {
        items.push({
          id: `course-${course.id}`,
          type: "course",
          label: course.name,
          description: formatCourseCode(course.course_code),
          icon: <BookOpen className="w-4 h-4" />,
          action: () => { 
            navigate(`/courses/${course.id}`); 
            onClose(); 
          },
        });
      });
    }

    return items;
  }, [upcoming, courses, focusMode, navigate, onClose, queryClient, toggleFocusMode]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      // Show navigation + actions only when no search
      return allItems.filter(item => item.type === "navigation" || item.type === "action");
    }
    
    const query = search.toLowerCase();
    return allItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [allItems, search]);

  // Reset selection when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, selectedIndex, onClose]);

  // Group items by type
  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      assignment: [],
      course: [],
    };
    
    filteredItems.forEach(item => {
      groups[item.type].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  const renderGroup = (title: string, items: CommandItem[], startIndex: number) => {
    if (items.length === 0) return null;
    
    return (
      <div key={title}>
        <div className="px-3 py-2 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        {items.map((item, i) => {
          const index = startIndex + i;
          const isSelected = index === selectedIndex;
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left",
                "transition-colors duration-75",
                isSelected 
                  ? "bg-primary/10 text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <span className={cn(
                "flex-shrink-0",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm truncate",
                  isSelected && "text-foreground"
                )}>
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                )}
              </div>
              {item.shortcut && (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted/50 text-2xs text-muted-foreground font-mono">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  let runningIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="glass overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search commands, assignments, courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted/50 text-2xs text-muted-foreground font-mono">
                  ESC
                </kbd>
              </div>
              
              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <>
                    {["navigation", "action", "assignment", "course"].map((type) => {
                      const items = groupedItems[type];
                      const startIndex = runningIndex;
                      runningIndex += items.length;
                      
                      return renderGroup(
                        type === "navigation" ? "Navigate" :
                        type === "action" ? "Actions" :
                        type === "assignment" ? "Assignments" : "Courses",
                        items,
                        startIndex
                      );
                    })}
                  </>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border text-2xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono">↑</kbd>
                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono">↓</kbd>
                    <span>navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono">↵</kbd>
                    <span>select</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  <span>K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
