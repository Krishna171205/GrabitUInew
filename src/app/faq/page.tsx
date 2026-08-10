import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import FAQSection from '@/components/landing/FAQSection';
import { ReadyToJoinRitual } from '@/components/ReadyToJoinRitual';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FAQ | LetsGrabbit — Cafe Pre-order Platform',
  description: 'Answers to common questions about ordering ahead with Grabbit (LetsGrabbit).',
  alternates: { canonical: `${SITE_URL}/faq` },
  robots: { index: true, follow: true },
};

export default function FAQPage() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <LandingNav />
      <main style={{ paddingTop: 68 }}>
        <FAQSection />
      </main>
      <ReadyToJoinRitual />
    </div>
  );
}
