import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'TFSA Guide — Tax-Free Savings Account Explained',
  description:
    'Complete guide to the Canadian TFSA. Contribution limits, withdrawal rules, investment strategies, and common mistakes to avoid.',
  alternates: { canonical: '/learn/tfsa' },
};

export default function TFSAGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn', href: '/learn' },
        { label: 'TFSA Guide' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        TFSA Guide: <span className="text-accent">Tax-Free Growth</span>
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          The Tax-Free Savings Account is the single most powerful wealth-building tool
          available to Canadians. Every dollar of growth inside a TFSA — dividends, capital gains,
          interest — is <strong className="text-accent">completely tax-free</strong>. Forever.
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What Is a TFSA?</h2>
          <p>
            Despite the name, a TFSA is <strong className="text-foreground">not</strong> just a savings account.
            It&apos;s a registered investment account where you can hold cash, GICs, stocks, bonds, ETFs,
            and mutual funds. The &quot;tax-free&quot; part means the CRA will never tax any
            investment gains earned inside the account.
          </p>
          <p className="mt-3">
            You contribute with after-tax dollars (no tax deduction like an RRSP), but all
            growth is permanently sheltered from tax. When you withdraw, you pay zero tax.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contribution Limits</h2>
          <p>
            The TFSA was introduced in 2009. Each year, the government announces a new annual
            contribution limit. If you were 18+ in 2009 and have never contributed, your
            cumulative room is the sum of all annual limits since then.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Year</th>
                  <th className="text-right py-2 text-foreground font-semibold">Annual Limit</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2009–2012</td><td className="text-right">$5,000</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2013–2014</td><td className="text-right">$5,500</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2015</td><td className="text-right">$10,000</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2016–2018</td><td className="text-right">$5,500</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2019–2022</td><td className="text-right">$6,000</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2023</td><td className="text-right">$6,500</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2024</td><td className="text-right">$7,000</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2025</td><td className="text-right">$7,000</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">2026</td><td className="text-right">$7,000</td></tr>
                <tr><td className="py-1.5 pr-4 font-bold text-foreground">Lifetime total (2009–2026)</td><td className="text-right font-bold text-accent">$109,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-light mt-2">
            Contribution room accumulates starting the year you turn 18, even if you don&apos;t open a TFSA.
            Check your exact room on CRA My Account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Withdrawal Rules</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Withdraw anytime, for any reason — no penalties, no tax.</li>
            <li>Withdrawn amounts get added back to your contribution room on January 1 of the <strong className="text-foreground">following year</strong>.</li>
            <li><strong className="text-foreground">Do not</strong> re-contribute in the same year you withdraw unless you have room — this is the #1 cause of over-contribution penalties (1% per month on excess).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Investment Strategy</h2>
          <p>
            Since all growth is tax-free, the TFSA is ideal for your <strong className="text-foreground">highest-growth investments</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-foreground">Growth stocks and ETFs</strong> — capital gains are fully sheltered</li>
            <li><strong className="text-foreground">Canadian dividend stocks</strong> — dividend tax credit doesn&apos;t matter inside a TFSA (it&apos;s already tax-free), but if choosing between TFSA and non-registered, dividends in TFSA save you more</li>
            <li><strong className="text-foreground">US-listed ETFs</strong> — note that US dividends face a 15% withholding tax even inside a TFSA (unlike RRSP which is exempt via tax treaty)</li>
            <li><strong className="text-foreground">Avoid holding US dividend payers in TFSA</strong> if you have RRSP room — put them there instead</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Common Mistakes</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong className="text-foreground">Using it as a savings account.</strong> Holding cash at 0.5% wastes the tax-free compounding power. Invest it.</li>
            <li><strong className="text-foreground">Over-contributing.</strong> CRA charges 1% per month on excess. Track your room via CRA My Account.</li>
            <li><strong className="text-foreground">Re-contributing in the same year as withdrawal.</strong> Withdrawn room doesn&apos;t return until January 1.</li>
            <li><strong className="text-foreground">Day trading in a TFSA.</strong> CRA may reclassify your TFSA as a business, making gains fully taxable. Invest, don&apos;t trade.</li>
            <li><strong className="text-foreground">Holding US dividend stocks here instead of RRSP.</strong> The 15% US withholding tax is unrecoverable in a TFSA.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">TFSA vs RRSP — Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Feature</th>
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">TFSA</th>
                  <th className="text-left py-2 text-foreground font-semibold">RRSP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Tax on contributions</td><td className="pr-4">After-tax (no deduction)</td><td>Pre-tax (deduction)</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Tax on growth</td><td className="pr-4 text-accent font-medium">Tax-free</td><td className="text-accent font-medium">Tax-deferred</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Tax on withdrawal</td><td className="pr-4 text-accent font-medium">None</td><td>Taxed as income</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">US dividend withholding</td><td className="pr-4">15% (unrecoverable)</td><td>0% (treaty exempt)</td></tr>
                <tr><td className="py-1.5 pr-4">Best for</td><td className="pr-4">Growth assets, flexibility</td><td>High earners, retirement</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-card-bg border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Bottom Line</h2>
          <p>
            If you&apos;re not maxing out your TFSA, that should be priority #1. It&apos;s the most
            flexible, most tax-efficient account available to Canadians. Fill it with growth
            investments, leave it alone, and let compounding do the work.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/learn/rrsp" className="text-accent hover:text-accent-dim font-medium text-sm">
            RRSP Guide →
          </Link>
          <Link href="/learn/fhsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            FHSA Guide →
          </Link>
          <Link href="/learn" className="text-accent hover:text-accent-dim font-medium text-sm">
            ← All Guides
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-light">Last verified: March 2026. Contribution limits confirmed via CRA. Next audit: January 2027 (when 2027 limit is announced).</p>

      <div className="mt-8 pt-8 border-t border-card-border">
        <h3 className="text-lg font-bold mb-4">Get the newsletter</h3>
        <SubscribeForm />
      </div>
    </div>
  );
}
