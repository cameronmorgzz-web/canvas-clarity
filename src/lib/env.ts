/**
 * Environment Configuration Helper
 * Supports both runtime (window.__ENV) and build-time (import.meta.env) configs
 * Runtime config takes priority for deployment flexibility
 */

// Extend Window interface to include __ENV
declare global {
  interface Window {
    __ENV?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
      SUPABASE_PUBLISHABLE_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const ENV_KEYS = {
  SUPABASE_URL: ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
  SUPABASE_ANON_KEY: ['SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
} as const;

/**
 * Get environment variable value
 * Priority: window.__ENV > import.meta.env
 */
export function getEnv(key: keyof typeof ENV_KEYS): string {
  const possibleKeys = ENV_KEYS[key];
  
  // Check window.__ENV first (runtime)
  if (typeof window !== 'undefined' && window.__ENV) {
    for (const k of possibleKeys) {
      const value = window.__ENV[k];
      if (value) return value;
    }
  }
  
  // Fall back to import.meta.env (build-time)
  for (const k of possibleKeys) {
    const value = (import.meta.env as Record<string, string | undefined>)[`VITE_${k}`] || 
                  (import.meta.env as Record<string, string | undefined>)[k];
    if (value) return value;
  }
  
  return '';
}

/**
 * Validate that all required environment variables are set
 */
export function validateEnv(): { valid: boolean; missing: string[]; config: EnvConfig | null } {
  const missing: string[] = [];
  
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseKey = getEnv('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseKey) missing.push('SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    return { valid: false, missing, config: null };
  }
  
  return {
    valid: true,
    missing: [],
    config: {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseKey,
    },
  };
}

/**
 * Get validated environment config or throw with helpful error
 */
export function getEnvConfig(): EnvConfig {
  const { valid, missing, config } = validateEnv();
  
  if (!valid || !config) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}. 
Please ensure these are set either:
1. In .env file as VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
2. Or in public/env.js as window.__ENV = { SUPABASE_URL: '...', SUPABASE_ANON_KEY: '...' }`;
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  return config;
}
