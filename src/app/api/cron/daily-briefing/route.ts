import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { BRIEFING_SLOTS, type BriefingSlot } from '@/lib/rss-feeds';
import {
  fetchBriefingStories,
  pickTopStories,
  jaccard,
  scoreStory,
  type NewsStory,
} from '@/lib/news-fetcher';
import { fetchNewsApiStories, newsApiConfigured } from '@/lib/newsapi';
import { classifyRelevance } from '@/lib/news-relevance';
import { generateBriefing, type BriefingStory } from '@/lib/ai/generate';
import { saveArticle, getArticlesByType } from '@/lib/content';
import { commitArticleToGitHub } from '@/lib/github-commit';
import { todayEST } from '@/lib/date';
import { getArticleImages, type UnsplashPhoto } from '@/lib/unsplash';
import { siteConfig } from '@/config/site';
import type { Article } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // up to 5 min for 4 sequential Haiku calls

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

function photoToField(p: UnsplashPhoto) {
  return {
    url: p.url,
    photographer: p.photographer,
    photographerUrl: p.photographerUrl,
    unsplashUrl: p.unsplashUrl,
  };
}

// The four slots generate in parallel, but GitHub commits to the same branch
// must be sequential — concurrent Contents API writes race on the branch head
// ("is at X but expected Y") and all but one fail.
let commitChain: Promise<unknown> = Promise.resolve();
function enqueueCommit<T>(fn: () => Promise<T>): Promise<T> {
  const next = commitChain.then(fn, fn);
  commitChain = next.catch(() => {});
  return next;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

// Merge RSS + NewsAPI stories into one pool, keeping the highest-scored story
// from each near-duplicate cluster (the same event often lands in both feeds).
function mergeAndDedupe(stories: NewsStory[]): NewsStory[] {
  const sorted = [...stories].sort((a, b) => scoreStory(b) - scoreStory(a));
  const kept: NewsStory[] = [];
  for (const s of sorted) {
    if (kept.some(k => jaccard(k.title, s.title) >= 0.6)) continue;
    kept.push(s);
  }
  return kept;
}

// ─── Per-slot orchestration ──────────────────────────────────────────────────

interface SlotOutcome {
  slotId: string;
  status: 'published' | 'skipped' | 'failed';
  slug?: string;
  title?: string;
  sourceUrl?: string;
  reason?: string;
  costUsd?: number;
  rssCount?: number; // stories pulled from curated RSS feeds
  apiCount?: number; // stories pulled from the NewsAPI layer (0 when NEWSAPI_KEY unset)
}

async function runSlot(
  slot: BriefingSlot,
  recentTitles: string[],
  dryRun: boolean,
): Promise<SlotOutcome> {
  try {
    // Curated RSS feeds + broad NewsAPI theme search, merged and de-duped so
    // cross-cutting stories (G7, summits, market ripples) get represented.
    const [rssStories, apiStories] = await Promise.all([
      fetchBriefingStories(slot.id),
      fetchNewsApiStories(slot.id),
    ]);
    const stories = mergeAndDedupe([...rssStories, ...apiStories]);
    const rssCount = rssStories.length;
    const apiCount = apiStories.length;
    const candidates = pickTopStories(stories, recentTitles, 10);
    if (candidates.length === 0) {
      return {
        slotId: slot.id,
        status: 'skipped',
        reason: 'no fresh eligible story',
        rssCount,
        apiCount,
      };
    }

    // Filter through relevance gate — keep all that pass (up to 8 for the digest)
    const relevant: NewsStory[] = [];
    for (const c of candidates) {
      const passes = await classifyRelevance(c.title, c.description);
      if (passes) relevant.push(c);
      if (relevant.length >= 8) break;
    }
    if (relevant.length === 0) {
      return {
        slotId: slot.id,
        status: 'skipped',
        reason: `all ${candidates.length} candidates rejected by relevance gate`,
        rssCount,
        apiCount,
      };
    }

    const today = todayEST();

    // Build BriefingStory array for the digest generator
    const briefingStories: BriefingStory[] = relevant.map(s => ({
      title: s.title,
      url: s.url,
      description: s.description,
      source: s.source,
    }));

    const result = await generateBriefing(briefingStories, slot.label, today);

    const topicSlug = slugify(slot.label);
    const slug = `take-${topicSlug}-brief-${today}`;

    // Title format: "DB MM/DD - <real headline of the day's biggest story>".
    // The model returns just the headline; we prepend the reliable date so it
    // never hallucinates the wrong day.
    const [, mm, dd] = today.split('-');
    const briefTitle = `DB ${mm}/${dd} - ${result.content.headline}`;

    const category = result.category || undefined;

    const images = dryRun
      ? { hero: null as UnsplashPhoto | null, inline: [] as UnsplashPhoto[] }
      : await getArticleImages({
          type: 'take',
          title: result.content.headline,
          category,
          imageSearchTerms: result.imageSearchTerms,
        });

    // Digests are multi-source roundups — drop tournament/roast fields the
    // model sometimes emits anyway (ticker-less candidates crash the build)
    const { candidates: _candidates, foolClaim: _foolClaim, ...digestContent } = result.content;

    const article: Article = {
      slug,
      type: 'take',
      title: briefTitle,
      description: result.content.summary,
      date: today,
      category,
      ticker: undefined,
      verdict: result.content.finalVerdict,
      tags: [
        'news',
        'take',
        'daily-briefing',
        slot.id,
        ...(category ? [category.toLowerCase()] : []),
      ],
      content: {
        ...digestContent,
        candidates: [],
        newsSource: `${relevant.length} sources`,
        newsUrl: relevant[0].url,
      },
      ...(images.hero ? { heroImage: photoToField(images.hero) } : {}),
      ...(images.inline.length > 0 ? { inlineImages: images.inline.map(photoToField) } : {}),
    };

    if (dryRun) {
      return {
        slotId: slot.id,
        status: 'published',
        slug,
        title: article.title,
        sourceUrl: relevant[0].url,
        costUsd: result.costUsd,
        reason: 'dry-run (not committed)',
        rssCount,
        apiCount,
      };
    }

    saveArticle(article);
    const commit = await enqueueCommit(() => commitArticleToGitHub(article, {
      message: `Daily briefing [${slot.id}]: ${slug}`,
    }));

    if (!commit.ok) {
      return {
        slotId: slot.id,
        status: 'failed',
        slug,
        title: article.title,
        reason: `commit failed: ${commit.error} ${commit.detail || ''}`.trim(),
        costUsd: result.costUsd,
        rssCount,
        apiCount,
      };
    }

    return {
      slotId: slot.id,
      status: 'published',
      slug,
      title: article.title,
      sourceUrl: relevant[0].url,
      costUsd: result.costUsd,
      rssCount,
      apiCount,
    };
  } catch (err) {
    return {
      slotId: slot.id,
      status: 'failed',
      reason: err instanceof Error ? err.message : 'unknown error',
    };
  }
}



// ─── Email digest ────────────────────────────────────────────────────────────

function formatDigest(outcomes: SlotOutcome[], dateStr: string): string {
  const rows = outcomes
    .map(o => {
      const slot = BRIEFING_SLOTS.find(s => s.id === o.slotId);
      const label = slot?.label || o.slotId;
      if (o.status === 'published') {
        const url = `${siteConfig.url}/article/${o.slug}`;
        return `
          <div style="padding:18px 24px;border-bottom:1px solid #e2e8f0;">
            <span style="background:#10B981;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;font-family:monospace;">${label.toUpperCase()}</span>
            <h2 style="margin:8px 0 6px;font-size:16px;color:#0F172A;">${o.title || o.slug}</h2>
            <p style="margin:0;font-size:12px;"><a href="${url}" style="color:#10B981;">View on site →</a> · <a href="${o.sourceUrl}" style="color:#64748b;">Source</a></p>
          </div>`;
      }
      const bg = o.status === 'skipped' ? '#94a3b8' : '#EF4444';
      return `
        <div style="padding:14px 24px;border-bottom:1px solid #e2e8f0;">
          <span style="background:${bg};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;font-family:monospace;">${label.toUpperCase()} — ${o.status.toUpperCase()}</span>
          <p style="margin:6px 0 0;color:#64748b;font-size:12px;">${o.reason || ''}</p>
        </div>`;
    })
    .join('');

  const totalCost = outcomes.reduce((sum, o) => sum + (o.costUsd || 0), 0);

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#1a1a2e;">
  <div style="background:#0F172A;padding:22px 24px;border-radius:12px 12px 0 0;">
    <h1 style="color:#10B981;margin:0;font-size:20px;">Bull Or BS — Daily Briefing</h1>
    <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">${dateStr}</p>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
    ${rows}
    <div style="padding:14px 24px;background:#f8fafc;border-radius:0 0 12px 12px;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">Cost: $${totalCost.toFixed(4)} · <a href="${siteConfig.url}/orange" style="color:#10B981;">Edit in /orange</a></p>
    </div>
  </div>
</div>`;
}

async function sendDigest(outcomes: SlotOutcome[], dateStr: string): Promise<void> {
  const emailTo = process.env.DAILY_EMAIL_TO;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const emailFrom = process.env.DAILY_EMAIL_FROM || 'bull.or.bss@gmail.com';
  if (!emailTo || !gmailPass) return; // silent skip when unset

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailFrom, pass: gmailPass },
  });

  const shortDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Toronto',
  });

  await transporter.sendMail({
    from: `"BullOrBS Briefing" <${emailFrom}>`,
    to: emailTo,
    subject: `BullOrBS Briefing — ${shortDate}`,
    html: formatDigest(outcomes, dateStr),
  });
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === '1';

  // Recent take titles (last 7 days) for dedupe
  const weekAgo = Date.now() - 7 * 24 * 3_600_000;
  const recentTitles = getArticlesByType('takes')
    .filter(a => {
      const ts = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      return ts >= weekAgo;
    })
    .map(a => a.title);

  // Run all 4 slots in parallel
  const settled = await Promise.all(
    BRIEFING_SLOTS.map(slot => runSlot(slot, recentTitles, dryRun)),
  );

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Toronto',
  });

  if (!dryRun) {
    try {
      await sendDigest(settled, dateStr);
    } catch (err) {
      console.error('Briefing digest email failed:', err);
    }
  }

  const totalApiCount = settled.reduce((s, o) => s + (o.apiCount || 0), 0);

  return NextResponse.json({
    ok: true,
    dryRun,
    date: dateStr,
    newsApi: {
      configured: newsApiConfigured(),
      storiesFetched: totalApiCount, // > 0 confirms the key works and is returning results
    },
    published: settled.filter(o => o.status === 'published').map(o => o.slug),
    skipped: settled.filter(o => o.status === 'skipped').map(o => o.slotId),
    failed: settled.filter(o => o.status === 'failed').map(o => ({ slotId: o.slotId, reason: o.reason })),
    totalCostUsd: Number(settled.reduce((s, o) => s + (o.costUsd || 0), 0).toFixed(4)),
    outcomes: settled,
  });
}
