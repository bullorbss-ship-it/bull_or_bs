import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import {
  getEditorialDraft,
  getEditorialDrafts,
  getEditorialPlan,
  saveEditorialDraft,
  saveEditorialPlan,
} from '@/lib/editorial-store';
import { nowEST } from '@/lib/date';
import { publishApprovedDraft } from '@/lib/publishing';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ drafts: getEditorialDrafts() });
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const id = String(body.id || '');
  const action = String(body.action || '');
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid draft ID' }, { status: 400 });
  }
  const draft = getEditorialDraft(id);
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  if (action === 'publish') {
    const result = await publishApprovedDraft(draft);
    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }
    return NextResponse.json({ success: true, commitSha: result.commitSha, url: result.url });
  }
  if (action !== 'reject') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  draft.status = 'rejected';
  draft.rejectedAt = nowEST();
  draft.article.editorialReview = {
    ...draft.article.editorialReview,
    status: 'rejected',
  };
  const result = await saveEditorialDraft(draft, `Reject editorial draft: ${draft.id}`);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, detail: result.detail }, { status: result.status });
  }
  const plan = getEditorialPlan(draft.planMonth);
  if (plan) {
    plan.items = plan.items.map(item =>
      item.id === draft.planItemId ? { ...item, status: 'rejected' } : item,
    );
    await saveEditorialPlan(plan, `Mark editorial item rejected: ${draft.planItemId}`);
  }
  return NextResponse.json({ draft });
}
