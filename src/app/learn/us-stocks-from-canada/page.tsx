import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'Buying US Stocks from Canada — Complete Guide',
  description:
    'How to buy US stocks from Canada. Currency conversion, withholding tax, RRSP trick, Norbert\'s Gambit, and which account to use.',
  alternates: { canonical: '/learn/us-stocks-from-canada' },
};

export default function USStocksFromCanadaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn', href: '/learn' },
        { label: 'US Stocks from Canada' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Buying US Stocks from Canada: <span className="text-accent">The Complete Guide</span>
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          The biggest companies in the world — Apple, Microsoft, Nvidia, Amazon — trade on US
          exchanges. As a Canadian, you can absolutely buy them. You just need to understand
          the <strong className="text-accent">currency costs</strong>, <strong className="text-accent">withholding taxes</strong>,
          and which account to use so you don&apos;t leave money on the table.
        </p>

        {/* Section 1: Why Buy US Stocks? */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Why Buy US Stocks?</h2>
          <p>
            The TSX is heavily concentrated in banks, energy, and mining. If you only invest in
            Canadian stocks, you&apos;re missing exposure to the world&apos;s largest tech companies,
            healthcare giants, and consumer brands.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Apple (AAPL)</strong>, <strong className="text-foreground">Microsoft (MSFT)</strong>, <strong className="text-foreground">Nvidia (NVDA)</strong>, <strong className="text-foreground">Amazon (AMZN)</strong> — none of these trade on the TSX.</li>
            <li>The S&amp;P 500 has historically outperformed the TSX over most long-term periods.</li>
            <li>Diversifying into US stocks reduces your dependence on the Canadian economy.</li>
            <li>Many US companies pay growing dividends with decades-long track records.</li>
          </ul>
          <p className="mt-3">
            You don&apos;t need to go all-in on US stocks — but having <strong className="text-foreground">zero US exposure</strong> is
            a real risk for a Canadian portfolio.
          </p>
        </section>

        {/* Section 2: How to Buy */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How to Buy US Stocks from Canada</h2>
          <p>
            There are two main approaches:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-3">
            <li>
              <strong className="text-foreground">Buy directly on US exchanges.</strong> Most Canadian
              brokerages (Wealthsimple, Questrade, TD Direct, IBKR) let you buy stocks on the NYSE
              and NASDAQ. You&apos;ll need to convert CAD to USD first — this is where currency costs
              come in.
            </li>
            <li>
              <strong className="text-foreground">Buy CAD-listed ETFs that hold US stocks.</strong> ETFs
              like VFV (Vanguard S&amp;P 500, TSX-listed) or XUU (iShares Total US Market) let you
              buy US exposure in Canadian dollars. No currency conversion needed on your end — the
              fund handles it internally.
            </li>
          </ol>
          <p className="mt-3">
            Both are valid. Direct US stocks give you more control. CAD-listed ETFs are simpler.
            The right choice depends on your account type and how much you&apos;re investing.
          </p>
        </section>

        {/* Section 3: Currency Conversion */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Currency Conversion: Don&apos;t Pay 2.5%</h2>
          <p>
            When you buy US stocks, you need US dollars. Your broker will happily convert your CAD
            to USD — but most charge a <strong className="text-foreground">1.5% to 2.5% spread</strong> on
            every conversion. On a $10,000 purchase, that&apos;s $150–$250 gone before you even invest.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Norbert&apos;s Gambit</h3>
          <p>
            Norbert&apos;s Gambit is a workaround that cuts your conversion cost to nearly zero.
            Here&apos;s how it works:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Buy a stock or ETF that trades on <strong className="text-foreground">both</strong> the TSX (in CAD) and a US exchange (in USD). The most common one is DLR / DLR.U on the TSX.</li>
            <li>Buy DLR on the TSX in Canadian dollars.</li>
            <li>Call your broker and ask them to &quot;journal&quot; your DLR shares to DLR.U (the USD side).</li>
            <li>Sell DLR.U — now you have USD in your account.</li>
          </ol>
          <p className="mt-3">
            Total cost: two small commissions (often $0 at discount brokers) instead of a 2% spread.
            The journaling step usually takes 2–3 business days.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">USD Accounts</h3>
          <p>
            Most brokerages let you hold a <strong className="text-foreground">USD sub-account</strong> inside
            your RRSP or TFSA. Once you convert to USD (via Norbert&apos;s Gambit or otherwise), keep
            it in USD. Don&apos;t convert back and forth — every round trip costs you.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Wealthsimple note:</strong> Wealthsimple charges 1.5%
            on currency conversion unless you&apos;re on their Plus plan ($10/month), which
            includes USD accounts and free conversions.
          </p>
        </section>

        {/* Section 4: Withholding Tax on US Dividends */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Withholding Tax on US Dividends</h2>
          <p>
            When a US company pays you a dividend, the IRS automatically withholds <strong className="text-accent">15%</strong> before
            it reaches your account. This is called <strong className="text-foreground">withholding tax</strong>.
          </p>
          <p className="mt-3">
            For example, if you own $10,000 of a US stock paying a 3% dividend ($300/year), the IRS
            keeps $45 and you receive $255. This happens automatically — you don&apos;t file anything
            with the IRS.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Form W-8BEN</h3>
          <p>
            To get the reduced 15% rate (instead of the default 30%), you need to have a
            <strong className="text-foreground"> W-8BEN form</strong> on file with your broker. Most
            Canadian brokerages handle this electronically when you open your account. It&apos;s valid
            for 3 years and certifies that you&apos;re a Canadian tax resident entitled to the
            US-Canada tax treaty rate.
          </p>
          <p className="mt-2">
            If you haven&apos;t filed a W-8BEN, you&apos;re paying 30% withholding instead of 15%.
            Check with your broker — most let you sign it digitally in your account settings.
          </p>
        </section>

        {/* Section 5: The RRSP Trick */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">The RRSP Trick: 0% Withholding Tax</h2>
          <p>
            Here&apos;s the single most important thing to know about US stocks in Canada:
          </p>
          <div className="bg-card-bg border border-card-border rounded-xl p-5 mt-3">
            <p className="text-foreground font-medium">
              The US-Canada tax treaty <strong className="text-accent">exempts RRSPs</strong> from the
              15% US dividend withholding tax. You keep 100% of your US dividends inside an RRSP.
            </p>
          </div>
          <p className="mt-3">
            This doesn&apos;t apply to TFSAs, non-registered accounts, or RESPs. Only RRSPs and
            RRIFs get the exemption.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">What this means practically:</strong> if you own
            US dividend-paying stocks or US-listed ETFs (like VOO or VTI), hold them in your RRSP.
            You&apos;ll save 15% on every dividend payment for the life of the investment.
          </p>
          <p className="mt-3">
            For US stocks that pay little or no dividends (growth stocks like AMZN, GOOG, TSLA),
            it doesn&apos;t matter as much — the withholding tax only applies to dividends,
            not capital gains.
          </p>
        </section>

        {/* Section 6: TFSA vs RRSP for US Stocks */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">TFSA vs RRSP for US Stocks</h2>
          <p>
            The account you choose changes how much of your US dividends you actually keep.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Feature</th>
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">TFSA</th>
                  <th className="text-left py-2 text-foreground font-semibold">RRSP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">US dividend withholding</td><td className="pr-4">15% withheld</td><td className="text-accent font-medium">0% (treaty exempt)</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Capital gains tax</td><td className="pr-4 text-accent font-medium">Tax-free</td><td>Tax-deferred</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Withdrawal tax</td><td className="pr-4 text-accent font-medium">None</td><td>Taxed as income</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Best for US dividend stocks</td><td className="pr-4">No</td><td className="text-accent font-medium">Yes</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Best for US growth stocks</td><td className="pr-4 text-accent font-medium">Yes</td><td>Also fine</td></tr>
                <tr><td className="py-1.5 pr-4">Flexibility</td><td className="pr-4 text-accent font-medium">Withdraw anytime</td><td>Locked until retirement</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3">
            <strong className="text-foreground">Simple rule:</strong> US stocks that pay big dividends
            (banks, REITs, utilities) go in your RRSP. US growth stocks with small or no dividends
            go in your TFSA.
          </p>
        </section>

        {/* Section 7: CAD-Listed US ETFs vs US-Listed */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">CAD-Listed US ETFs vs US-Listed</h2>
          <p>
            You can get S&amp;P 500 exposure by buying VOO in USD on the NYSE, or by buying VFV in
            CAD on the TSX. Both track the same index. But there are meaningful differences.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Factor</th>
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">US-Listed (e.g., VOO, VTI)</th>
                  <th className="text-left py-2 text-foreground font-semibold">CAD-Listed (e.g., VFV, XUU)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Currency</td><td className="pr-4">USD</td><td>CAD</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">MER</td><td className="pr-4 text-accent font-medium">~0.03%</td><td>~0.09–0.22%</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Withholding tax layers</td><td className="pr-4">1 layer (15% in non-RRSP)</td><td>1–2 layers (fund level + you)</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">RRSP withholding</td><td className="pr-4 text-accent font-medium">0% (direct treaty benefit)</td><td>15% withheld at fund level</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Currency conversion</td><td className="pr-4">You handle it</td><td className="text-accent font-medium">Fund handles it</td></tr>
                <tr className="border-b border-card-border/50"><td className="py-1.5 pr-4">Simplicity</td><td className="pr-4">More steps</td><td className="text-accent font-medium">Buy and forget</td></tr>
                <tr><td className="py-1.5 pr-4">Best for</td><td className="pr-4">Large RRSP holdings, low cost</td><td>TFSA, small accounts, simplicity</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            <strong className="text-foreground">Key nuance:</strong> CAD-listed ETFs like VFV are
            &quot;wrapper&quot; funds — they hold the US-listed VOO inside them. US dividends are
            withheld at the fund level (15%) before flowing to you. In an RRSP, you don&apos;t get
            the treaty exemption because <strong className="text-foreground">you</strong> don&apos;t
            directly own the US securities — the Canadian fund does.
          </p>
          <p className="mt-3">
            For most people investing under $50,000 in US exposure, the simplicity of CAD-listed
            ETFs outweighs the small cost difference. Over $50,000 in an RRSP, the math favors
            buying US-listed ETFs directly via Norbert&apos;s Gambit.
          </p>
        </section>

        {/* Section 8: Reporting on Canadian Taxes */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Reporting on Canadian Taxes</h2>
          <p>
            If your US stocks are inside a TFSA or RRSP, there&apos;s <strong className="text-foreground">nothing to report</strong> on
            your Canadian tax return — the account is tax-sheltered.
          </p>
          <p className="mt-3">
            If you hold US stocks in a <strong className="text-foreground">non-registered (taxable) account</strong>,
            here&apos;s what you need to know:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong className="text-foreground">T3/T5 slips:</strong> Your broker will issue these for
              any dividends or distributions you received. US dividends show up as foreign income.
            </li>
            <li>
              <strong className="text-foreground">Foreign tax credit:</strong> The 15% US withholding tax
              you paid can be claimed as a credit on your Canadian return using <strong className="text-foreground">Form T2209</strong> (Federal
              Foreign Tax Credits). This prevents double taxation — you get credit for taxes already
              paid to the US.
            </li>
            <li>
              <strong className="text-foreground">Capital gains:</strong> When you sell US stocks at a
              profit, you report the gain in CAD (using the exchange rate on the date of sale). Only
              50% of capital gains are taxable.
            </li>
            <li>
              <strong className="text-foreground">Foreign property reporting:</strong> If your total
              cost of foreign assets exceeds $100,000 CAD at any point in the year, you must file
              Form T1135 (Foreign Income Verification Statement). This includes US stocks in non-registered
              accounts but <strong className="text-foreground">excludes</strong> TFSA, RRSP, and other registered accounts.
            </li>
          </ul>
        </section>

        {/* Section 9: Common Mistakes */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Common Mistakes</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Paying 2.5% on every currency conversion.</strong> Use
              Norbert&apos;s Gambit or a broker with free USD conversion. A 2% spread on every buy
              and sell is 4% round-trip — that&apos;s a year of returns gone.
            </li>
            <li>
              <strong className="text-foreground">Holding US dividend stocks in a TFSA.</strong> You&apos;re
              losing 15% of every dividend to US withholding tax with no way to get it back. Put them
              in your RRSP instead.
            </li>
            <li>
              <strong className="text-foreground">Not filing a W-8BEN.</strong> Without it, you pay 30%
              withholding instead of 15%. Most brokers handle this automatically, but check yours.
            </li>
            <li>
              <strong className="text-foreground">Buying CAD-listed ETFs in an RRSP for large amounts.</strong> You
              lose the treaty exemption on dividends. For big RRSP holdings, buy the US-listed version
              directly (VOO instead of VFV, VTI instead of XUU).
            </li>
            <li>
              <strong className="text-foreground">Converting USD back to CAD unnecessarily.</strong> If
              you sell a US stock and plan to buy another US stock, keep the USD. Every conversion
              costs you.
            </li>
            <li>
              <strong className="text-foreground">Forgetting Form T1135.</strong> If your foreign assets
              in non-registered accounts exceed $100,000 CAD, you must file this form. The penalty
              for not filing is $25/day, up to $2,500.
            </li>
            <li>
              <strong className="text-foreground">Ignoring currency risk.</strong> When the CAD strengthens
              against the USD, your US holdings lose value in CAD terms — even if the stock price
              didn&apos;t change. This works both ways: a weak CAD boosts your US returns.
            </li>
          </ol>
        </section>

        {/* Section 10: Bottom Line */}
        <section className="bg-card-bg border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Bottom Line</h2>
          <p>
            Every Canadian investor should have some US exposure. The biggest companies in the
            world trade on US exchanges, and ignoring them means a portfolio heavily tilted toward
            banks and oil.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li>US dividend stocks go in your <strong className="text-accent">RRSP</strong> (0% withholding tax).</li>
            <li>US growth stocks can go in your <strong className="text-accent">TFSA</strong> (tax-free gains, minimal dividend impact).</li>
            <li>Use <strong className="text-accent">Norbert&apos;s Gambit</strong> to convert currency cheaply.</li>
            <li>For simplicity, CAD-listed ETFs like VFV or XUU work great — especially in a TFSA.</li>
            <li>For large RRSP holdings, buy US-listed ETFs directly (VOO, VTI) to get the full treaty benefit.</li>
          </ul>
        </section>

        <p className="text-xs text-muted-light">
          Last verified: March 2026. Tax rules and contribution limits can change — always confirm
          with the CRA or a tax professional before making decisions based on this guide.
        </p>

        {/* Section 11: Links to other guides */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/learn/tfsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            TFSA Guide →
          </Link>
          <Link href="/learn/rrsp" className="text-accent hover:text-accent-dim font-medium text-sm">
            RRSP Guide →
          </Link>
          <Link href="/learn/dividend-investing" className="text-accent hover:text-accent-dim font-medium text-sm">
            Dividend Investing →
          </Link>
          <Link href="/stock" className="text-accent hover:text-accent-dim font-medium text-sm">
            Stock Pages →
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
