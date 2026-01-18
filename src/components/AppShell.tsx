import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/SidebarNav";
import { TopBar } from "@/components/TopBar";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { triggerRefresh } from "@/lib/api";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();

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

  // Update last updated time when queries complete
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" && event.query.state.status === "success") {
        setLastUpdated(new Date());
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <div className="min-h-screen flex w-full">
      <SidebarNav 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-60"
      )}>
        <TopBar 
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
