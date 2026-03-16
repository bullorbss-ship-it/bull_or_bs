---
name: deploy
description: Run pre-deploy pipeline, commit, and push to trigger Vercel deploy
---

Deploy the app to production. Follow this exact sequence:

1. Run `npm run pre-deploy` — all 8 gates must pass
2. If any gate fails, fix the issue and re-run
3. Run `git status` to see what's changed
4. Stage relevant files (never stage .env or secrets)
5. Commit with a clear message
6. CONFIRM with user before pushing
7. `git push origin main`
8. Remind: Vercel auto-deploys from main — check https://bullorbs.com after ~60s

IMPORTANT: Always confirm with the user before pushing. Never push without approval.
