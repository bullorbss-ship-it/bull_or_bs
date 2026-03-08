import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-card-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="BullOrBS" width={28} height={28} />
          <span className="font-bold text-xl tracking-tight font-mono">
            <span className="text-foreground">Bull</span>
            <span className="text-muted-light">Or</span>
            <span className="text-accent">BS</span>
          </span>
          <span className="hidden sm:inline text-[10px] text-muted-light border border-card-border rounded-full px-2 py-0.5 font-mono tracking-wide">
            CANADA
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link href="/stock" className="px-3 py-2 text-muted hover:text-foreground rounded-lg hover:bg-card-bg transition-colors">
            Stocks
          </Link>
          <Link href="/#roasts" className="px-3 py-2 text-muted hover:text-foreground rounded-lg hover:bg-card-bg transition-colors">
            Roasts
          </Link>
          <Link href="/#picks" className="px-3 py-2 text-muted hover:text-foreground rounded-lg hover:bg-card-bg transition-colors">
            Picks
          </Link>
          <Link href="/about" className="px-3 py-2 text-muted hover:text-foreground rounded-lg hover:bg-card-bg transition-colors">
            About
          </Link>
          <Link
            href="#subscribe"
            className="ml-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dim transition-colors font-medium"
          >
            Subscribe
          </Link>
        </nav>
      </div>
    </header>
  );
}
