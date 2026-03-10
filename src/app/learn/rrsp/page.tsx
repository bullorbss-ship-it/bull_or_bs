import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'RRSP Guide — Registered Retirement Savings Plan Explained',
  description:
    'Complete guide to the Canadian RRSP. Tax deductions, contribution limits, Home Buyers Plan, RRSP vs TFSA, and retirement withdrawal strategies.',
};

export default function RRSPGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn', href: '/learn' },
        { label: 'RRSP Guide' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        RRSP Guide: <span className="text-accent">Tax-Deferred Retirement Savings</span>
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          The RRSP is Canada&apos;s primary retirement savings vehicle. Contributions reduce your
          taxable income today, and investments grow tax-deferred until withdrawal. For high earners,
          the RRSP is one of the most effective tax planning tools available.
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How the RRSP Works</h2>
          <p>
            When you contribute to an RRSP, that amount is deducted from your taxable income for
            the year. If you earn $80,000 and contribute $10,000, you&apos;re taxed as if you earned
            $70,000. At a 30% marginal rate, that&apos;s a $3,000 tax refund.
          </p>
          <p className="mt-3">
            Investments inside the RRSP grow without being taxed. You pay tax later, when you withdraw
            in retirement — ideally at a lower tax bracket than when you contributed.
          </p>
          <p className="mt-3 text-foreground font-medium">
            The core RRSP bet: your tax rate at contribution is higher than your tax rate at withdrawal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contribution Limits</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">18% of previous year&apos;s earned income</strong>, up to the annual maximum</li>
            <li>2024 annual maximum: <span className="font-mono text-foreground">$31,560</span></li>
            <li>2025 annual maximum: <span className="font-mono text-foreground">$32,490</span></li>
            <li>Unused room carries forward indefinitely</li>
            <li>Deadline: 60 days after year-end (usually March 1)</li>
          </ul>
          <p className="text-xs text-muted-light mt-2">
            Check your exact deduction limit on your CRA Notice of Assessment or My Account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">When RRSP Beats TFSA</h2>
          <p>The RRSP is better when:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-foreground">Your income is high now</strong> (above ~$55K) and you expect lower income in retirement</li>
            <li><strong className="text-foreground">You want to hold US dividend stocks</strong> — RRSP is exempt from the 15% US withholding tax via the Canada-US tax treaty</li>
            <li><strong className="text-foreground">Your employer matches contributions</strong> — always take the match, it&apos;s free money</li>
            <li><strong className="text-foreground">You&apos;re buying a first home</strong> — the Home Buyers&apos; Plan (HBP) lets you borrow $60,000 from your RRSP tax-free</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">When TFSA Beats RRSP</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">Low income years</strong> (under ~$55K) — the tax deduction is worth less</li>
            <li><strong className="text-foreground">You need flexibility</strong> — TFSA withdrawals don&apos;t affect government benefits (OAS, GIS); RRSP withdrawals do</li>
            <li><strong className="text-foreground">You expect higher income in retirement</strong> — rare, but possible for business owners or those with large pensions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Home Buyers&apos; Plan (HBP)</h2>
          <p>
            First-time home buyers can withdraw up to <strong className="text-foreground">$60,000</strong> from
            their RRSP tax-free to buy a qualifying home (increased from $35,000 in 2024).
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Must be repaid to your RRSP over 15 years (starting the 2nd year after withdrawal)</li>
            <li>Missed repayments are added to your taxable income that year</li>
            <li>Can be combined with FHSA for even more tax-free home buying power</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Lifelong Learning Plan (LLP)</h2>
          <p>
            You can withdraw up to <strong className="text-foreground">$10,000/year</strong> (max $20,000 total) from
            your RRSP to fund full-time education for you or your spouse.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Must be repaid over 10 years</li>
            <li>Less well-known than HBP but equally useful</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Investment Strategy</h2>
          <p>The RRSP&apos;s tax-deferred nature makes it ideal for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-foreground">US-listed ETFs (VTI, VOO, QQQ)</strong> — 0% US withholding tax in RRSP vs 15% in TFSA</li>
            <li><strong className="text-foreground">Bonds and fixed income</strong> — interest is taxed at your full rate outside registered accounts, so shelter it here</li>
            <li><strong className="text-foreground">REITs</strong> — distributions are mostly income, highly tax-inefficient outside registered accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Common Mistakes</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong className="text-foreground">Contributing at low income.</strong> Save the deduction for high-income years. You can contribute now and defer the deduction.</li>
            <li><strong className="text-foreground">Spending the tax refund.</strong> The refund IS part of the RRSP strategy — reinvest it (ideally in your TFSA).</li>
            <li><strong className="text-foreground">Forgetting about forced withdrawals.</strong> RRSP converts to RRIF at 71, with mandatory minimum withdrawals that are taxed as income.</li>
            <li><strong className="text-foreground">Ignoring the clawback.</strong> RRSP/RRIF withdrawals count as income and can trigger OAS clawback (above ~$90K in 2025).</li>
            <li><strong className="text-foreground">Holding Canadian dividend stocks in RRSP.</strong> Canadian dividends get a tax credit in non-registered accounts — that credit is wasted inside an RRSP.</li>
          </ol>
        </section>

        <section className="bg-card-bg border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Bottom Line</h2>
          <p>
            The RRSP is a powerful tool if used correctly: contribute when your income is high, invest
            in tax-inefficient assets (US stocks, bonds, REITs), and plan your withdrawals to minimize
            lifetime tax. For most Canadians earning over $55K, maxing TFSA first then RRSP is the
            optimal order — unless your employer offers RRSP matching.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/learn/tfsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            TFSA Guide →
          </Link>
          <Link href="/learn/fhsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            FHSA Guide →
          </Link>
          <Link href="/learn" className="text-accent hover:text-accent-dim font-medium text-sm">
            ← All Guides
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-light">Last verified: March 2026. Contribution limits confirmed via CRA. Next audit: January 2027 (when 2026 tax year limits are finalized).</p>

      <div className="mt-8 pt-8 border-t border-card-border">
        <h3 className="text-lg font-bold mb-4">Get the newsletter</h3>
        <SubscribeForm />
      </div>
    </div>
  );
}
