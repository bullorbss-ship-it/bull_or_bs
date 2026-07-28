import nodemailer from 'nodemailer';
import { siteConfig } from '@/config/site';
import type { EditorialDraft, EditorialPlan } from './types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function send(subject: string, html: string): Promise<boolean> {
  const to = process.env.DAILY_EMAIL_TO;
  const password = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.DAILY_EMAIL_FROM || 'bull.or.bss@gmail.com';
  if (!to || !password) return false;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: from, pass: password },
  });
  await transporter.sendMail({
    from: `"BullOrBS Editorial" <${from}>`,
    to,
    subject,
    html,
  });
  return true;
}

function shell(title: string, body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:auto;color:#0f172a">
    <div style="background:#0f172a;color:white;padding:22px 26px;border-radius:12px 12px 0 0">
      <h1 style="font-size:20px;margin:0;color:#10b981">${escapeHtml(title)}</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:0;padding:24px 26px;border-radius:0 0 12px 12px">
      ${body}
      <p style="margin:24px 0 0"><a href="${siteConfig.url}/orange" style="background:#10b981;color:white;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">Review in dashboard</a></p>
      <p style="color:#64748b;font-size:11px;margin-top:20px">Nothing is published until you approve it in the authenticated dashboard.</p>
    </div>
  </div>`;
}

export function sendPlanApprovalEmail(plan: EditorialPlan): Promise<boolean> {
  const rows = plan.items.map(item => `<li style="margin-bottom:12px">
    <strong>${escapeHtml(item.publishDate)} — ${escapeHtml(item.title)}</strong><br>
    <span style="color:#64748b">${escapeHtml(item.angle)}</span>
  </li>`).join('');
  return send(
    `Approve BullOrBS editorial plan — ${plan.month}`,
    shell(`Editorial plan ready — ${plan.month}`, `<p>${plan.items.length} evidence-first assignments are ready for review.</p><ol>${rows}</ol>`),
  );
}

export function sendDraftApprovalEmail(draft: EditorialDraft): Promise<boolean> {
  const issues = draft.quality.issues.length
    ? `<ul>${draft.quality.issues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>`
    : '<p>No quality issues detected.</p>';
  const findings = draft.research.keyFindings
    .map(finding => `<li>${escapeHtml(finding)}</li>`)
    .join('');
  const uncertainties = draft.research.uncertainties
    .map(uncertainty => `<li>${escapeHtml(uncertainty)}</li>`)
    .join('');
  const sources = draft.research.sources
    .map(source => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a> (${escapeHtml(source.sourceType)})</li>`)
    .join('');
  return send(
    `Review BullOrBS draft — ${draft.article.title}`,
    shell('Morning draft ready', `
      <h2 style="font-size:18px">${escapeHtml(draft.article.title)}</h2>
      <p>${escapeHtml(draft.article.description)}</p>
      <p><strong>Quality:</strong> ${draft.quality.score}/100 · ${draft.quality.passed ? 'passed' : 'blocked'}</p>
      <p><strong>Verification:</strong> ${draft.verification.passed ? 'passed' : 'blocked'} · ${draft.research.sources.length} sources</p>
      <h3 style="font-size:15px;margin-top:20px">Key findings</h3>
      <ul>${findings}</ul>
      <h3 style="font-size:15px;margin-top:20px">Uncertainties</h3>
      <ul>${uncertainties}</ul>
      <h3 style="font-size:15px;margin-top:20px">Research sources</h3>
      <ol>${sources}</ol>
      <h3 style="font-size:15px;margin-top:20px">Quality report</h3>
      ${issues}
    `),
  );
}

export function sendEditorialStatusEmail(subject: string, message: string): Promise<boolean> {
  return send(subject, shell(subject, `<p>${escapeHtml(message)}</p>`));
}
