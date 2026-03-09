import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'FHSA Guide — First Home Savings Account Explained',
  description:
    'Complete guide to Canada\'s FHSA. Tax-deductible contributions, tax-free withdrawals for your first home, contribution limits, and strategies to maximize it.',
};

export default function FHSAGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn', href: '/learn' },
        { label: 'FHSA Guide' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        FHSA Guide: <span className="text-accent">The Best Deal for First-Time Buyers</span>
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          The First Home Savings Account combines the best features of the TFSA and RRSP into one
          account: <strong className="text-accent">tax-deductible contributions</strong> going in, and{' '}
          <strong className="text-accent">tax-free withdrawals</strong> coming out. If you&apos;re a
          first-time home buyer in Canada, this is the single best financial tool available to you.
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How It Works</h2>
          <p>
            The FHSA launched April 1, 2023. It lets you save up to $40,000 for your first home
            with double tax advantages:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Contributions are tax-deductible</strong> — just like an RRSP, reducing your taxable income</li>
            <li><strong className="text-foreground">Withdrawals for a home purchase are tax-free</strong> — just like a TFSA</li>
            <li><strong className="text-foreground">Growth inside the account is tax-free</strong> — dividends, interest, and capital gains are sheltered</li>
          </ul>
          <p className="mt-3 text-foreground font-medium">
            RRSP gives you a deduction going in. TFSA gives you tax-free coming out. FHSA gives you both.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contribution Limits</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">$8,000 per year</strong>, up to a lifetime maximum of $40,000</li>
            <li>Unused room carries forward (max $8,000 carry-forward per year)</li>
            <li>Maximum contribution in any single year: <span className="font-mono text-foreground">$16,000</span> (current year + carried forward)</li>
            <li>Account must be used within 15 years of opening, or by age 71</li>
          </ul>
          <div className="mt-4 bg-card-bg border border-card-border rounded-lg p-4">
            <p className="text-sm text-foreground font-medium">Example: Open in 2024, skip 2024, contribute in 2025</p>
            <p className="text-sm mt-1">
              2024 room: $8,000 (unused, carries forward) → 2025 room: $8,000 + $8,000 = $16,000 max
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Eligibility</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Canadian resident, age 18+ (or age of majority in your province)</li>
            <li><strong className="text-foreground">First-time home buyer</strong>: you (and your spouse) must not have owned a qualifying home that you lived in during the current year or the preceding 4 calendar years</li>
            <li>You can have both an FHSA and use the RRSP Home Buyers&apos; Plan — they stack</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">The Power Move: FHSA + HBP Stack</h2>
          <p>
            This is the most powerful first-home strategy in Canada:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Source</th>
                  <th className="text-right py-2 pr-4 text-foreground font-semibold">Amount</th>
                  <th className="text-left py-2 text-foreground font-semibold">Tax Treatment</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">FHSA</td><td className="text-right pr-4">$40,000</td><td className="font-sans">Tax-free (no repayment)</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">RRSP HBP</td><td className="text-right pr-4">$60,000</td><td className="font-sans">Tax-free (repay over 15 years)</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">RRSP HBP (spouse)</td><td className="text-right pr-4">$60,000</td><td className="font-sans">Tax-free (repay over 15 years)</td></tr>
                <tr><td className="py-1.5 pr-4 font-bold text-foreground">Total (couple)</td><td className="text-right pr-4 font-bold text-accent">$200,000</td><td className="font-sans">Tax-advantaged for down payment</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-light mt-2">
            A couple with both FHSA and RRSP can access up to $200,000 in tax-advantaged funds for a first home.
            The FHSA portion never needs to be repaid.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Investment Strategy</h2>
          <p>Your FHSA strategy depends on your timeline:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-foreground">Buying in 1–2 years:</strong> GICs or high-interest savings — protect the principal</li>
            <li><strong className="text-foreground">Buying in 3–5 years:</strong> Balanced ETF (like VBAL) or a mix of bonds + equities</li>
            <li><strong className="text-foreground">Buying in 5+ years:</strong> Growth ETFs (XEQT, VEQT) — you have time to ride out volatility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What Happens If You Don&apos;t Buy a Home?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You can <strong className="text-foreground">transfer the FHSA to your RRSP</strong> without using RRSP contribution room — the money doesn&apos;t disappear</li>
            <li>If you don&apos;t transfer and don&apos;t buy, the FHSA must be closed after 15 years (or age 71) and withdrawals are taxable</li>
            <li>Even if you&apos;re unsure about buying, opening an FHSA starts the clock and the carry-forward — it costs nothing to open</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Common Mistakes</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong className="text-foreground">Not opening one ASAP.</strong> The 15-year clock and carry-forward start when you open the account. Even $1 opens it.</li>
            <li><strong className="text-foreground">Not knowing it exists.</strong> Surveys show most first-time buyers still don&apos;t know about the FHSA.</li>
            <li><strong className="text-foreground">Forgetting it transfers to RRSP.</strong> If plans change, your money isn&apos;t locked — it rolls to your RRSP tax-free.</li>
            <li><strong className="text-foreground">Holding cash instead of investing.</strong> Same mistake as TFSA — the account is for investing, not parking cash.</li>
          </ol>
        </section>

        <section className="bg-card-bg border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Bottom Line</h2>
          <p>
            If you&apos;re a first-time home buyer in Canada, open an FHSA today — even with $1. Start
            the clock, start the carry-forward, and start saving with the best tax deal the government
            offers. Combined with the RRSP Home Buyers&apos; Plan, a couple can access up to $200,000 in
            tax-advantaged funds for a down payment. There is no reason not to use this.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/learn/tfsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            TFSA Guide →
          </Link>
          <Link href="/learn/rrsp" className="text-accent hover:text-accent-dim font-medium text-sm">
            RRSP Guide →
          </Link>
          <Link href="/learn" className="text-accent hover:text-accent-dim font-medium text-sm">
            ← All Guides
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-card-border">
        <h3 className="text-lg font-bold mb-4">Get the newsletter</h3>
        <SubscribeForm />
      </div>
    </div>
  );
}
