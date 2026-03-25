'use client';

import { useEffect, useRef, useCallback } from 'react';

const HOTLISTS_CONFIG = {
  colorTheme: 'dark',
  dateRange: '1D',
  exchange: 'US',
  showChart: false,
  locale: 'en',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  width: '100%',
  height: 400,
};

export default function MarketMovers() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href*="tradingview.com"]');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      // Extract ticker from the link text or URL
      const href = link.getAttribute('href') || '';
      const match = href.match(/symbol=(?:[A-Z]+:)?([A-Z.]+)/i);
      if (match) {
        window.location.href = `/stock/${match[1].toLowerCase()}`;
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container__widget';
    container.appendChild(wrapper);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js';
    script.async = true;
    script.type = 'text/javascript';
    script.textContent = JSON.stringify(HOTLISTS_CONFIG);
    container.appendChild(script);

    // Intercept clicks inside the widget iframe isn't possible,
    // so we listen on the container for any anchor clicks
    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
      container.innerHTML = '';
    };
  }, [handleClick]);

  return (
    <div className="border border-card-border rounded-xl overflow-hidden">
      <div ref={containerRef} className="tradingview-widget-container" />
    </div>
  );
}
