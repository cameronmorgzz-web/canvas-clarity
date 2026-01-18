import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ClipboardList, Calendar, GraduationCap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/assignments", icon: ClipboardList, label: "Tasks" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/courses", icon: GraduationCap, label: "Courses" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-glass backdrop-blur-xl border-t border-border-subtle" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
              </motion.div>
              <span 
                className={cn(
                  "text-2xs font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
