import fs from 'fs';
import path from 'path';
import type { EditorialDraft, EditorialPlan } from './types';
import { commitJsonToGitHub, type CommitResult } from './github-commit';

const ROOT = path.join(process.cwd(), 'data', 'editorial');
const PLAN_DIR = path.join(ROOT, 'plans');
const DRAFT_DIR = path.join(ROOT, 'drafts');

function safeId(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/i.test(value);
}

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function writeLocal(filePath: string, value: unknown): void {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
  } catch {
    // Vercel's filesystem is read-only. GitHub persistence below is canonical.
  }
}

export function getEditorialPlan(month: string): EditorialPlan | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  return readJson<EditorialPlan>(path.join(PLAN_DIR, `${month}.json`));
}

export function getEditorialPlans(): EditorialPlan[] {
  if (!fs.existsSync(PLAN_DIR)) return [];
  return fs.readdirSync(PLAN_DIR)
    .filter(file => /^\d{4}-\d{2}\.json$/.test(file))
    .map(file => readJson<EditorialPlan>(path.join(PLAN_DIR, file)))
    .filter((plan): plan is EditorialPlan => Boolean(plan))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function getEditorialDraft(id: string): EditorialDraft | null {
  if (!safeId(id)) return null;
  return readJson<EditorialDraft>(path.join(DRAFT_DIR, `${id}.json`));
}

export function getEditorialDrafts(): EditorialDraft[] {
  if (!fs.existsSync(DRAFT_DIR)) return [];
  return fs.readdirSync(DRAFT_DIR)
    .filter(file => /^[a-z0-9][a-z0-9-]*\.json$/i.test(file))
    .map(file => readJson<EditorialDraft>(path.join(DRAFT_DIR, file)))
    .filter((draft): draft is EditorialDraft => Boolean(draft))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveEditorialPlan(
  plan: EditorialPlan,
  message = `Editorial plan: ${plan.month}`,
): Promise<CommitResult> {
  writeLocal(path.join(PLAN_DIR, `${plan.month}.json`), plan);
  return commitJsonToGitHub(`data/editorial/plans/${plan.month}.json`, plan, message);
}

export async function saveEditorialDraft(
  draft: EditorialDraft,
  message = `Editorial draft: ${draft.id}`,
): Promise<CommitResult> {
  writeLocal(path.join(DRAFT_DIR, `${draft.id}.json`), draft);
  return commitJsonToGitHub(`data/editorial/drafts/${draft.id}.json`, draft, message);
}
