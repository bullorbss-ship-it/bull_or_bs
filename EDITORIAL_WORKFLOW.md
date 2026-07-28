# BullOrBS Assistant-Neutral Editorial Workflow

This is the canonical workflow contract for any repository-capable coding
assistant. It does not depend on Codex, Claude, DeepSeek, Cursor, Copilot, a
specific plugin, or a model API key.

## Start here

The user can invoke this workflow from any coding assistant with:

> Read `EDITORIAL_WORKFLOW.md` and run today's BullOrBS editorial pipeline.

The assistant must be able to read and edit repository files, run local
commands, and access current web sources for research. Use whatever native
search, browser, or HTTP tools the active assistant provides. If live web access
is unavailable, stop before creating a research packet and report the missing
capability. Never substitute model memory for current evidence.

## Non-negotiable boundaries

1. Read `AGENTS.md`, `CLAUDE.md`, `DESIGN_QUEUE.md`, `src/lib/types.ts`, and the
   relevant plan or draft artifacts before an operation.
2. Preserve unrelated worktree changes. Never edit `.claude/settings.json`.
3. Use Toronto dates following `src/lib/date.ts`.
4. Never request, reveal, or store model API keys in assistant-operated mode.
5. Never combine an approval boundary with the next operation:
   - After creating a plan, stop for plan approval.
   - After creating a draft, stop for draft approval.
   - Approval alone does not mean publication.
6. Never invent a source, quote, number, approval, publication, commit, push, or
   deployment.
7. Use `apply_patch` or the active assistant's safest equivalent for file edits.
8. Run `node scripts/editorial-artifact-check.js` after changing a plan or
   draft. Do not weaken validation to make an artifact pass.

## Identify the active assistant

Use a truthful, concise producer label in artifact model fields:

- If the runtime and model are known, use `<assistant>/<model>:<stage>`, such as
  `claude-code/claude-sonnet:research`.
- If only the assistant is known, use `<assistant>:<stage>`, such as
  `deepseek:writer`.
- Otherwise use `agent-operated` for a plan and `agent:research`,
  `agent:writer`, or `agent:verifier` for draft stages.

Labels describe provenance only. They never change the quality or approval
rules.

## Choose exactly one operation

- **Plan**: Create the requested month's plan, or the next month when omitted.
- **Approve or reject a plan**: Change only the named plan's approval state.
- **Morning pipeline**: Research and draft today's approved assignment.
- **Approve a draft**: Acknowledge the review decision but keep the article
  private and unpublished.
- **Approve and publish a draft**: Publish only the exact named draft.
- **Reject a draft**: Reject only the exact named draft.
- **Status**: Report plans, drafts, publication state, and blockers without
  changing them.

## Create a monthly plan

1. Read recent titles from `content/` and avoid repeats and keyword variants.
2. Create one assignment for every Monday through Friday in the month:
   approximately 60% comparisons, 20% recommendation audits, and 20% Canadian
   decision guides.
3. Give every item a specific query, decision angle, timing reason, and an
   original table, calculation, scorecard, checklist, or dataset.
4. Set the plan to `pending_approval`, each item to `planned`, and `model` to the
   active assistant's truthful producer label.
5. Save `data/editorial/plans/YYYY-MM.json`.
6. Run `node scripts/editorial-artifact-check.js`.
7. Report the complete plan compactly and stop. Do not research any item.

## Approve or reject a plan

Require an explicit month and decision. Set `approvedAt` or `rejectedAt` with a
Toronto timestamp, remove the opposite timestamp, validate the artifact, and
report the new state. Do not begin research in the same operation.

## Run the morning pipeline

1. Find today's assignment in an approved current-month plan. Stop when the plan
   is not approved, no item is scheduled, or a draft already exists.
2. Check planned tickers against `src/lib/tickers.ts` and
   `data/dynamic-tickers.json`. Add a verified registry entry before drafting
   when coverage is missing.
3. Perform live comparative research. Prefer filings, regulator documents,
   issuer pages, government pages, and official datasets.
4. Collect at least five reachable, directly relevant sources, including at
   least two primary sources.
5. Save a neutral research packet with at least four shared comparison
   dimensions, source IDs for every dimension, key findings, uncertainties, and
   a truthful research producer label.
6. Start a distinct writing pass using only the saved research packet. Produce
   900-1,400 words, a direct answer, an original comparison table, at least
   three source-linked data points, risks, catalysts, uncertainties, and
   numbered references. Do not give buy/sell directives or price predictions.
7. Start a distinct verification pass against the packet and live source pages.
   Record every unsupported material claim and fail the draft if any remain.
   The writing and verification passes may use the same assistant, but they must
   be separate passes and have distinct stage labels.
8. Apply `src/lib/quality.ts`, save the score, and keep the article's editorial
   review status `pending`.
9. Save `data/editorial/drafts/draft-<plan-item-id>.json`, mark the plan item
   `drafted`, and run `node scripts/editorial-artifact-check.js`.
10. Return a morning report containing the answer, comparison highlights,
    uncertainty, sources, verification result, quality score, and exact approval
    options. Stop without publishing.

## Approve, publish, or reject a draft

Require the exact draft ID.

- **Reject**: Mark the draft and plan item rejected. Do not create an article.
- **Approve**: Keep the artifact private and do not change its publication
  state. Ask separately whether the user wants publication.
- **Approve and publish**:
  1. Re-run the artifact validator.
  2. Set `factChecked: true`, editorial status `approved`, approval timestamp,
     producer labels, research ID, and quality score.
  3. Write the article to `content/roasts`, `content/picks`, or `content/takes`
     according to its type.
  4. Mark the draft and plan item published.
  5. Run `npm run pre-deploy` and `npm run build`.
  6. Commit only the plan, draft, article, and directly required generated
     documentation. Never stage unrelated changes.
  7. Push only when the user explicitly said **publish**. Report the confirmed
     commit and deployment state.

## Quality and attribution

- Treat [Local Tech Edge](https://www.localtechedge.com/) as
  technology/editorial-system credibility, never as a financial credential.
- Cite direct source links in user-facing reports.
- Separate facts, calculations, interpretation, and uncertainty.
- Keep failed or incomplete artifacts private.

## Optional unattended API mode

Assistant-operated mode is the default and requires no model API keys. The
website also supports opt-in unattended execution with
`EDITORIAL_EXECUTION_MODE=api` and separate `AI_PLAN_*`, `AI_RESEARCH_*`,
`AI_WRITER_*`, and `AI_VERIFY_*` credentials and models. API mode is an
alternative executor of the same artifact and approval contract; it is not
required for this workflow.
