import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for Bull Or BS. By using this site, you agree to these terms.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Terms of Service' },
      ]} />
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-8 text-muted leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Acceptance of Terms</h2>
          <p>
            By accessing and using BullOrBS (&quot;the Site&quot;), you accept and
            agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Nature of Content</h2>
          <p>
            All content on this Site is AI-generated and provided for educational
            and entertainment purposes only. The Site provides commentary,
            analysis, and opinions about publicly available stock recommendations
            and market data.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Nothing on this Site constitutes financial, investment, legal, tax, or professional advice.</li>
            <li>AI-generated content may contain errors, inaccuracies, or outdated information.</li>
            <li>You are solely responsible for any decisions you make based on information found on this Site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Use of the Site</h2>
          <p>You agree to use the Site only for lawful purposes. You may not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Site in any way that violates applicable laws or regulations</li>
            <li>Attempt to interfere with the proper functioning of the Site</li>
            <li>Scrape, copy, or redistribute content from the Site without permission</li>
            <li>Use automated tools to access the Site in a manner that exceeds reasonable use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Intellectual Property</h2>
          <p>
            All content, design, and code on this Site are the property of
            BullOrBS. Our commentary on third-party stock recommendations is
            protected under fair dealing (Canada) and fair use (United States)
            as criticism, commentary, and education.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Newsletter &amp; Communications</h2>
          <p>
            If you subscribe to our newsletter, you consent to receiving emails
            from BullOrBS in compliance with Canada&apos;s Anti-Spam Legislation
            (CASL). Every email will include an unsubscribe option. You may
            withdraw consent at any time by unsubscribing or contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, BullOrBS and its operators
            shall not be liable for any direct, indirect, incidental, special,
            or consequential damages arising from your use of the Site or
            reliance on any content provided.
          </p>
          <p className="mt-3">
            This includes, without limitation, any losses from investment
            decisions made based on content found on this Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">No Warranties</h2>
          <p>
            The Site and its content are provided &quot;as is&quot; without warranties
            of any kind, either express or implied, including but not limited to
            warranties of merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of Canada. Any disputes arising from these Terms or your
            use of the Site shall be subject to the jurisdiction of the courts
            of Canada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Changes will be posted
            on this page with an updated date. Continued use of the Site after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Contact</h2>
          <p>
            For questions about these Terms, contact us at{' '}
            <span className="text-accent">hello@bullorbs.com</span>.
          </p>
        </section>

        <div className="flex gap-4 pt-4 border-t border-card-border">
          <Link href="/disclaimer" className="text-accent hover:text-accent-dim font-medium text-xs">
            Disclaimer →
          </Link>
          <Link href="/privacy" className="text-accent hover:text-accent-dim font-medium text-xs">
            Privacy Policy →
          </Link>
        </div>
        <p className="text-xs text-muted pt-4">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
}
