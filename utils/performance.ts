/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and custom performance metrics
 */

import { errorTracker } from './errorTracking';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsScore {
  lcp: PerformanceMetric | null; // Largest Contentful Paint
  fid: PerformanceMetric | null; // First Input Delay
  cls: PerformanceMetric | null; // Cumulative Layout Shift
  fcp: PerformanceMetric | null; // First Contentful Paint
  ttfb: PerformanceMetric | null; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsScore = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  };

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Largest Contentful Paint
    this.observeLCP();
    
    // First Input Delay
    this.observeFID();
    
    // Cumulative Layout Shift
    this.observeCLS();

    // First Contentful Paint
    this.observeFCP();

    // Navigation Timing (includes TTFB)
    this.observeNavigation();
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.webVitals.lcp = this.createMetric(
            'LCP',
            lastEntry.renderTime || lastEntry.loadTime,
            this.rateLCP(lastEntry.renderTime || lastEntry.loadTime)
          );
          this.logMetric(this.webVitals.lcp);
        }
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.warn('LCP observer not supported');
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.webVitals.fid = this.createMetric(
            'FID',
            entry.processingStart - entry.startTime,
            this.rateFID(entry.processingStart - entry.startTime)
          );
          this.logMetric(this.webVitals.fid);
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('FID observer not supported');
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.webVitals.cls = this.createMetric(
          'CLS',
          clsValue,
          this.rateCLS(clsValue)
        );
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });

      // Report final CLS on page unload
      window.addEventListener('pagehide', () => {
        if (this.webVitals.cls) {
          this.logMetric(this.webVitals.cls);
        }
      });
    } catch (error) {
      console.warn('CLS observer not supported');
    }
  }

  /**
   * Observe First Contentful Paint
   */
  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.webVitals.fcp = this.createMetric(
            'FCP',
            entry.startTime,
            this.rateFCP(entry.startTime)
          );
          this.logMetric(this.webVitals.fcp);
        });
      });
      
      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.warn('FCP observer not supported');
    }
  }

  /**
   * Observe Navigation Timing
   */
  private observeNavigation(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navTiming = performance.getEntriesByType('navigation')[0] as any;
        if (navTiming) {
          this.webVitals.ttfb = this.createMetric(
            'TTFB',
            navTiming.responseStart - navTiming.requestStart,
            this.rateTTFB(navTiming.responseStart - navTiming.requestStart)
          );
          this.logMetric(this.webVitals.ttfb);
        }
      });
    }
  }

  /**
   * Create a metric object
   */
  private createMetric(
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor'
  ): PerformanceMetric {
    return {
      name,
      value,
      rating,
      timestamp: Date.now()
    };
  }

  /**
   * Rating thresholds based on Web Vitals recommendations
   */
  private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Log metric
   */
  private logMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Log to console in development
    if (import.meta.env.DEV) {
      const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red';
      console.log(
        `%c[Performance] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
        `color: ${color}; font-weight: bold`
      );
    }

    // Track poor metrics as errors
    if (metric.rating === 'poor') {
      errorTracker.logError(
        `Poor ${metric.name}: ${Math.round(metric.value)}ms`,
        'low',
        { metric }
      );
    }
  }

  /**
   * Get all web vitals
   */
  getWebVitals(): WebVitalsScore {
    return { ...this.webVitals };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    good: number;
    needsImprovement: number;
    poor: number;
    score: number;
  } {
    const vitals = Object.values(this.webVitals).filter(v => v !== null) as PerformanceMetric[];
    
    const good = vitals.filter(v => v.rating === 'good').length;
    const needsImprovement = vitals.filter(v => v.rating === 'needs-improvement').length;
    const poor = vitals.filter(v => v.rating === 'poor').length;
    
    const total = vitals.length;
    const score = total > 0 ? Math.round((good / total) * 100) : 0;

    return { good, needsImprovement, poor, score };
  }

  /**
   * Send metrics to analytics (placeholder)
   */
  sendToAnalytics(): void {
    const vitals = this.getWebVitals();
    
    // In production, send to your analytics service
    // Example: Google Analytics, DataDog, New Relic
    if (!import.meta.env.DEV) {
      console.log('Sending metrics to analytics:', vitals);
      // analytics.track('web-vitals', vitals);
    }
  }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor();

// Export class
export { PerformanceMonitor };

// Make available in dev console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
  console.log('💡 Performance monitor available via window.performanceMonitor');
}
