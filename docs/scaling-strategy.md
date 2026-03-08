# BullOrBS Scaling Strategy
Created: March 7, 2026

## Core Principle
Stay static as long as possible. Static pages = infinite scale at near-zero cost. Only go dynamic where you must (admin, premium reports, subscribe). Every scaling move triggered by actual traffic, not anticipated traffic.

---

## Tier 1: 0-5K visitors/mo (CURRENT)
**Stack:** Render free tier + Cloudflare DNS
**Cost:** $0.83/mo (domain only)

| Component | Solution | Limit |
|---|---|---|
| Hosting | Render free tier | 750 hrs/mo, sleeps after 15 min |
| CDN/DNS | Cloudflare free | Unlimited bandwidth, DDoS protection |
| Content storage | JSON files on disk | Fine for <100 articles |
| Rate limiting | In-memory (middleware.ts) | Resets on deploy, sufficient for now |
| Email subscribers | JSON file (data/subscribers.json) | Fine for <100 subs |
| Keep-alive | External pinger (cron-job.org/UptimeRobot) | Prevents cold starts |

**Bottlenecks at this tier:**
- Render cold starts (mitigated by pinger)
- 512MB RAM limit on free tier
- No persistent disk (files reset on deploy)

---

## Tier 2: 5K-50K visitors/mo (Target: Month 5-7)
**Stack:** Render paid + Cloudflare caching + ISR
**Cost:** ~$7/mo

**Trigger to upgrade:** Consistent 5K+ monthly visitors in GA4

**Changes:**
| Component | From | To |
|---|---|---|
| Hosting | Render free | Render Starter ($7/mo) — no cold starts, persistent disk |
| Page rendering | SSR on every request | ISR — static pages revalidate hourly |
| Caching | None | Cloudflare cache rules: stock pages 1hr, articles 24hr |
| Headers | Basic security | Add `Cache-Control` in middleware for static pages |
| Subscribers | JSON file | Beehiiv API (free under 2,500 subs) |
| Content | JSON files | Still JSON, but persistent disk means no data loss on deploy |

**How to implement ISR:**
```typescript
// In stock/[ticker]/page.tsx and article/[slug]/page.tsx
export const revalidate = 3600; // revalidate every hour
```

**Cloudflare cache rule:**
- URL: `bullorbs.com/stock/*` → Cache 1 hour
- URL: `bullorbs.com/article/*` → Cache 24 hours
- URL: `bullorbs.com/api/*` → Bypass cache

---

## Tier 3: 50K-500K visitors/mo (Target: Month 8-12)
**Stack:** Cloudflare Pages (frontend) + Render (API) + D1/Upstash
**Cost:** ~$15/mo

**Trigger to upgrade:** Render response times >2s under load, or bandwidth costs rising

**Changes:**
| Component | From | To |
|---|---|---|
| Frontend | Render | Cloudflare Pages (free, unlimited bandwidth, edge-served) |
| API routes | Render | Stay on Render (or move to Cloudflare Workers) |
| Content DB | JSON files | Cloudflare D1 (SQLite at edge, free: 5M reads/day) |
| Rate limiting | In-memory | Upstash Redis (free: 10K commands/day) |
| Sessions | Cookie only | Upstash Redis for session store |
| Images | /public/ | Cloudflare R2 (free: 10GB storage, 10M reads/mo) |

**Architecture split:**
```
Cloudflare Pages (static frontend)
  └── /stock/*, /article/*, homepage, about, etc.
  └── Pre-rendered at build time (SSG)

Render or Cloudflare Workers (API)
  └── /api/generate, /api/subscribe, /api/health
  └── /admin dashboard
  └── Premium report generation
```

**Why this works:** 95% of traffic hits static pages (stock pages, articles). Only 5% hits API routes. Serving static from Cloudflare edge = sub-50ms globally, zero compute cost.

---

## Tier 4: 500K+ visitors/mo (Year 2+)
**Stack:** Full Cloudflare stack
**Cost:** ~$25/mo

**Trigger to upgrade:** D1 free tier limits hit, or need edge compute for API

**Changes:**
| Component | Solution | Cost |
|---|---|---|
| Frontend | Cloudflare Pages | Free |
| API | Cloudflare Workers | $5/mo (10M requests) |
| Database | Cloudflare D1 | $5/mo (25B reads) |
| Images/Assets | Cloudflare R2 | ~$5/mo |
| Rate limiting | Workers + KV | Included in Workers plan |
| Premium reports | Separate Render service | $7/mo (isolated, heavy compute) |
| CDN | Cloudflare | Free (already handling everything) |

**Additional optimizations:**
- Edge-level A/B testing via Cloudflare Workers
- Geo-targeted content (Canadian users see TSX first)
- Pre-rendered RSS/sitemap at build time
- Image optimization via Cloudflare Images
- Bot management for scraper protection

---

## Cost Comparison: Us vs. Competitors at Scale

| Metric | BullOrBS (projected) | Typical SaaS |
|---|---|---|
| 100K visitors/mo | ~$15/mo | $50-200/mo |
| 500K visitors/mo | ~$25/mo | $200-1,000/mo |
| 1M visitors/mo | ~$50/mo | $500-2,000/mo |

**Why we're cheaper:** Static-first architecture. No server-side rendering for every request. Content changes once (on publish), then served as static HTML from CDN edge. Compute only for: article generation (Claude API), premium reports, admin dashboard.

---

## Migration Checklist (When Moving Tiers)

### Tier 1 → Tier 2
- [ ] Upgrade Render plan to Starter ($7/mo)
- [ ] Add `revalidate` to stock + article pages (ISR)
- [ ] Set up Cloudflare cache rules in dashboard
- [ ] Add Cache-Control headers in middleware
- [ ] Migrate subscribers to Beehiiv
- [ ] Verify persistent disk stores content between deploys

### Tier 2 → Tier 3
- [ ] Set up Cloudflare Pages project
- [ ] Configure build: `npm run build` → `out/` directory
- [ ] Set up D1 database, migrate content JSON → SQLite
- [ ] Set up Upstash Redis, move rate limiting
- [ ] Split API routes to separate Render service
- [ ] Update DNS: frontend → Cloudflare Pages, api.bullorbs.com → Render
- [ ] Move images to R2

### Tier 3 → Tier 4
- [ ] Migrate API from Render → Cloudflare Workers
- [ ] Move premium report generation to isolated Render service
- [ ] Enable Cloudflare Workers paid plan
- [ ] Set up KV for rate limiting at edge

---

## What NOT to Do
- Don't scale before you need to — premature optimization kills momentum
- Don't add a database until JSON files become a bottleneck (>500 articles)
- Don't split frontend/API until latency or bandwidth is a real problem
- Don't buy Vercel Pro when Cloudflare Pages does the same for free
- Don't add Redis when in-memory rate limiting handles your traffic fine
- Every tier change should be preceded by 2+ weeks of data showing the bottleneck
