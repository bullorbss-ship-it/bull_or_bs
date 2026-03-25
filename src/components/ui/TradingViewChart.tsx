'use client';

import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  ticker: string;
  exchange: 'TSX' | 'NYSE' | 'NASDAQ';
  variant?: 'full' | 'mini';
}

function getTradingViewSymbol(ticker: string, exchange: string): string {
  if (exchange === 'TSX') return `TSX:${ticker}`;
  return `${exchange}:${ticker}`;
}

export default function TradingViewChart({ ticker, exchange, variant = 'full' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const symbol = getTradingViewSymbol(ticker, exchange);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container__widget';
    wrapper.style.height = variant === 'mini' ? '220px' : '400px';
    container.appendChild(wrapper);

    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';

    if (variant === 'mini') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
      script.textContent = JSON.stringify({
        symbol,
        width: '100%',
        height: 220,
        locale: 'en',
        dateRange: '3M',
        isTransparent: true,
        autosize: false,
        largeChartUrl: '',
        noTimeScale: false,
        chartOnly: false,
      });
    } else {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.textContent = JSON.stringify({
        symbol,
        width: '100%',
        height: 400,
        locale: 'en',
        interval: 'D',
        timezone: 'America/New_York',
        theme: 'light',
        style: '1',
        gridColor: 'rgba(0, 0, 0, 0.04)',
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: false,
        save_image: false,
        calendar: false,
        support_host: 'https://www.tradingview.com',
      });
    }

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, variant]);

  return (
    <div className="rounded-xl border border-card-border overflow-hidden relative">
      <div ref={containerRef} className="tradingview-widget-container" />
      {variant === 'mini' && (
        <div className="absolute inset-0 z-10" aria-hidden="true" />
      )}
    </div>
  );
}
