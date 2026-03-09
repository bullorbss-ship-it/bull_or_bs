import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for BullOrBS. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Privacy Policy' },
      ]} />
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-8 text-muted leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Introduction</h2>
          <p>
            BullOrBS (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is
            committed to protecting your personal information. This Privacy Policy
            explains how we collect, use, and safeguard your data when you visit
            our website or subscribe to our newsletter.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Information We Collect</h2>
          <p>We collect minimal personal information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Email address</strong> &mdash; only if you voluntarily subscribe
              to our newsletter. We do not collect your name, address, or any
              other personal information.
            </li>
            <li>
              <strong>Analytics data</strong> &mdash; we use Google Analytics to
              collect anonymized usage data (pages visited, time on site, device
              type). This data does not personally identify you.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email addresses are used solely to send our newsletter with stock analysis updates.</li>
            <li>Analytics data is used to understand how visitors use our site and improve the experience.</li>
            <li>We do not sell, rent, trade, or share your personal information with third parties.</li>
            <li>We do not use your data for targeted advertising.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Consent</h2>
          <p>
            By subscribing to our newsletter, you provide express consent to
            receive emails from BullOrBS in accordance with Canada&apos;s
            Anti-Spam Legislation (CASL). You may withdraw your consent and
            unsubscribe at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Data Storage &amp; Security</h2>
          <p>
            Your email address is stored securely. We use industry-standard
            security measures to protect your data from unauthorized access,
            disclosure, or destruction. However, no method of electronic
            storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Your Rights</h2>
          <p>Under Canadian privacy law (PIPEDA), you have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Withdraw consent for email communications at any time</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{' '}
            <span className="text-accent">hello@bullorbs.com</span>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Cookies</h2>
          <p>
            We use cookies only for essential site functionality and analytics
            (Google Analytics). We do not use tracking cookies for advertising.
            You can disable cookies in your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Google Analytics</strong> &mdash; for anonymized site usage data. See Google&apos;s privacy policy for details.</li>
            <li><strong>Cloudflare</strong> &mdash; for DNS and security. See Cloudflare&apos;s privacy policy for details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date. Continued use of the site
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Contact</h2>
          <p>
            For privacy-related questions or requests, contact us at{' '}
            <span className="text-accent">hello@bullorbs.com</span>.
          </p>
        </section>

        <div className="flex gap-4 pt-4 border-t border-card-border">
          <Link href="/disclaimer" className="text-accent hover:text-accent-dim font-medium text-xs">
            Disclaimer →
          </Link>
          <Link href="/terms" className="text-accent hover:text-accent-dim font-medium text-xs">
            Terms of Service →
          </Link>
        </div>
        <p className="text-xs text-muted pt-4">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
}
