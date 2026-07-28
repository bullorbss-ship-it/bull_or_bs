# BullOrBS

Evidence-backed stock comparisons and recommendation audits for Canadian
self-directed investors. The technology and approval workflow are built by
[Local Tech Edge](https://www.localtechedge.com/).

## Editorial workflow

1. Open the repository in any coding assistant and ask:
   `Read EDITORIAL_WORKFLOW.md and prepare the next monthly plan.`
2. The saved plan remains blocked until it is approved in chat or `/orange`.
3. Each weekday morning, ask:
   `Read EDITORIAL_WORKFLOW.md and run today's BullOrBS editorial pipeline.`
4. The assistant uses live web research to build a saved source packet, then
   starts a writing pass that receives only that packet.
5. A separate verification pass checks the draft against the packet and sources.
6. The quality gate requires primary sources, valid data-point links, an original
   comparison, stated uncertainty, and a passing verifier result.
7. The assistant returns the morning report and stops. Only an explicit
   **approve and publish** instruction creates a public article.

`EDITORIAL_WORKFLOW.md` is the canonical contract for Codex, Claude, DeepSeek,
Cursor, Copilot, and other repository-capable assistants. `AGENTS.md` provides a
neutral discovery entry point, while `.agents/skills/bullorbs-editorial` is an
optional adapter. Website AI crons and the legacy daily briefing are not
scheduled.

## Execution configuration

The default is `EDITORIAL_EXECUTION_MODE=agent`, which uses the active coding
assistant and needs no model API keys. The assistant needs repository access,
command execution, and live web access for the research operation. Optional
unattended API mode remains available by setting the mode to `api` and
configuring:

- `AI_PLAN_*`
- `AI_RESEARCH_*`
- `AI_WRITER_*`
- `AI_VERIFY_*`

No API key belongs in source control.

## Development

```bash
npm install
npm run dev
```

Before deployment:

```bash
npm run pre-deploy
```

This runs type-checking, lint/security checks, SEO/legal/content audits, the
editorial approval check, and documentation consistency checks.
