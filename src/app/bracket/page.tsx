import type { Metadata } from 'next';
import BracketBuilder from '@/components/bracket/BracketBuilder';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Build Your Stock Bracket',
  description: 'Enter up to 16 stock tickers and let AI rank them in a tournament bracket. Free stock comparison tool by Bull Or BS.',
  robots: { index: false, follow: false }, // noindex until feature flag removed
};

export default function BracketPage() {
  if (process.env.ENABLE_BRACKET !== 'true') {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Stock Bracket' },
      ]} />

      <div className="text-center mb-8 sm:mb-12">
        <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-muted-light mb-3">
          AI STOCK COMPARISON TOOL
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Build Your <span className="text-accent">Stock Bracket</span>
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-lg mx-auto">
          Enter 2-16 tickers and AI will run an elimination tournament, ranking your stocks head-to-head with full reasoning.
        </p>
      </div>

      <BracketBuilder />

      <p className="text-center text-[10px] text-muted-light mt-8">
        AI-generated analysis for educational purposes only. Not financial advice.
        {' '}Results powered by {siteConfig.displayName}.
      </p>
    </div>
  );
}
