import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About Bull Or BS',
  description:
    'Bull Or BS audits popular stock picks with source-linked comparisons, documented uncertainty, independent AI verification, and human approval.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'About' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        About <span className="text-accent">BullOrBS</span>
      </h1>

      <div className="space-y-6 text-muted leading-relaxed">
        <p className="text-lg text-foreground">
          BullOrBS is an AI-powered stock analysis newsletter built on one principle:{' '}
          <strong className="text-accent">show your work.</strong>
        </p>

        <p>
          Most financial newsletters give you a stock pick and say &quot;trust us.&quot;
          They hide behind paywalls, vague reasoning, and impressive-sounding credentials.
          You pay $299/year for a ticker symbol and a paragraph of hype.
        </p>

        <p>
          We think that&apos;s backwards.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">What We Do</h2>

        <p>
          We publish comparisons, recommendation audits, and Canadian investing
          guides. A monthly plan is approved before research begins. Each draft is
          built from a saved source packet, checked by a separate verification model,
          and held for human approval before publication.
        </p>

        <p>
          We also audit popular stock recommendations from major financial publications.
          When someone says &quot;buy this stock,&quot; we check if the data actually
          supports it. We grade their picks. We show what they missed. We suggest
          what they should have recommended instead.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Why AI?</h2>

        <p>
          AI helps us compare documents and organize evidence consistently. It can
          still misunderstand a source or produce an unsupported claim, which is why
          the research, writing, and verification stages use separate configurations
          and why publication always requires human approval.
        </p>

        <p>
          Is AI perfect? No. That&apos;s why we show every step. You can see where
          the AI might be wrong. You can disagree with a specific elimination.
          You can use our analysis as a starting point for your own research.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">What We&apos;re Not</h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>We are <strong className="text-foreground">not</strong> financial advisors</li>
          <li>We are <strong className="text-foreground">not</strong> affiliated with any financial publication, newsletter, or institution</li>
          <li>We do <strong className="text-foreground">not</strong> guarantee returns or accuracy</li>
          <li>We are <strong className="text-foreground">not</strong> a replacement for doing your own research</li>
        </ul>

        <p>
          We&apos;re an AI-powered analysis tool that gives you a data-driven starting
          point — and shows you exactly how it got there.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Built in Canada</h2>

        <p>
          BullOrBS is built in Canada, for investors who want better analysis
          of both US and Canadian markets. No gatekeeping. No paywalls. Just analysis.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Who Built It</h2>

        <p>
          The technology and editorial workflow are built and operated by{' '}
          <a href={siteConfig.creator.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {siteConfig.creator.name}
          </a>
          , an AI and technology studio led by {siteConfig.creator.founder} in Whitby,
          Ontario. That background supports the engineering and AI-system work; it
          does not represent a financial-advisor or investment-management credential.
        </p>

        <div className="flex gap-4 pt-4">
          <Link href="/stock" className="text-accent hover:text-accent-dim font-medium text-sm">
            Browse Stock Analyses →
          </Link>
          <Link href="/methodology" className="text-accent hover:text-accent-dim font-medium text-sm">
            How Our AI Works →
          </Link>
          <Link href="/disclaimer" className="text-accent hover:text-accent-dim font-medium text-sm">
            Disclaimer →
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
