import { cn } from "@/lib/utils";
import { CheckCircle2, Inbox, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps {
  type: "caught-up" | "no-items" | "error";
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function EmptyStateCard({ 
  type, 
  title, 
  description, 
  onRetry,
  className 
}: EmptyStateCardProps) {
  const configs = {
    "caught-up": {
      icon: CheckCircle2,
      defaultTitle: "All caught up!",
      defaultDescription: "You're on top of your work. Nice job!",
      iconClass: "text-status-submitted",
    },
    "no-items": {
      icon: Inbox,
      defaultTitle: "Nothing here",
      defaultDescription: "No items to display.",
      iconClass: "text-muted-foreground",
    },
    "error": {
      icon: AlertCircle,
      defaultTitle: "Couldn't load data",
      defaultDescription: "Something went wrong. Please try again.",
      iconClass: "text-status-overdue",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "card-matte p-8 flex flex-col items-center justify-center text-center",
      className
    )}>
      <Icon className={cn("w-12 h-12 mb-4", config.iconClass)} />
      <h3 className="text-lg font-medium text-primary-content mb-1">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-secondary-content mb-4">
        {description || config.defaultDescription}
      </p>
      {type === "error" && onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="btn-press"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
