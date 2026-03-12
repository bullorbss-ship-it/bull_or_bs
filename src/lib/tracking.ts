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

export function trackEvent(name: string, params?: Record<string, string>) {
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
 * Track when a user scrolls past 50% of an article.
 * Fires once per page load — cheap signal for ad retargeting audiences.
 * Call this in article pages with useEffect.
 */
export function trackScrollDepth(articleSlug: string) {
  if (typeof window === 'undefined') return;

  let fired = false;

  function onScroll() {
    if (fired) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = scrollTop / docHeight;
    if (pct >= 0.5) {
      fired = true;
      trackEvent('ActiveReader', { article: articleSlug });
      window.removeEventListener('scroll', onScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => window.removeEventListener('scroll', onScroll);
}
