/**
 * Rate Limiter Utility
 * Implements client-side rate limiting for API calls to prevent abuse
 */

interface RateLimitConfig {
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
}

interface CallRecord {
  timestamp: number;
}

class RateLimiter {
  private calls: CallRecord[] = [];
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxCallsPerMinute: parseInt(import.meta.env.VITE_MAX_API_CALLS_PER_MINUTE || '10'),
      maxCallsPerHour: parseInt(import.meta.env.VITE_MAX_API_CALLS_PER_HOUR || '50'),
      ...config
    };
  }

  /**
   * Check if a new API call is allowed based on rate limits
   */
  canMakeCall(): boolean {
    const now = Date.now();
    this.cleanupOldCalls(now);

    const minuteAgo = now - 60 * 1000;
    const hourAgo = now - 60 * 60 * 1000;

    const callsInLastMinute = this.calls.filter(call => call.timestamp > minuteAgo).length;
    const callsInLastHour = this.calls.filter(call => call.timestamp > hourAgo).length;

    return (
      callsInLastMinute < this.config.maxCallsPerMinute &&
      callsInLastHour < this.config.maxCallsPerHour
    );
  }

  /**
   * Record a new API call
   */
  recordCall(): void {
    this.calls.push({ timestamp: Date.now() });
  }

  /**
   * Get time until next call is allowed (in seconds)
   */
  getTimeUntilNextCall(): number {
    const now = Date.now();
    this.cleanupOldCalls(now);

    const minuteAgo = now - 60 * 1000;
    const callsInLastMinute = this.calls.filter(call => call.timestamp > minuteAgo);

    if (callsInLastMinute.length >= this.config.maxCallsPerMinute) {
      const oldestCall = callsInLastMinute[0];
      const timeUntilExpiry = (oldestCall.timestamp + 60 * 1000) - now;
      return Math.ceil(timeUntilExpiry / 1000);
    }

    return 0;
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): { minute: number; hour: number; limits: RateLimitConfig } {
    const now = Date.now();
    this.cleanupOldCalls(now);

    const minuteAgo = now - 60 * 1000;
    const hourAgo = now - 60 * 60 * 1000;

    return {
      minute: this.calls.filter(call => call.timestamp > minuteAgo).length,
      hour: this.calls.filter(call => call.timestamp > hourAgo).length,
      limits: this.config
    };
  }

  /**
   * Remove calls older than 1 hour
   */
  private cleanupOldCalls(now: number): void {
    const hourAgo = now - 60 * 60 * 1000;
    this.calls = this.calls.filter(call => call.timestamp > hourAgo);
  }

  /**
   * Reset all recorded calls (for testing or manual reset)
   */
  reset(): void {
    this.calls = [];
  }
}

// Export a singleton instance
export const apiRateLimiter = new RateLimiter();

// Export class for custom instances
export { RateLimiter };
