# BullOrBS Coding Assistant Instructions

These instructions apply to every coding assistant, regardless of vendor or
model.

1. Read `CLAUDE.md` and `DESIGN_QUEUE.md` before changing the repository.
   `CLAUDE.md` is the historical filename for the shared project rules; its
   instructions are not limited to Claude.
2. Preserve unrelated worktree changes and never edit
   `.claude/settings.json`.
3. For monthly planning, morning research/drafting, editorial approvals, or
   publishing, read `EDITORIAL_WORKFLOW.md` completely and follow its approval
   boundaries.
4. Use `node scripts/editorial-artifact-check.js` to validate editorial
   artifacts. Do not weaken the validator to make an invalid artifact pass.
5. Never commit, push, deploy, approve, or publish unless the user explicitly
   authorizes that action.
