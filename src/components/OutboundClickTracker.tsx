'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/tracking';

export default function OutboundClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol) || url.hostname === window.location.hostname) return;
        trackEvent('outbound_click', {
          destination_host: url.hostname,
          destination_url: url.href.slice(0, 300),
          link_text: (anchor.textContent || '').trim().slice(0, 100),
        });
      } catch {
        // Ignore malformed URLs.
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
