/**
 * Unified event tracking — fires to GA4 + any active ad pixels.
 * All pixel scripts are loaded conditionally via env vars.
 * When no pixel is configured, this is a no-op for that platform.
 */

type TrackingWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  twq?: (...args: unknown[]) => void;
};

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined') return;

  const w = window as TrackingWindow;

  // GA4
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params);
  }

  // Meta Pixel
  if (typeof w.fbq === 'function') {
    w.fbq('track', name, params);
  }

  // X (Twitter) Pixel
  if (typeof w.twq === 'function') {
    w.twq('track', name, params);
  }
}

/**
 * Record a confirmed newsletter subscription using GA4's recommended lead
 * event and Meta's standard Lead event. Keep the historical `subscribe` event
 * too so existing reports do not lose continuity.
 */
export function trackSubscription(placement: 'inline' | 'popup') {
  if (typeof window === 'undefined') return;
  const w = window as TrackingWindow;
  const params = {
    method: 'email',
    lead_source: `newsletter_${placement}`,
    currency: 'CAD',
    value: 0,
  };

  if (typeof w.gtag === 'function') {
    w.gtag('event', 'subscribe', params);
    w.gtag('event', 'generate_lead', params);
  }
  if (typeof w.fbq === 'function') {
    w.fbq('track', 'Lead', { content_name: `newsletter_${placement}` });
  }
  if (typeof w.twq === 'function') {
    w.twq('track', 'subscribe', { placement });
  }
}

/**
 * Track when a user scrolls past 50% of an article.
 * Fires once per page load — cheap signal for ad retargeting audiences.
 * Call this in article pages with useEffect.
 */
export function trackScrollDepth(articleSlug: string) {
  if (typeof window === 'undefined') return;

  let fired50 = false;
  let fired90 = false;

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = scrollTop / docHeight;
    if (pct >= 0.5 && !fired50) {
      fired50 = true;
      trackEvent('ActiveReader', { article: articleSlug });
      trackEvent('scroll_depth', { article: articleSlug, percent: '50' });
    }
    if (pct >= 0.9 && !fired90) {
      fired90 = true;
      trackEvent('scroll_depth', { article: articleSlug, percent: '90' });
    }
    if (fired50 && fired90) {
      window.removeEventListener('scroll', onScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => window.removeEventListener('scroll', onScroll);
}
