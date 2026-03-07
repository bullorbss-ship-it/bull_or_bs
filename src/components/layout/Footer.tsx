import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="border-t border-card-border mt-20 bg-card-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <p className="font-bold text-lg text-foreground">
              NotSoFool<span className="text-accent">AI</span>
            </p>
            <p className="text-muted text-sm mt-2 leading-relaxed max-w-sm">
              AI-driven stock analysis for Canadian and US markets.
              Every recommendation shows its full reasoning.
              Made in Canada, for everyone.
            </p>
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold mb-3">Navigate</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/stock" className="text-muted hover:text-accent transition-colors">Stock Analysis</Link>
              <Link href="/#roasts" className="text-muted hover:text-accent transition-colors">The Roast</Link>
              <Link href="/#picks" className="text-muted hover:text-accent transition-colors">AI Picks</Link>
              <Link href="/about" className="text-muted hover:text-accent transition-colors">About</Link>
              <Link href="/disclaimer" className="text-muted hover:text-accent transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold mb-3">Connect</p>
            <div className="flex flex-col gap-2 text-sm">
              <a href={siteConfig.social.x} className="text-muted hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">X / Twitter</a>
              <a href={siteConfig.social.instagram} className="text-muted hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="/feed.xml" className="text-muted hover:text-accent transition-colors">RSS Feed</a>
            </div>
          </div>
        </div>

        <div className="border-t border-card-border mt-10 pt-6">
          <p className="text-muted text-xs leading-relaxed mb-4">
            {siteConfig.name} is not affiliated with, endorsed by, or connected to
            The Motley Fool, Seeking Alpha, Zacks, or any financial institution.
            All analysis is AI-generated for educational and entertainment purposes only.
            This is not financial advice. Always do your own research.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-muted-light text-xs">
              &copy; {new Date().getFullYear()} {siteConfig.name}
            </p>
            <p className="text-muted-light text-xs">
              AI-generated content &middot; Not financial advice &middot; Built in Canada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
