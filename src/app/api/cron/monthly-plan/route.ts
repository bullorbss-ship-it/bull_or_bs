import { NextResponse } from 'next/server';
import { generateEditorialPlan, nextMonth } from '@/lib/editorial-plan';
import { getEditorialPlan, saveEditorialPlan } from '@/lib/editorial-store';
import { sendPlanApprovalEmail } from '@/lib/email';
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
  const month = nextMonth();
  const existing = getEditorialPlan(month);
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'plan already exists', month });
  }
  try {
    const plan = await generateEditorialPlan(month);
    const commit = await saveEditorialPlan(plan, `Create editorial plan for approval: ${month}`);
    if (!commit.ok) {
      return NextResponse.json({ error: commit.error, detail: commit.detail }, { status: commit.status });
    }
    const emailed = await sendPlanApprovalEmail(plan);
    return NextResponse.json({ ok: true, month, items: plan.items.length, emailed });
  } catch (error) {
    console.error('Monthly editorial plan failed', error);
    return NextResponse.json({ error: 'Monthly editorial plan failed' }, { status: 500 });
  }
}
