import { NextResponse } from 'next/server';
import { todayEST } from '@/lib/date';
import {
  getEditorialDraft,
  getEditorialPlan,
  saveEditorialDraft,
  saveEditorialPlan,
} from '@/lib/editorial-store';
import { createEditorialDraft } from '@/lib/research';
import { sendDraftApprovalEmail, sendEditorialStatusEmail } from '@/lib/email';
import { getEditorialExecutionMode } from '@/lib/ai/stage-provider';

export const runtime = 'nodejs';
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get('authorization') === `Bearer ${secret}`);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (getEditorialExecutionMode() === 'agent') {
    return NextResponse.json({
      ok: false,
      error: 'Assistant-operated mode does not run website AI crons',
    }, { status: 410 });
  }
  const today = todayEST();
  const month = today.slice(0, 7);
  const plan = getEditorialPlan(month);
  if (!plan || plan.status !== 'approved') {
    await sendEditorialStatusEmail(
      `BullOrBS draft paused — ${today}`,
      plan ? `The ${month} plan is ${plan.status}; approve it in /orange before research runs.` : `No editorial plan exists for ${month}.`,
    );
    return NextResponse.json({ ok: true, skipped: true, reason: 'approved plan required' });
  }

  const item = plan.items.find(candidate =>
    candidate.publishDate === today && candidate.status === 'planned',
  );
  if (!item) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no scheduled assignment' });
  }
  const draftId = `draft-${item.id}`;
  if (getEditorialDraft(draftId)) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'draft already exists', draftId });
  }

  try {
    item.status = 'researching';
    const draft = await createEditorialDraft(plan, item);
    const commit = await saveEditorialDraft(draft);
    if (!commit.ok) {
      return NextResponse.json({ error: commit.error, detail: commit.detail }, { status: commit.status });
    }
    item.status = 'drafted';
    await saveEditorialPlan(plan, `Mark editorial item drafted: ${item.id}`);
    const emailed = await sendDraftApprovalEmail(draft);
    return NextResponse.json({
      ok: true,
      draftId: draft.id,
      quality: draft.quality,
      verification: draft.verification.passed,
      emailed,
    });
  } catch (error) {
    item.status = 'planned';
    console.error('Daily editorial draft failed', error);
    await sendEditorialStatusEmail(
      `BullOrBS draft failed — ${today}`,
      error instanceof Error ? error.message : 'Unknown drafting error',
    );
    return NextResponse.json({ error: 'Daily editorial draft failed' }, { status: 500 });
  }
}
