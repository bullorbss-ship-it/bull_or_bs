import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TickerTape from '@/components/ui/TickerTape';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AdPixels from '@/components/AdPixels';
import NewsletterPopup from '@/components/forms/NewsletterPopup';
import { defaultMetadata, organizationSchema, websiteSchema, safeJsonLd } from '@/config/seo';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://s3.tradingview.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema()) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to content
        </a>
        <GoogleAnalytics />
        <AdPixels />
        <TickerTape />
        <Header />
        <main id="main" className="min-h-screen">{children}</main>
        <Footer />
        <NewsletterPopup />
      </body>
    </html>
  );
}
