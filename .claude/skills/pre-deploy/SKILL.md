---
name: pre-deploy
description: Run all 8 pre-deploy quality gates
---

Run the full pre-deploy pipeline and report results:

1. Run `npm run pre-deploy`
2. If it passes — report "All 8 gates passed. Ready to push."
3. If it fails — identify which gate failed, show the error, and fix it
4. Re-run until all gates pass

Gates in order: type-check → lint → SAST → SEO → legal → content-audit → docs → docs-check
