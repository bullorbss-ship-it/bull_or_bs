---
name: new-take
description: Quick-add a news take article from a topic
---

Generate a news take article. When user provides a topic:

1. Read `src/lib/ai/research-prompt.ts` to get the news research prompt template
2. Show the user the research prompt to paste into their research tool
3. Wait for the user to paste back the researched data
4. Remind them to go to /orange dashboard → News Take tab → paste data → generate
5. After generation, remind: takes do NOT need Opus fact-check (auto-SKIP)
6. Update DESIGN_QUEUE.md content scoreboard with new count

News takes are the fastest, safest content type. No speculation, no price predictions — only restructure verified facts with source links.
