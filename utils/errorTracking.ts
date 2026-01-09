/**
 * Error Tracking and Logging Utility
 * Centralized error handling and logging
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
}

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private maxStoredErrors = 100;
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    context?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      severity,
      context,
      stack: typeof error === 'object' ? error.stack : undefined
    };

    this.errors.push(errorLog);
    
    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (this.isDevelopment) {
      const consoleMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
      console[consoleMethod]('[ErrorTracker]', errorLog);
    }

    // In production, you would send to error tracking service (e.g., Sentry)
    // this.sendToErrorTrackingService(errorLog);
  }

  /**
   * Get all logged errors
   */
  getErrors(severity?: ErrorSeverity): ErrorLog[] {
    if (severity) {
      return this.errors.filter(e => e.severity === severity);
    }
    return [...this.errors];
  }

  /**
   * Get recent errors (last n)
   */
  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    last24Hours: number;
  } {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    return {
      total: this.errors.length,
      bySeverity: {
        low: this.errors.filter(e => e.severity === 'low').length,
        medium: this.errors.filter(e => e.severity === 'medium').length,
        high: this.errors.filter(e => e.severity === 'high').length,
        critical: this.errors.filter(e => e.severity === 'critical').length
      },
      last24Hours: this.errors.filter(e => e.timestamp > last24Hours).length
    };
  }

  /**
   * Generate unique ID for error
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send to external error tracking service (placeholder)
   */
  private sendToErrorTrackingService(errorLog: ErrorLog): void {
    // Implement integration with Sentry, LogRocket, etc.
    // Example: Sentry.captureException(errorLog);
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Export class for custom instances
export { ErrorTracker };
