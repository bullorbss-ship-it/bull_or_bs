import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { refreshProfile, refreshProfiles } from '@/lib/ai/refresh-profile';

/**
 * POST /api/admin/refresh-profile
 * Body: { ticker: "AAPL" } or { tickers: ["AAPL", "MSFT"], autoSave: true }
 *
 * Dry run by default — shows what would change without writing to disk.
 * Set autoSave: true to actually update the profile JSON files.
 */
export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const autoSave = body.autoSave === true;

    // Single ticker
    if (body.ticker) {
      const result = await refreshProfile(body.ticker, autoSave);
      return NextResponse.json({ result, autoSave });
    }

    // Multiple tickers
    if (body.tickers && Array.isArray(body.tickers)) {
      if (body.tickers.length > 20) {
        return NextResponse.json({ error: 'Max 20 tickers per request' }, { status: 400 });
      }
      const results = await refreshProfiles(body.tickers, autoSave);
      const summary = {
        total: results.length,
        updated: results.filter(r => r.status === 'updated').length,
        noChange: results.filter(r => r.status === 'no-change').length,
        errors: results.filter(r => r.status === 'error').length,
      };
      return NextResponse.json({ results, summary, autoSave });
    }

    return NextResponse.json({ error: 'Provide ticker or tickers[]' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
