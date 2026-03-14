/**
 * Stock / ETF Deep Research Prompt
 * Used in the /orange dashboard to generate a pre-filled research prompt
 * that users paste into Claude or Gemini to get verified data tables.
 */

const RESEARCH_TEMPLATE = `ROLE: You are a financial research analyst. Pull VERIFIED, CURRENT data on: [TICKER]

CRITICAL RULES — DO NOT BREAK THESE:
1. SEARCH BEFORE YOU ANSWER. Use web search for EVERY data point. Do NOT rely on training data for any numbers.
2. CITE YOUR SOURCE with a clickable markdown hyperlink for every number. Format: [Source Name](https://full-url). Example: "AUM: C$14.81B [TradingView](https://www.tradingview.com/symbols/TSX-XEQT/)"
3. The Source column in the table MUST contain a markdown hyperlink, not just a name. Example: [Yahoo Finance](https://finance.yahoo.com/quote/XEQT.TO/)
4. If you cannot verify a number, write **UNVERIFIED** next to it.
5. NEVER interpolate, estimate, or round AUM/market cap figures.
6. If two sources conflict, show BOTH numbers with BOTH source links and flag it.
7. Check for RECENT fee changes, restructurings, or name changes (last 12 months).
8. The output will be pasted into an article generator. Source URLs MUST be included so they carry through to the final article.

SEARCH STRATEGY (follow this order):
- Yahoo Finance — price, AUM, yield, P/E, beta, 52-week range, YTD return
- Official fund provider site — MER, holdings, allocation, inception date
- Morningstar — ratings, risk level
- Recent news (last 90 days) — fee changes, restructurings, red flags

OUTPUT FORMAT — ONE CONDENSED TABLE:

## [TICKER] — [Full Name] | [Provider] | [Exchange]
**Data as of: [date of most recent source]**

| Category | Metric | Value | Source |
|----------|--------|-------|--------|
| **PRICE** | Current Price | $ | |
| | 52-Week Range | $Low — $High | |
| | Net Assets / AUM | $ | |
| | Avg Daily Volume | | |
| | Market Cap (stocks only) | $ | |
| **FEES** | Management Fee / MER | % / % | |
| | Recent Fee Changes? | Yes/No — detail if yes | |
| **INCOME** | Distribution Yield (12M trailing) | % | |
| | Forward Dividend Yield | % | |
| | Frequency / Last Ex-Date | [Monthly/Qtr] / [date] | |
| **RETURNS** | YTD 2026 | % | |
| | 2025 Calendar Year | % | |
| | 2024 Calendar Year | % | |
| | 3Y / 5Y CAGR | % / % | |
| | Since Inception (ann.) | % | |
| **VALUATION** | P/E (TTM) | | |
| (stocks) | EPS (TTM) / FCF (TTM) | $ / $ | |
| | Debt-to-Equity | | |
| | Analyst Consensus / Target | [Buy/Hold/Sell] / $ | |
| **RISK** | Beta (5Y Monthly) | | |
| | Morningstar Rating | [Stars] / [Medalist] | |
| | Risk Level (fund docs) | [Low to High] | |
| | Inception Date | | |
| **TAX** | Best Cdn Account Type | [TFSA/RRSP/Non-Reg] + why | |
| (Cdn) | Foreign Withholding Tax? | Yes/No — detail | |
| | Cdn Dividend Tax Credit? | Yes/No | |

**Top 5 Holdings:** [Name %] | [Name %] | [Name %] | [Name %] | [Name %]

**Top 5 Sectors:** [Sector %] | [Sector %] | [Sector %] | [Sector %] | [Sector %]

**Allocation (ETFs):** Cdn Eq __% | US Eq __% | Intl Eq __% | EM __% | Bonds __% | Cash __% | Total Holdings: ___

**Red Flags / News (90 days):** [Summarize material news in 1-2 lines, or "None found."]

---

### Bottom Line (3-5 sentences)
1. What it IS in plain English
2. Who it's best for
3. Single biggest risk
4. Closest competitor comparison

---

INSTRUCTIONS ON SECTIONS:
- For ETFs: Skip Valuation (stocks) row. Include Holdings, Sectors, and Allocation.
- For Stocks: Skip Holdings/Allocation/Sectors. Include full Valuation section.
- For Canadian-listed securities: Include TAX rows. For US-listed, note withholding tax only.
- Omit any row where data genuinely doesn't apply (e.g., no MER for individual stocks).

VERIFICATION BEFORE DELIVERING:
- Every AUM/market cap from a live source dated within 60 days
- Returns specify calendar year vs trailing
- Fee info reflects any changes in last 12 months
- Yield distinguishes trailing vs forward
- No numbers interpolated or estimated without flagging`;

export function getResearchPrompt(tickers: string): string {
  return RESEARCH_TEMPLATE.replace(/\[TICKER\]/g, tickers.trim());
}

/**
 * News Research Prompt
 * Used in the /orange dashboard to generate a pre-filled prompt
 * that users paste into Claude Opus to get verified news facts with source URLs.
 */

const NEWS_RESEARCH_TEMPLATE = `ROLE: You are a news research assistant. Research VERIFIED, RECENT news about: [TOPIC]

CRITICAL RULES — DO NOT BREAK THESE:
1. SEARCH THE WEB for every claim. Do NOT rely on training data alone.
2. Every fact MUST include the source as a markdown hyperlink — e.g. "Anthropic raised $2B ([Reuters](https://reuters.com/...))".
3. Use markdown link format [Source Name](URL) — NOT bare URLs. The output gets pasted into an article generator that renders these as clickable links.
4. If you cannot find a verifiable source for a claim, do NOT include it.
5. Facts only — NO opinions, NO predictions, NO speculation.
6. Focus on news from the last 30 days. If using older context, clearly label it as "BACKGROUND".
7. If two sources conflict, show BOTH with source links and flag the discrepancy.

SEARCH STRATEGY:
- Major wire services: Reuters, AP, Bloomberg, CNBC
- Financial press: Yahoo Finance, Financial Times, Wall Street Journal
- Canadian sources (if relevant): BNN Bloomberg, Globe and Mail, Financial Post, CBC Business
- Company press releases and SEC/SEDAR filings
- Avoid opinion pieces, blog posts, and social media as primary sources

OUTPUT FORMAT:

## News Research: [TOPIC]
**Researched: [today's date]**

### Key Facts
- [Fact with specific numbers/dates/names] (source URL)
- [Fact with specific numbers/dates/names] (source URL)
- [Continue for all verified facts...]

### Market / Investment Impact
- [How this affects publicly traded companies, sectors, or markets] (source URL if applicable)
- [Relevant ticker symbols mentioned: e.g. GOOGL, MSFT, MDA.TO]

### Timeline
- [Date]: [Event] (source URL)
- [Date]: [Event] (source URL)

### Source URLs
1. [Publication Name] — [URL] — [Date published]
2. [Publication Name] — [URL] — [Date published]
3. [Continue for all sources...]

### Suggested Source Field
[Comma-separated list of the PRIMARY publications cited, e.g. "Reuters, Bloomberg, BNN"]

---

VERIFICATION BEFORE DELIVERING:
- Every fact has a real, clickable source URL
- No numbers or dates from memory alone — all searched and verified
- Clearly separated facts from background context
- Any uncertainty is flagged with "reportedly" or "according to [source]"
- No editorializing or investment advice`;

export function getNewsResearchPrompt(topic: string): string {
  return NEWS_RESEARCH_TEMPLATE.replace(/\[TOPIC\]/g, topic.trim());
}
