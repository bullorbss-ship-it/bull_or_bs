import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubscribeForm from '@/components/forms/SubscribeForm';

export const metadata: Metadata = {
  title: 'Learn — Canadian Investing Guides',
  description:
    'Free guides on TFSA, RRSP, FHSA, and smart investing strategies for Canadians. Learn how to maximize your registered accounts and build wealth.',
};

const guides = [
  {
    slug: 'tfsa',
    title: 'TFSA Guide',
    subtitle: 'Tax-Free Savings Account',
    description: 'How to use your TFSA for tax-free growth — contribution limits, withdrawal rules, and investment strategies.',
    icon: '🏦',
  },
  {
    slug: 'rrsp',
    title: 'RRSP Guide',
    subtitle: 'Registered Retirement Savings Plan',
    description: 'Maximize your RRSP for retirement — tax deductions, contribution room, HBP, and when RRSP beats TFSA.',
    icon: '📈',
  },
  {
    slug: 'fhsa',
    title: 'FHSA Guide',
    subtitle: 'First Home Savings Account',
    description: 'Canada\'s newest registered account for first-time home buyers — contribution limits, tax benefits, and strategies.',
    icon: '🏠',
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Learn' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Learn to <span className="text-accent">Invest Smarter</span>
      </h1>
      <p className="text-muted text-lg mb-10 leading-relaxed">
        Free, no-BS guides on Canadian registered accounts and investing fundamentals.
        Built for beginners and intermediate investors who want to understand the system — not just follow advice blindly.
      </p>

      <div className="space-y-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/learn/${guide.slug}`}
            className="block border border-card-border rounded-xl p-6 hover:border-accent/50 transition-colors bg-card-bg"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{guide.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-foreground">{guide.title}</h2>
                <p className="text-sm text-accent font-medium">{guide.subtitle}</p>
                <p className="text-muted text-sm mt-2 leading-relaxed">{guide.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 border border-card-border rounded-xl bg-card-bg">
        <h3 className="text-lg font-bold mb-2">Why these guides?</h3>
        <p className="text-muted text-sm leading-relaxed">
          Most Canadians leave money on the table because they don&apos;t understand how registered
          accounts work. A TFSA isn&apos;t just a savings account. An RRSP isn&apos;t always the right choice.
          And the FHSA is one of the best deals the government has ever offered first-time buyers.
          These guides break it all down — plain language, no jargon, no sales pitch.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-card-border">
        <h3 className="text-lg font-bold mb-4">Get the newsletter</h3>
        <SubscribeForm />
      </div>
    </div>
  );
}
