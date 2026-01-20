import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSummaryResult {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  summarize: (description: string, assignmentName: string) => Promise<void>;
}

// Cache summaries in memory to avoid repeated API calls
const summaryCache = new Map<string, string>();

export function useAISummary(): UseSummaryResult {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(async (description: string, assignmentName: string) => {
    // Check cache first
    const cacheKey = `${assignmentName}:${description.slice(0, 100)}`;
    if (summaryCache.has(cacheKey)) {
      setSummary(summaryCache.get(cacheKey)!);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('summarize-description', {
        body: { description, assignmentName },
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const summaryText = data.summary;
      summaryCache.set(cacheKey, summaryText);
      setSummary(summaryText);
    } catch (err) {
      console.error('Summary error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { summary, isLoading, error, summarize };
}
