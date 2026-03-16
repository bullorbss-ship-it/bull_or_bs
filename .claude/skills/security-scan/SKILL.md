---
name: security-scan
description: Scan codebase for leaked secrets, API keys, and anonymity violations
---

Perform a thorough security scan of the entire codebase. Check for:

1. **Hardcoded secrets**: API keys (`sk-*`, `ghp_*`), passwords, tokens with actual values
2. **Personal identity leaks**: Real names, personal emails (NOT bull.or.bss@gmail.com)
3. **Anonymity violations**: Owner identity in code, comments, docs, config, git config
4. **.env files**: Should never be committed (check .gitignore)
5. **Insecure patterns**: SQL injection, XSS, command injection, eval()
6. **Dependencies**: Run `npm audit` for known vulnerabilities
7. **Sensitive data in git**: Check if subscribers.json or other PII is committed

Report findings in severity order: CRITICAL → HIGH → MEDIUM → LOW
For each finding, include: file, line, what's wrong, and how to fix it.
