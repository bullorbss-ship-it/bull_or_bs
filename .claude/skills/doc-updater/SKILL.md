---
name: doc-updater
description: Sync all documentation with current code state
---

Review the codebase and update all documentation to reflect current reality:

1. **DESIGN_QUEUE.md** — Update task statuses, content scoreboard, blockers
2. **docs/project-status.md** — Update article counts, ticker counts, completed features
3. **docs/DEPLOY-STATUS.md** — Run `npm run docs` to regenerate
4. **docs/fact-check-log.md** — Add any new articles, update FC status
5. **docs/architecture-decisions.md** — Add new ADRs if architectural changes were made
6. **CLAUDE.md** — Update if project structure, conventions, or tech stack changed

Count reality:
- Articles: `ls content/roasts/*.json content/picks/*.json content/takes/*.json | wc -l`
- Tickers: `grep -c "exchange:" src/lib/tickers.ts`
- Stock profiles: `ls data/stocks/*.json | wc -l`
- Pages: `find src/app -name "page.tsx" | wc -l`
