#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  OK: ${message}`);
  } else {
    failures++;
    console.error(`  FAIL: ${message}`);
  }
}

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const cronPaths = vercel.crons.map(cron => cron.path);
check(!cronPaths.includes('/api/cron/daily-briefing'), 'legacy direct publisher is not scheduled');
check(!cronPaths.includes('/api/cron/monthly-plan'), 'API monthly planner is not scheduled in assistant mode');
check(!cronPaths.includes('/api/cron/daily-draft'), 'API morning drafter is not scheduled in assistant mode');

const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
check(envExample.includes('EDITORIAL_EXECUTION_MODE=agent'), 'assistant-operated mode is the default');
for (const stage of ['PLAN', 'RESEARCH', 'WRITER', 'VERIFY']) {
  check(envExample.includes(`AI_${stage}_API_KEY=`), `${stage.toLowerCase()} keeps an optional isolated API key`);
  check(envExample.includes(`AI_${stage}_MODEL=`), `${stage.toLowerCase()} keeps an optional isolated model`);
}

const workflow = fs.readFileSync(path.join(ROOT, 'EDITORIAL_WORKFLOW.md'), 'utf8');
check(
  workflow.includes('Never combine an approval boundary') &&
  workflow.includes('Never request, reveal, or store model API keys'),
  'canonical workflow preserves approval and key boundaries',
);
check(
  workflow.includes('If live web access') &&
  workflow.includes('stop before creating a research packet'),
  'canonical workflow blocks ungrounded research',
);

const agentInstructions = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
check(
  agentInstructions.includes('EDITORIAL_WORKFLOW.md'),
  'neutral assistant discovery points to the canonical workflow',
);

const skill = fs.readFileSync(
  path.join(ROOT, '.agents', 'skills', 'bullorbs-editorial', 'SKILL.md'),
  'utf8',
);
check(
  skill.includes('EDITORIAL_WORKFLOW.md') &&
  skill.includes('only a discovery adapter'),
  'optional skill is a thin adapter to the canonical workflow',
);

const content = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'content.ts'), 'utf8');
check(
  content.includes("article.tags?.includes('daily-briefing')") &&
  content.includes("article.editorialReview?.status === 'approved'"),
  'legacy daily briefings require editorial approval for indexing',
);

const commitRoute = fs.readFileSync(path.join(ROOT, 'src', 'app', 'api', 'admin', 'commit', 'route.ts'), 'utf8');
check(commitRoute.includes('Direct publishing is disabled'), 'legacy direct admin publishing is blocked');

const quality = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'quality.ts'), 'utf8');
check(quality.includes('validateEditorialDraft'), 'editorial evidence gate exists');
check(quality.includes('primarySources.length < 2'), 'quality gate requires primary sources');
check(quality.includes('draft.verification.passed'), 'quality gate requires independent verification');

const stageProvider = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'ai', 'stage-provider.ts'), 'utf8');
check(
  stageProvider.includes('stages must use different API keys') &&
  stageProvider.includes('stages must use different models'),
  'all editorial stages enforce separate keys and models',
);
check(
  stageProvider.includes("EditorialExecutionMode = 'agent' | 'api'"),
  'runtime mode is assistant-neutral',
);
const research = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'research.ts'), 'utf8');
check(research.includes('groundedUrls.has'), 'research sources must match web-search evidence');

const site = fs.readFileSync(path.join(ROOT, 'src', 'config', 'site.ts'), 'utf8');
check(site.includes('https://www.localtechedge.com/'), 'approved creator attribution is configured');

if (failures > 0) {
  console.error(`\n${failures} editorial workflow check(s) failed.`);
  process.exit(1);
}
console.log('\nEditorial approval workflow checks passed.');
