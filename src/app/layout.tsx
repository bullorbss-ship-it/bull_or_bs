import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://notsofoolai.com'),
  title: {
    default: 'NotSoFoolAI — AI-Driven Stock Analysis That Shows Its Work',
    template: '%s | NotSoFoolAI',
  },
  description:
    'AI-powered stock analysis newsletter. We audit popular stock picks, show our full reasoning, and never hide behind a paywall. Not affiliated with The Motley Fool.',
  keywords: [
    'AI stock analysis',
    'stock newsletter',
    'Motley Fool review',
    'stock picks',
    'AI investing',
    'Canadian stocks',
    'TSX analysis',
    'stock market analysis',
    'AI-driven investing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://notsofoolai.com',
    siteName: 'NotSoFoolAI',
    title: 'NotSoFoolAI — AI-Driven Stock Analysis That Shows Its Work',
    description:
      'AI audits popular stock picks. Full reasoning shown. No paywalls. No bull.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@notsofoolai',
    creator: '@notsofoolai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NotSoFoolAI',
              url: 'https://notsofoolai.com',
              description: 'AI-driven stock analysis newsletter',
              sameAs: [
                'https://x.com/notsofoolai',
                'https://instagram.com/notsofoolai',
              ],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
