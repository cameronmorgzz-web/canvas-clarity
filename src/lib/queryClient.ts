import { QueryClient } from "@tanstack/react-query";
import { parseApiError } from "@/types/errors";

// Cache time constants
const STALE_TIME = 30 * 1000; // 30 seconds
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in memory
const PERSIST_TIME = 6 * 60 * 60 * 1000; // 6 hours in localStorage

// LocalStorage key for query cache
const CACHE_KEY = 'canvas-pp-query-cache';

interface PersistedCache {
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Save query cache to localStorage
 */
export function persistQueryCache(client: QueryClient): void {
  try {
    const cache = client.getQueryCache();
    const queries = cache.getAll();
    
    const persistData: Record<string, unknown> = {};
    
    queries.forEach((query) => {
      // Only persist successful queries with data
      if (query.state.status === 'success' && query.state.data) {
        const key = JSON.stringify(query.queryKey);
        persistData[key] = {
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
        };
      }
    });
    
    const toStore: PersistedCache = {
      timestamp: Date.now(),
      data: persistData,
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to persist query cache:', e);
  }
}

/**
 * Restore query cache from localStorage
 */
export function restoreQueryCache(client: QueryClient): boolean {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return false;
    
    const parsed: PersistedCache = JSON.parse(stored);
    
    // Check if cache is expired
    if (Date.now() - parsed.timestamp > PERSIST_TIME) {
      localStorage.removeItem(CACHE_KEY);
      return false;
    }
    
    // Restore each cached query
    Object.entries(parsed.data).forEach(([keyStr, value]) => {
      try {
        const queryKey = JSON.parse(keyStr);
        const { data, dataUpdatedAt } = value as { data: unknown; dataUpdatedAt: number };
        
        client.setQueryData(queryKey, data, {
          updatedAt: dataUpdatedAt,
        });
      } catch {
        // Skip invalid entries
      }
    });
    
    return true;
  } catch (e) {
    console.warn('Failed to restore query cache:', e);
    return false;
  }
}

/**
 * Get the age of the persisted cache
 */
export function getCacheAge(): { age: number; lastUpdated: Date | null } {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return { age: 0, lastUpdated: null };
    
    const parsed: PersistedCache = JSON.parse(stored);
    const age = Date.now() - parsed.timestamp;
    
    return {
      age,
      lastUpdated: new Date(parsed.timestamp),
    };
  } catch {
    return { age: 0, lastUpdated: null };
  }
}

/**
 * Clear persisted cache
 */
export function clearPersistedCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Create configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Don't retry on auth or config errors
          const appError = parseApiError(error);
          if (appError.code === 'AUTH' || appError.code === 'NOT_CONFIGURED') {
            return false;
          }
          // Retry network errors up to 3 times
          if (appError.code === 'NETWORK') {
            return failureCount < 3;
          }
          // Default retry once
          return failureCount < 1;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
  
  return client;
}
