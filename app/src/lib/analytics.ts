/**
 * Tabjul Prabhakar Gupta Jewellers - Lightweight Production Analytics
 * Uses Google Analytics (gtag.js) if VITE_GA_MEASUREMENT_ID is configured.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Initializes Google Analytics script tag dynamically.
 */
export function initAnalytics() {
  if (!MEASUREMENT_ID || typeof window === 'undefined') return;

  if (document.querySelector('script[src*="googletagmanager.com"]')) return;

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false, // Custom route tracking triggers manually
    });
  } catch (err) {
    console.warn('Analytics initialization failed:', err);
  }
}

/**
 * Tracks a page view event.
 */
export function trackPageView(pagePath: string) {
  if (typeof window === 'undefined') return;
  
  if (MEASUREMENT_ID && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: document.title,
    });
  } else {
    console.log(`[Analytics - Page View]: ${pagePath}`);
  }
}

/**
 * Tracks a custom click or conversion event.
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === 'undefined') return;

  if (MEASUREMENT_ID && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.log(`[Analytics - Event]: ${action} | Category: ${category} | Label: ${label} | Value: ${value}`);
  }
}
