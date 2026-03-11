import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin',
};

export default function OrangeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
