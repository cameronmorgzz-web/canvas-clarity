/**
 * Standardized error types for Canvas++ application
 */

export type ErrorCode = 
  | 'NETWORK'
  | 'AUTH'
  | 'RATE_LIMIT'
  | 'NOT_CONFIGURED'
  | 'CANVAS_ERROR'
  | 'UNKNOWN';

export interface AppError {
  code: ErrorCode;
  message: string;
  hint?: string;
  status?: number;
  retryAfter?: number;
}

/**
 * Parse error response from edge function into standardized AppError
 */
export function parseApiError(error: unknown, status?: number): AppError {
  // Handle fetch errors (network issues)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK',
      message: 'Unable to connect to server',
      hint: 'Check your internet connection and try again.',
    };
  }

  // Handle error objects from API
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Check for rate limiting
    if (errorObj.code === 'RATE_LIMIT' || status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: errorObj.message as string || 'Rate limited by Canvas',
        hint: 'Canvas is temporarily limiting requests. Please wait.',
        status: 429,
        retryAfter: typeof errorObj.retryAfter === 'number' ? errorObj.retryAfter : 30,
      };
    }

    // Check for auth errors
    if (status === 401 || status === 403 || errorObj.code === 'AUTH') {
      return {
        code: 'AUTH',
        message: 'Authentication failed',
        hint: 'Your Canvas token may be invalid or expired. Please update it in settings.',
        status: status || 401,
      };
    }

    // Check for not configured
    if (status === 500 && (
      (errorObj.error as string)?.includes('not configured') ||
      (errorObj.message as string)?.includes('not configured')
    )) {
      return {
        code: 'NOT_CONFIGURED',
        message: 'Canvas API not configured',
        hint: 'Please configure your Canvas API URL and token.',
        status: 500,
      };
    }

    // Canvas-specific errors
    if (errorObj.error || errorObj.message) {
      return {
        code: 'CANVAS_ERROR',
        message: (errorObj.error || errorObj.message) as string,
        hint: 'There was an issue communicating with Canvas.',
        status,
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (error.includes('not configured')) {
      return {
        code: 'NOT_CONFIGURED',
        message: 'Canvas API not configured',
        hint: 'Please configure your Canvas API URL and token.',
        status: 500,
      };
    }
    return {
      code: 'UNKNOWN',
      message: error,
    };
  }

  // Default unknown error
  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    hint: 'Please try again or refresh the page.',
  };
}

/**
 * Check if error is recoverable with retry
 */
export function isRetryableError(error: AppError): boolean {
  return error.code === 'NETWORK' || error.code === 'RATE_LIMIT';
}

/**
 * Check if error indicates setup is needed
 */
export function isSetupError(error: AppError): boolean {
  return error.code === 'NOT_CONFIGURED' || error.code === 'AUTH';
}
