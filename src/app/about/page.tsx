import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import HowItWorks from '@/components/landing/HowItWorks';
import { ReadyToJoinRitual } from '@/components/ReadyToJoinRitual';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How Grabbit Works | LetsGrabbit — Cafe Pre-order Platform',
  description: 'Browse nearby cafes, customize your order, and walk in and grab it. No lines, no waiting.',
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <LandingNav />
      <main style={{ paddingTop: 68 }}>
        <HowItWorks />
      </main>
      <ReadyToJoinRitual />
    </div>
  );
}
