import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Calendar, 
  BookOpen, 
  Settings, 
  ChevronRight,
  Sparkles,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface SidebarNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: "/", label: "Home", icon: Home, shortcut: "G H" },
  { path: "/assignments", label: "Assignments", icon: FileText, shortcut: "G A" },
  { path: "/calendar", label: "Calendar", icon: Calendar, shortcut: "G C" },
  { path: "/courses", label: "Courses", icon: BookOpen, shortcut: "G O" },
  { path: "/settings", label: "Settings", icon: Settings, shortcut: "G S" },
];

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const location = useLocation();
  const { focusMode } = useSettings();

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: collapsed ? 60 : 220,
        opacity: focusMode ? 0.5 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
      }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40",
        "flex flex-col",
        "bg-sidebar border-r border-sidebar-border",
        "transition-opacity duration-200",
        focusMode && "hover:opacity-100"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-14 flex items-center px-3 border-b border-sidebar-border",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-primary/12 border border-primary/20"
            )}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              boxShadow: "0 0 16px -4px hsl(var(--primary) / 0.3)",
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-base text-foreground tracking-tight"
              >
                Canvas++
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg",
                "transition-all duration-120",
                "focus-ring",
                isActive 
                  ? "text-foreground" 
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveNav"
                  className="absolute inset-0 bg-sidebar-accent rounded-lg"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              
              {/* Active left indicator - elegant bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 active-indicator h-4"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2.5 w-full">
                <Icon className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors duration-120",
                  isActive && "text-primary"
                )} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-2xs text-muted-foreground/40 font-mono tracking-wider">
                        {item.shortcut}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Command Palette Hint */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-3"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border-subtle text-xs text-muted-foreground">
              <Command className="w-3 h-3" />
              <span>K for commands</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full h-8 justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            !collapsed && "justify-start px-2.5"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.18 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.12 }}
                className="ml-2 text-xs"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
}
