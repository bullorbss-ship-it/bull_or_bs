'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/daily', label: 'Daily' },
  { href: '/stock', label: 'Stocks' },
  { href: '/roasts', label: 'Roasts' },
  { href: '/picks', label: 'Picks' },
  { href: '/takes', label: 'News' },
  { href: '/learn', label: 'Learn' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-card-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image src="/icon.svg" alt="" width={28} height={28} />
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
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'text-foreground font-semibold bg-card-bg'
                  : 'text-muted hover:text-foreground hover:bg-card-bg'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#subscribe"
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
          aria-controls="mobile-menu"
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

      {/* Mobile menu drawer — grid-rows animation so height never depends on a magic max-h */}
      <div
        id="mobile-menu"
        className={`md:hidden grid transition-[grid-template-rows] duration-300 ease-out ${
          menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col border-t border-card-border px-6 py-4 gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`px-4 py-3 hover:text-accent hover:bg-card-bg rounded-lg transition-colors text-base font-medium ${
                  isActive(link.href) ? 'text-accent bg-card-bg' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#subscribe"
              onClick={() => setMenuOpen(false)}
              className="mt-2 bg-accent text-white px-4 py-3 rounded-lg hover:bg-accent-dim transition-colors text-center font-medium"
            >
              Subscribe Free
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
