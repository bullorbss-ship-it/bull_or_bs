'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/stock', label: 'Stocks' },
  { href: '/#roasts', label: 'Roasts' },
  { href: '/#picks', label: 'Picks' },
  { href: '/#news', label: 'News' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-card-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-card-bg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#subscribe"
            className="ml-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dim transition-colors text-sm font-medium"
          >
            Subscribe
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-card-bg transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
              menuOpen ? 'rotate-45 translate-y-[3px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-foreground mt-1 transition-all duration-200 ${
              menuOpen ? '-rotate-45 -translate-y-[2px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
          menuOpen ? 'max-h-80' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col border-t border-card-border px-6 py-4 gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-foreground hover:text-accent hover:bg-card-bg rounded-lg transition-colors text-base font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#subscribe"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-accent text-white px-4 py-3 rounded-lg hover:bg-accent-dim transition-colors text-center font-medium"
          >
            Subscribe Free
          </Link>
        </nav>
      </div>
    </header>
  );
}
