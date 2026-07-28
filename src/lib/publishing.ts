import { commitArticleToGitHub } from './github-commit';
import { getEditorialPlan, saveEditorialDraft, saveEditorialPlan } from './editorial-store';
import { nowEST } from './date';
import { validateEditorialDraft } from './quality';
import type { EditorialDraft } from './types';

export async function publishApprovedDraft(draft: EditorialDraft) {
  const quality = validateEditorialDraft(draft);
  if (!quality.passed) {
    return {
      ok: false as const,
      status: 422,
      error: 'Draft failed the publication quality gate',
      issues: quality.issues,
    };
  }

  const approvedAt = nowEST();
  draft.quality = quality;
  draft.article.factChecked = true;
  draft.article.editorialReview = {
    status: 'approved',
    approvedAt,
    researchId: draft.research.id,
    writerModel: draft.writerModel,
    verifierModel: draft.verification.model,
    qualityScore: quality.score,
  };
  const articleCommit = await commitArticleToGitHub(draft.article, {
    message: `Publish approved editorial: ${draft.article.slug}`,
  });
  if (!articleCommit.ok) return articleCommit;

  draft.status = 'published';
  draft.publishedAt = approvedAt;
  const draftCommit = await saveEditorialDraft(draft, `Approve editorial draft: ${draft.id}`);
  if (!draftCommit.ok) return draftCommit;

  const plan = getEditorialPlan(draft.planMonth);
  if (plan) {
    plan.items = plan.items.map(item =>
      item.id === draft.planItemId ? { ...item, status: 'published' } : item,
    );
    const planCommit = await saveEditorialPlan(plan, `Mark editorial item published: ${draft.planItemId}`);
    if (!planCommit.ok) return planCommit;
  }

  return {
    ok: true as const,
    commitSha: articleCommit.commitSha,
    url: articleCommit.url,
  };
}
