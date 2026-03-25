'use client';

import { useEffect, useRef } from 'react';

const TICKER_TAPE_CONFIG = {
  symbols: [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'NASDAQ:QQQ', title: 'QQQ' },
    { proName: 'TSX:XIU', title: 'TSX (XIU)' },
    { proName: 'NASDAQ:AAPL', title: 'AAPL' },
    { proName: 'NASDAQ:MSFT', title: 'MSFT' },
    { proName: 'NASDAQ:AMZN', title: 'AMZN' },
    { proName: 'NASDAQ:NVDA', title: 'NVDA' },
    { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
    { proName: 'NYSE:JPM', title: 'JPM' },
    { proName: 'TSX:SHOP', title: 'SHOP' },
    { proName: 'TSX:RY', title: 'RY' },
    { proName: 'TSX:TD', title: 'TD' },
    { proName: 'TSX:ENB', title: 'ENB' },
  ],
  showSymbolLogo: true,
  isTransparent: true,
  displayMode: 'adaptive',
  colorTheme: 'dark',
  locale: 'en',
};

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous widget
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container__widget';
    container.appendChild(wrapper);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.type = 'text/javascript';
    script.textContent = JSON.stringify(TICKER_TAPE_CONFIG);
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="border-b border-card-border bg-background/95 overflow-hidden relative">
      <div ref={containerRef} className="tradingview-widget-container" />
      <div className="absolute inset-0 z-10" aria-hidden="true" />
    </div>
  );
}
