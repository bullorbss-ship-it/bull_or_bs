import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-card-border bg-card-bg">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-accent font-mono font-bold text-xl tracking-tight">
            NotSoFool<span className="text-foreground">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-mono">
          <Link href="/#roasts" className="text-muted hover:text-accent transition-colors">
            The Roast
          </Link>
          <Link href="/#picks" className="text-muted hover:text-accent transition-colors">
            AI Picks
          </Link>
          <Link href="/about" className="text-muted hover:text-accent transition-colors">
            About
          </Link>
          <Link
            href="#subscribe"
            className="border border-accent text-accent px-4 py-1.5 rounded hover:bg-accent hover:text-background transition-colors"
          >
            Subscribe
          </Link>
        </nav>
      </div>
    </header>
  );
}
