import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/SidebarNav";
import { TopBar } from "@/components/TopBar";
import { CommandPalette } from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useSettings } from "@/hooks/use-settings";
import { triggerRefresh } from "@/lib/api";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const { focusMode, density } = useSettings();
  const { isOpen: commandPaletteOpen, open: openCommandPalette, close: closeCommandPalette } = useCommandPalette();

  useKeyboardShortcuts();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await triggerRefresh();
      await queryClient.invalidateQueries();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" && event.query.state.status === "success") {
        setLastUpdated(new Date());
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <div className={cn(
      "min-h-screen flex w-full",
      density === "compact" && "density-compact",
      focusMode && "focus-mode-active"
    )}>
      <SidebarNav 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <motion.div 
        className="flex-1 flex flex-col"
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 60 : 220 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      >
        <TopBar 
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onOpenCommandPalette={openCommandPalette}
        />
        
        <main className={cn(
          "flex-1 overflow-auto",
          density === "compact" ? "p-4" : "p-6"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className={cn(focusMode && "max-w-2xl mx-auto")}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
