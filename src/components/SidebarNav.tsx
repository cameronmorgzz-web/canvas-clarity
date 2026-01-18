import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Calendar, 
  BookOpen, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { iosEase } from "@/lib/animations";

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

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40",
        "flex flex-col bg-sidebar border-r border-sidebar-border",
        "overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center glow-primary-soft"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: iosEase }}
                className="font-bold text-lg text-primary-content tracking-tight"
              >
                Canvas++
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "transition-colors duration-200",
                "focus-ring",
                isActive 
                  ? "text-primary-content" 
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-sidebar-accent rounded-xl"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              
              {/* Active left indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                  style={{
                    boxShadow: "0 0 12px 2px hsl(var(--primary) / 0.5)",
                  }}
                />
              )}
              
              <motion.div
                className="relative z-10 flex items-center gap-3"
                whileHover={{ x: collapsed ? 0 : 2 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors duration-200",
                  isActive && "text-primary"
                )} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-3 flex-1"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono tracking-wider">
                        {item.shortcut}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !collapsed && "justify-start px-3"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="ml-2"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
