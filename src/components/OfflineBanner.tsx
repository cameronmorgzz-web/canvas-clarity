import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCacheAge } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface OfflineBannerProps {
  onRetry?: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheAge, setCacheAge] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Get cache age when offline
    if (!navigator.onLine) {
      const { lastUpdated } = getCacheAge();
      setCacheAge(lastUpdated);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update cache age when going offline
  useEffect(() => {
    if (!isOnline) {
      const { lastUpdated } = getCacheAge();
      setCacheAge(lastUpdated);
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-status-overdue/90 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-white shrink-0" />
            <div className="text-sm text-white">
              <span className="font-medium">You're offline</span>
              {cacheAge && (
                <span className="text-white/80 ml-1.5">
                  · Showing cached data from {formatDistanceToNow(cacheAge, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-white hover:bg-white/10 h-7 px-2"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
