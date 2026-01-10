/**
 * Retry Utility
 * Implements exponential backoff retry logic for failed operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
  onRetry: () => {}
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      // Call retry callback
      opts.onRetry(attempt, error);

      // Wait before retrying
      await sleep(delay);

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls
 */
export function withApiRetry<T>(
  fn: () => Promise<T>,
  customOptions?: RetryOptions
): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    initialDelay: 1000,
    shouldRetry: (error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.code >= 400 && error?.code < 500) {
        return false;
      }
      // Retry on network errors and 5xx errors
      return true;
    },
    onRetry: (attempt, error) => {
      console.warn(`API call failed, attempt ${attempt}:`, error.message);
    },
    ...customOptions
  });
}

/**
 * Retry wrapper for Firestore operations
 */
export function withFirestoreRetry<T>(
  fn: () => Promise<T>,
  customOptions?: RetryOptions
): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    initialDelay: 500,
    shouldRetry: (error: any) => {
      // Retry on network errors and specific Firestore errors
      const retryableCodes = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'aborted'
      ];
      return retryableCodes.includes(error?.code);
    },
    onRetry: (attempt, error) => {
      console.warn(`Firestore operation failed, attempt ${attempt}:`, error.message);
    },
    ...customOptions
  });
}
