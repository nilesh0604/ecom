/**
 * Web Vitals Monitoring Utility
 * 
 * Captures Core Web Vitals metrics for performance monitoring:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 * 
 * In production, these metrics should be sent to an analytics service
 * like Google Analytics, Segment, or a custom endpoint.
 */

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType: string;
  delta: number;
}

type MetricHandler = (metric: WebVitalMetric) => void;

// Default handler: log to console in development
const defaultHandler: MetricHandler = (metric) => {
  const isProduction = import.meta.env.PROD;
  
  if (!isProduction) {
    // Development: log to console with color coding
    const colors = {
      good: 'color: green',
      'needs-improvement': 'color: orange',
      poor: 'color: red',
    };
    
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      colors[metric.rating]
    );
  } else {
    // Production: send to analytics service
    // Replace this with your actual analytics implementation
    sendToAnalytics(metric);
  }
};

// Placeholder for production analytics
const sendToAnalytics = (metric: WebVitalMetric) => {
  // Example: Send to Google Analytics
  // gtag('event', metric.name, {
  //   value: Math.round(metric.value),
  //   event_category: 'Web Vitals',
  //   event_label: metric.id,
  //   non_interaction: true,
  // });

  // Example: Send to custom endpoint
  // navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(metric));

  // For now, just log in production too
  console.log('[Web Vital]', metric.name, metric.value, metric.rating);
};

/**
 * Initialize web vitals reporting
 * 
 * Uses dynamic import to avoid blocking initial page load.
 * The web-vitals library is loaded only when needed.
 */
export const initWebVitals = async (handler: MetricHandler = defaultHandler) => {
  // Dynamic import to avoid bundling if not used
  try {
    const webVitals = await import('web-vitals');

    // Register handlers for each metric
    // Note: onFID was replaced by onINP in web-vitals v4
    if (webVitals.onCLS) webVitals.onCLS((metric) => handler(metric as unknown as WebVitalMetric));
    if (webVitals.onFCP) webVitals.onFCP((metric) => handler(metric as unknown as WebVitalMetric));
    if (webVitals.onINP) webVitals.onINP((metric) => handler(metric as unknown as WebVitalMetric));
    if (webVitals.onLCP) webVitals.onLCP((metric) => handler(metric as unknown as WebVitalMetric));
    if (webVitals.onTTFB) webVitals.onTTFB((metric) => handler(metric as unknown as WebVitalMetric));

    console.log('[Web Vitals] Monitoring initialized');
  } catch {
    // web-vitals not installed, skip initialization
    console.warn('[Web Vitals] Library not available. Run: npm install web-vitals');
  }
};

/**
 * Performance thresholds based on Google's Core Web Vitals
 * 
 * Good thresholds:
 * - LCP: ≤ 2.5s
 * - FID: ≤ 100ms
 * - CLS: ≤ 0.1
 * - FCP: ≤ 1.8s
 * - TTFB: ≤ 800ms
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get rating for a metric value
 */
export const getMetricRating = (
  name: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = PERFORMANCE_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

export default initWebVitals;
