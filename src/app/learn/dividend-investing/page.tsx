import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'Dividend Investing Guide — How Dividends Work in Canada',
  description:
    'Complete guide to dividend investing for Canadians. How dividends work, tax treatment, DRIP, where to hold them, and common mistakes.',
  alternates: { canonical: '/learn/dividend-investing' },
};

export default function DividendInvestingGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn', href: '/learn' },
        { label: 'Dividend Investing' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Dividend Investing: <span className="text-accent">Get Paid to Hold</span>
      </h1>

      <div className="space-y-8 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          Dividend investing is one of the simplest ways to build wealth. You buy shares in a company,
          and that company <strong className="text-accent">pays you a portion of its profits</strong> just
          for being a shareholder. No selling required. The cash shows up in your account like clockwork.
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What Are Dividends?</h2>
          <p>
            When a company makes a profit, it has two choices: reinvest that money back into the
            business, or share some of it with shareholders. That share of profit paid out to you
            is called a <strong className="text-foreground">dividend</strong>.
          </p>
          <p className="mt-3">
            Most dividend-paying companies send payments every quarter (four times a year). Some pay
            monthly. The amount is usually a fixed dollar value per share &mdash; for example, $0.50
            per share per quarter. If you own 100 shares, that&apos;s $50 every three months, deposited
            straight into your brokerage account.
          </p>
          <p className="mt-3">
            You don&apos;t have to do anything. You don&apos;t have to sell your shares. The company
            just sends you cash. That&apos;s the appeal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Key Terms Made Simple</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong className="text-foreground">Dividend Yield</strong> &mdash; The annual dividend
              payment divided by the stock price, shown as a percentage. A $100 stock paying $4/year
              has a 4% yield. Higher isn&apos;t always better (more on that in Red Flags below).
            </li>
            <li>
              <strong className="text-foreground">Payout Ratio</strong> &mdash; The percentage of a
              company&apos;s earnings that goes to dividends. A 50% payout ratio means half the profit
              goes to shareholders, half stays in the business. Under 70% is generally healthy.
              Over 100% means the company is paying out more than it earns &mdash; a warning sign.
            </li>
            <li>
              <strong className="text-foreground">Ex-Dividend Date</strong> &mdash; The cutoff date.
              If you buy the stock on or after this date, you don&apos;t get the next dividend payment.
              You need to own shares <strong className="text-foreground">before</strong> the ex-date to qualify.
            </li>
            <li>
              <strong className="text-foreground">DRIP (Dividend Reinvestment Plan)</strong> &mdash;
              Instead of receiving cash, your dividends automatically buy more shares of the same stock.
              This compounds your returns over time. Most Canadian brokerages offer this for free.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Canadian Dividend Tax Credit</h2>
          <p>
            Canada gives you a tax break on dividends from Canadian companies. This is called the
            <strong className="text-foreground"> Dividend Tax Credit</strong>, and it makes Canadian
            dividends one of the most tax-efficient forms of income you can earn outside a registered account.
          </p>
          <p className="mt-3">
            There are two types:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">Eligible dividends</strong> &mdash; Paid by large
              public corporations (most TSX-listed companies). These get the bigger tax credit. In many
              provinces, if your only income is eligible dividends, you can earn over $50,000 and pay
              almost no tax.
            </li>
            <li>
              <strong className="text-foreground">Non-eligible dividends</strong> &mdash; Paid by
              smaller private companies (CCPCs). Still get a tax credit, just a smaller one.
            </li>
          </ul>
          <p className="mt-3">
            This tax credit only applies to <strong className="text-foreground">Canadian companies</strong> and
            only matters in a <strong className="text-foreground">non-registered (taxable) account</strong>.
            Inside a TFSA or RRSP, all growth is already tax-sheltered, so the credit is irrelevant.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Where to Hold Dividends</h2>
          <p>
            The account you hold your dividend stocks in makes a huge difference to your after-tax returns.
            Here&apos;s the cheat sheet:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Account</th>
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">Canadian Dividends</th>
                  <th className="text-left py-2 pr-4 text-foreground font-semibold">US Dividends</th>
                  <th className="text-left py-2 text-foreground font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/50">
                  <td className="py-1.5 pr-4 font-medium text-foreground">TFSA</td>
                  <td className="pr-4 text-accent font-medium">Tax-free</td>
                  <td className="pr-4">15% withheld (unrecoverable)</td>
                  <td>Canadian dividend stocks, growth</td>
                </tr>
                <tr className="border-b border-card-border/50">
                  <td className="py-1.5 pr-4 font-medium text-foreground">RRSP</td>
                  <td className="pr-4">Tax-deferred (taxed on withdrawal)</td>
                  <td className="pr-4 text-accent font-medium">0% withheld (treaty exempt)</td>
                  <td>US dividend stocks and ETFs</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-medium text-foreground">Non-Registered</td>
                  <td className="pr-4">Dividend Tax Credit applies</td>
                  <td className="pr-4">15% withheld (claimable as foreign tax credit)</td>
                  <td>Canadian dividends if TFSA/RRSP full</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-light mt-2">
            Rule of thumb: Canadian dividends in TFSA first, US dividends in RRSP first. Only use
            non-registered when your registered accounts are maxed out.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">US Dividends from Canada</h2>
          <p>
            Lots of great dividend stocks are listed in the US &mdash; Johnson &amp; Johnson, Coca-Cola,
            Procter &amp; Gamble. Canadians can buy them, but there are a few things to know:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">15% withholding tax.</strong> The US government
              automatically takes 15% of every dividend payment before it reaches your account. This
              is required by the Canada-US tax treaty.
            </li>
            <li>
              <strong className="text-foreground">RRSP exception.</strong> If you hold US stocks in
              your RRSP, the 15% withholding is waived completely. This is why US dividend payers
              belong in your RRSP, not your TFSA.
            </li>
            <li>
              <strong className="text-foreground">TFSA has no protection.</strong> The US doesn&apos;t
              recognize the TFSA, so the 15% withholding applies and you can&apos;t claim it back.
              That 4% yield is really 3.4% after the US takes its cut.
            </li>
            <li>
              <strong className="text-foreground">Currency matters.</strong> US dividends are paid in
              USD. Your brokerage may auto-convert to CAD (often at a bad rate). Look into Norbert&apos;s
              Gambit to convert currency cheaply, or hold USD directly if your brokerage supports it.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">DRIP &mdash; Automatic Reinvestment</h2>
          <p>
            DRIP stands for Dividend Reinvestment Plan. Instead of collecting your dividend as cash,
            the money automatically buys more shares of the same stock. Over time, this creates a
            <strong className="text-foreground"> compounding snowball</strong> &mdash; more shares means
            more dividends, which buys more shares, which means more dividends.
          </p>
          <p className="mt-3">
            Why it matters: a $10,000 investment earning a 4% yield with DRIP enabled will grow
            significantly faster than one where you pocket the cash. After 20 years of reinvesting,
            the difference is massive thanks to compounding.
          </p>
          <p className="mt-3">
            How to set it up:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">Brokerage DRIP (synthetic).</strong> Most Canadian
              brokerages (Wealthsimple, Questrade, TD, RBC) let you turn on DRIP with a single toggle
              in your account settings. This is the easiest way.
            </li>
            <li>
              <strong className="text-foreground">Company DRIP.</strong> Some companies run their own
              plans (often with a small discount on shares). You enroll directly through the company&apos;s
              transfer agent. More effort, but sometimes cheaper.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-light">
            DRIP doesn&apos;t change your tax situation. In a taxable account, reinvested dividends are
            still taxable income in the year they&apos;re received, even though you never saw the cash.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Dividend Aristocrats</h2>
          <p>
            A <strong className="text-foreground">Dividend Aristocrat</strong> is a company that has
            increased its dividend every year for at least 25 consecutive years. In Canada, the bar
            is usually set at 5&ndash;10 years of consecutive increases (our market is smaller).
          </p>
          <p className="mt-3">
            Why this matters: a company that keeps raising its dividend year after year is telling you
            it has <strong className="text-foreground">stable, growing earnings</strong>. It&apos;s a
            signal of financial health and management confidence. These companies tend to be boring,
            reliable businesses &mdash; exactly what you want in a long-term portfolio.
          </p>
          <p className="mt-3">
            Some well-known Canadian examples:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">Enbridge (ENB)</strong> &mdash; Pipeline giant. Has
              raised its dividend for 25+ consecutive years. One of the highest yields on the TSX.
            </li>
            <li>
              <strong className="text-foreground">Fortis (FTS)</strong> &mdash; Utility company. 50+
              years of consecutive dividend increases. Regulated revenues make it extremely predictable.
            </li>
            <li>
              <strong className="text-foreground">Canadian National Railway (CNR)</strong> &mdash;
              Railroad monopoly (duopoly with CP). Consistent dividend growth backed by essential
              infrastructure that&apos;s nearly impossible to replicate.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-light">
            Past dividend history doesn&apos;t guarantee future payments. Always check current payout
            ratios and earnings trends.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Red Flags</h2>
          <p>
            Not all dividends are created equal. Watch out for these warning signs:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">Sky-high yield.</strong> A yield above 7&ndash;8%
              often means the stock price has crashed and the market expects a dividend cut. A 10%
              yield that gets cut to 0% is not a good deal. This is called a
              <strong className="text-foreground"> yield trap</strong>.
            </li>
            <li>
              <strong className="text-foreground">Payout ratio over 100%.</strong> If a company is
              paying out more in dividends than it earns, it&apos;s funding dividends with debt or
              reserves. That&apos;s not sustainable. A cut is likely coming.
            </li>
            <li>
              <strong className="text-foreground">Dividend cuts or freezes.</strong> If a company
              reduces or pauses its dividend, it usually means earnings are under serious pressure.
              The stock price often drops hard when this happens. Check the company&apos;s dividend
              history before buying.
            </li>
            <li>
              <strong className="text-foreground">Declining revenue.</strong> A company can maintain
              dividends for a while even as the business shrinks, but eventually the math catches up.
              If revenue has been falling for several years, the dividend may follow.
            </li>
            <li>
              <strong className="text-foreground">Heavy debt load.</strong> Companies with large debt
              obligations may prioritize debt repayment over dividends, especially when interest rates
              rise. Check the debt-to-equity ratio before assuming the dividend is safe.
            </li>
          </ol>
        </section>

        <section className="bg-card-bg border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Bottom Line</h2>
          <p>
            Dividend investing is a proven strategy for building long-term wealth, especially in Canada
            where the tax system rewards it. Start with quality companies that have a track record of
            raising dividends, hold them in the right accounts (TFSA for Canadian, RRSP for US), turn
            on DRIP, and let compounding do the heavy lifting. Avoid chasing the highest yields &mdash;
            a reliable 3&ndash;4% that grows every year beats a flashy 10% that gets cut.
          </p>
        </section>

        <p className="text-xs text-muted-light">
          Last verified: March 2026. Tax rules and contribution limits may change. Consult a qualified
          tax professional for advice specific to your situation.
        </p>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/learn/tfsa" className="text-accent hover:text-accent-dim font-medium text-sm">
            TFSA Guide →
          </Link>
          <Link href="/learn/rrsp" className="text-accent hover:text-accent-dim font-medium text-sm">
            RRSP Guide →
          </Link>
          <Link href="/stock" className="text-accent hover:text-accent-dim font-medium text-sm">
            Browse Stocks →
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
