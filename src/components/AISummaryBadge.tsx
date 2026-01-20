import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAISummary } from '@/hooks/use-ai-summary';
import { cn } from '@/lib/utils';

interface AISummaryBadgeProps {
  description?: string;
  assignmentName: string;
  className?: string;
}

export function AISummaryBadge({ description, assignmentName, className }: AISummaryBadgeProps) {
  const { summary, isLoading, error, summarize } = useAISummary();
  const [hasTriggered, setHasTriggered] = useState(false);

  // Auto-summarize when description is available and has meaningful content
  useEffect(() => {
    if (description && description.length > 50 && !hasTriggered) {
      // Strip HTML tags for checking content length
      const textContent = description.replace(/<[^>]*>/g, '').trim();
      if (textContent.length > 30) {
        setHasTriggered(true);
        summarize(description, assignmentName);
      }
    }
  }, [description, assignmentName, hasTriggered, summarize]);

  if (!description || description.length < 50) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Generating summary...</span>
        </motion.div>
      ) : summary ? (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={cn(
            "rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1.5",
            className
          )}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            <span>AI Summary</span>
          </div>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {summary}
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-xs text-muted-foreground/50", className)}
        >
          Could not generate summary
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
