---
name: code-review
description: Review recent code changes for quality, bugs, and consistency
---

Review recent code changes. Check for:

1. **Code style**: Matches existing patterns and conventions in CLAUDE.md
2. **Bugs**: Edge cases, null checks, error handling
3. **Performance**: No catastrophic regex, unnecessary re-renders, large bundles
4. **SEO impact**: Meta tags, Schema.org, OG images still working
5. **Security**: No new vulnerabilities introduced
6. **Anonymity**: No personal identifiers leaked
7. **Types**: TypeScript strict mode compliance

Run `npx tsc --noEmit` to verify type safety.
Report findings in a structured severity-rated list.
