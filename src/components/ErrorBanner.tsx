import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
  lastSync?: Date | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, lastSync, onRetry, className }: ErrorBannerProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 px-4 py-3 rounded-lg",
      "bg-status-overdue-bg border border-status-overdue/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-status-overdue shrink-0" />
        <div>
          <p className="text-sm font-medium text-status-overdue">{message}</p>
          {lastSync && (
            <p className="text-xs text-secondary-content">
              Last synced: {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="shrink-0 text-status-overdue hover:text-status-overdue hover:bg-status-overdue-bg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
