import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `How ${siteConfig.name} Works — Our AI Analysis Methodology`,
  description:
    'Learn how BullOrBS uses AI to analyze stocks, grade recommendations, and run elimination tournaments. Transparent methodology, every step shown.',
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Methodology' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        How <span className="text-accent">{siteConfig.name}</span> Works
      </h1>

      <div className="space-y-6 text-muted leading-relaxed">
        {/* How Our AI Works */}
        <h2 className="text-xl font-bold text-foreground pt-4">How Our AI Works</h2>

        <p>
          {siteConfig.name} is powered by Claude, Anthropic&apos;s AI model. For every
          analysis, Claude performs real-time web searches to pull the latest market
          data, news, and analyst opinions. It then reasons through the data step by
          step — and we publish that entire reasoning chain so you can follow along.
        </p>

        <p>
          This isn&apos;t a black box. Every conclusion is backed by cited data points,
          and you can see exactly how the AI arrived at its verdict.
        </p>

        {/* Data Sources */}
        <h2 className="text-xl font-bold text-foreground pt-4">Data Sources</h2>

        <p>Our AI pulls from a wide range of publicly available sources:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">Market data</strong> — real-time and historical price action, volume, and technicals</li>
          <li><strong className="text-foreground">Analyst reports</strong> — consensus ratings, price targets, and estimate revisions</li>
          <li><strong className="text-foreground">News &amp; sentiment</strong> — recent headlines, earnings calls, and market commentary</li>
          <li><strong className="text-foreground">Regulatory filings</strong> — SEC (US) and SEDAR+ (Canada) filings, insider transactions</li>
          <li><strong className="text-foreground">Company financials</strong> — revenue, earnings, margins, debt levels, cash flow</li>
        </ul>

        {/* The Grading System */}
        <h2 className="text-xl font-bold text-foreground pt-4">The Grading System</h2>

        <p>
          Every stock recommendation we audit gets a letter grade from A to F.
          Here&apos;s what each grade means:
        </p>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4">
            <span className="grade-badge grade-badge-sm grade-A shrink-0">A</span>
            <p>
              <strong className="text-foreground">Strong buy signal.</strong> Data
              overwhelmingly supports the recommendation. Fundamentals, technicals,
              and sentiment all align.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="grade-badge grade-badge-sm grade-B shrink-0">B</span>
            <p>
              <strong className="text-foreground">Positive outlook.</strong> Good
              fundamentals with minor concerns. The recommendation is solid but not
              without caveats.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="grade-badge grade-badge-sm grade-C shrink-0">C</span>
            <p>
              <strong className="text-foreground">Mixed signals.</strong> Proceed
              with caution. Some data supports the pick, but there are enough red
              flags to give pause.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="grade-badge grade-badge-sm grade-D shrink-0">D</span>
            <p>
              <strong className="text-foreground">Significant concerns.</strong> More
              risk than reward. The data doesn&apos;t strongly support the recommendation
              and key metrics are trending the wrong way.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="grade-badge grade-badge-sm grade-F shrink-0">F</span>
            <p>
              <strong className="text-foreground">Failed analysis.</strong> The data
              doesn&apos;t support the recommendation. Key claims are misleading, outdated,
              or contradicted by available evidence.
            </p>
          </div>
        </div>

        {/* The Elimination Tournament */}
        <h2 className="text-xl font-bold text-foreground pt-4">The Elimination Tournament</h2>

        <p>
          For our weekly stock picks, we don&apos;t just name a winner — we show the
          full bracket. Here&apos;s how it works:
        </p>

        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong className="text-foreground">Candidate selection</strong> — 10 to 15
            stocks are identified based on market momentum, sector rotation, earnings
            catalysts, and reader interest.
          </li>
          <li>
            <strong className="text-foreground">Head-to-head analysis</strong> — each
            stock is evaluated on fundamentals, valuation, growth potential, risk
            factors, and timing.
          </li>
          <li>
            <strong className="text-foreground">Elimination rounds</strong> — weaker
            candidates are cut with full explanations of why they didn&apos;t make it.
          </li>
          <li>
            <strong className="text-foreground">Final verdict</strong> — one stock
            emerges as the top pick, with a complete breakdown of every decision
            along the way.
          </li>
        </ol>

        <p>
          Every eliminated stock is shown. Every reason is published. You see the
          full process, not just the conclusion.
        </p>

        {/* Transparency Commitment */}
        <h2 className="text-xl font-bold text-foreground pt-4">Transparency Commitment</h2>

        <p>
          Every data point in our analysis is sourced. Every piece of reasoning is
          published. We don&apos;t hide behind vague statements like &quot;our
          proprietary model suggests...&quot; — if we can&apos;t show you the data
          and the logic, we don&apos;t publish the claim.
        </p>

        <p>
          This is what separates {siteConfig.name} from traditional financial newsletters.
          We believe transparency is more valuable than mystique.
        </p>

        {/* Limitations */}
        <h2 className="text-xl font-bold text-foreground pt-4">Limitations</h2>

        <p>
          We believe in being upfront about what AI analysis can and cannot do:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-foreground">AI can be wrong.</strong> Models
            can misinterpret data, miss context, or draw incorrect conclusions.
            That&apos;s why we show our work — so you can spot errors.
          </li>
          <li>
            <strong className="text-foreground">Past data doesn&apos;t predict the future.</strong> No
            analysis — human or AI — can guarantee stock performance.
          </li>
          <li>
            <strong className="text-foreground">This is not financial advice.</strong> {siteConfig.name} is
            an educational and informational tool. Always do your own research and
            consult a licensed financial advisor before making investment decisions.
          </li>
          <li>
            <strong className="text-foreground">We are not affiliated</strong> with
            any financial institution, brokerage, or publication we analyze.
          </li>
        </ul>

        <p>
          Use our analysis as a starting point — never as your only source.
        </p>
      </div>
    </div>
  );
}
