import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { generateEditorialPlan } from '@/lib/editorial-plan';
import { getEditorialPlan, getEditorialPlans, saveEditorialPlan } from '@/lib/editorial-store';
import { nowEST } from '@/lib/date';
import { getEditorialExecutionMode } from '@/lib/ai/stage-provider';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ plans: getEditorialPlans() });
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const action = String(body.action || '');
  const month = String(body.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
  }

  if (action === 'generate') {
    if (getEditorialExecutionMode() === 'agent') {
      return NextResponse.json({
        error: 'Plan generation is coding-assistant operated',
        detail: 'Ask any coding assistant to read EDITORIAL_WORKFLOW.md and create the monthly plan.',
      }, { status: 409 });
    }
    try {
      const plan = await generateEditorialPlan(month);
      const result = await saveEditorialPlan(plan);
      if (!result.ok) {
        return NextResponse.json({ error: result.error, detail: result.detail }, { status: result.status });
      }
      return NextResponse.json({ plan });
    } catch (error) {
      console.error('Editorial plan generation failed', error);
      return NextResponse.json({ error: 'Editorial plan generation failed' }, { status: 500 });
    }
  }

  const plan = getEditorialPlan(month);
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  if (action === 'approve') {
    plan.status = 'approved';
    plan.approvedAt = nowEST();
    delete plan.rejectedAt;
  } else if (action === 'reject') {
    plan.status = 'rejected';
    plan.rejectedAt = nowEST();
    delete plan.approvedAt;
  } else {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }
  const result = await saveEditorialPlan(plan, `${action} editorial plan: ${month}`);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, detail: result.detail }, { status: result.status });
  }
  return NextResponse.json({ plan });
}
