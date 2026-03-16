---
name: new-ticker
description: Add new stock/ETF tickers to the platform
---

Add new tickers to the platform. For each ticker provided:

1. Add to `src/lib/tickers.ts` with: ticker, company, exchange, sector, country
2. Run `node scripts/fill-stock-pages.js` to generate stock profile (or create manually in data/stocks/)
3. Verify the /stock/[ticker] page builds: `npx next build`
4. Update DESIGN_QUEUE.md content scoreboard with new ticker count
5. Run `npm run seo-check` to verify sitemap includes new pages

Supported exchanges: TSX, NYSE, NASDAQ, NSE, BSE
For Indian tickers, use NSE as primary exchange.
