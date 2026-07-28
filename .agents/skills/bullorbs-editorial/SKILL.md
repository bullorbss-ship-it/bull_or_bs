---
name: bullorbs-editorial
description: Run the assistant-neutral, approval-first BullOrBS editorial workflow without external model API keys. Use when the user asks to create or approve a monthly content plan, run the morning or daily pipeline, research and draft an approved assignment, review an editorial report, reject a draft, or approve and publish a BullOrBS article.
---

# BullOrBS Editorial

Read the repository-root `EDITORIAL_WORKFLOW.md` completely and follow it as the
canonical contract. This skill is only a discovery adapter; do not create a
second implementation here.

Never combine an approval boundary with the next operation. After creating a
plan, stop for plan approval. After creating a draft, stop for draft approval.
Never request, reveal, or store model API keys in assistant-operated mode.
