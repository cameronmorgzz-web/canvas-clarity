import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Inbox, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iosEase } from "@/lib/animations";

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
      iconBg: "bg-status-submitted/10",
    },
    "no-items": {
      icon: Inbox,
      defaultTitle: "Nothing here",
      defaultDescription: "No items to display.",
      iconClass: "text-muted-foreground",
      iconBg: "bg-muted/50",
    },
    "error": {
      icon: AlertCircle,
      defaultTitle: "Couldn't load data",
      defaultDescription: "Something went wrong. Please try again.",
      iconClass: "text-status-overdue",
      iconBg: "bg-status-overdue/10",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: iosEase }}
      className={cn(
        "card-matte p-8 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.1,
        }}
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
          config.iconBg
        )}
      >
        <Icon className={cn("w-8 h-8", config.iconClass)} />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-lg font-semibold text-primary-content mb-1"
      >
        {title || config.defaultTitle}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-sm text-secondary-content mb-4 max-w-xs"
      >
        {description || config.defaultDescription}
      </motion.p>
      
      {type === "error" && onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="rounded-xl"
          >
            Try again
          </Button>
        </motion.div>
      )}
      
      {type === "caught-up" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1 text-xs text-muted-foreground mt-2"
        >
          <Sparkles className="w-3 h-3" />
          <span>Keep up the great work</span>
        </motion.div>
      )}
    </motion.div>
  );
}
