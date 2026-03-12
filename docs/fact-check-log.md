# Fact-Check Log

Track which articles have been fact-checked before publishing.

## Status Key
- **FC** = Fact-checked with Opus (verified)
- **SKIP** = News take (facts from source, lower risk)
- **TODO** = Needs fact-check review

## Articles

| Date | Type | Slug | Ticker | FC Status | Notes |
|------|------|------|--------|-----------|-------|
| 2026-03-12 | take | take-gold-and-silver-surge-while-bitcoin-stumbles | — | SKIP | News summary, sources cited |
| 2026-03-12 | take | take-bank-of-canada-holding-interest-rates-steady | — | SKIP | News summary, sources cited |
| 2026-03-11 | pick | ai-screenshot-pick-2026-03-11 | — | TODO | Screenshot pick, needs review |
| 2026-03-09 | pick | ai-pick-best-energy-stock-for-oil-price-recovery | — | TODO | Has candidates scored below 3 |
| 2026-03-09 | pick | ai-pick-ev-cars-facts-vs-drama | — | TODO | Has candidates scored below 3 |
| 2026-03-09 | roast | roast-motley-fool-shop-2026-03-09 | SHOP | TODO | |
| 2026-03-08 | roast | roast-oracle-orcl | ORCL | TODO | |
| 2026-03-07 | roast | roast-suncor-su | SU | TODO | |
| 2026-03-07 | roast | roast-constellation-csu | CSU | TODO | |
| 2026-03-06 | roast | roast-opentext-otex | OTEX | TODO | |
| 2026-03-05 | roast | roast-tesla-tsla | TSLA | TODO | |
| 2026-03-04 | roast | roast-shopify-shop | SHOP | TODO | |
| 2026-03-03 | roast | roast-royal-bank-ry | RY | TODO | |

## Process
1. Generate article via /orange dashboard
2. Paste output into Claude Opus for fact-check
3. Skim Opus source links, fix anything flagged
4. Update this log with FC status
5. Publish

## Priority
- Roasts are highest risk (critiquing specific recommendations)
- Picks are medium risk (our own analysis)
- Takes are lowest risk (summarizing public news)
