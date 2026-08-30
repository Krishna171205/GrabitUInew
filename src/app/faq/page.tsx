import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import FaqExplorer from '@/components/faq/FaqExplorer';
import { SeoScripts } from '@/components/SEOScripts';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FAQ | Grabbit — Order coffee ahead, skip the queue',
  description:
    'Answers about ordering ahead with Grabbit (LetsGrabbit): pickup times, UPI and card payments, WhatsApp order updates, refunds, and how cafés join.',
  alternates: { canonical: `${SITE_URL}/faq` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'FAQ | Grabbit — Order coffee ahead, skip the queue',
    description: 'Everything about ordering ahead, paying, and picking up with Grabbit.',
    url: `${SITE_URL}/faq`,
    type: 'website',
  },
};

export default function FAQPage() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <LandingNav />
      <main style={{ paddingTop: 68 }}>
        <FaqExplorer />
      </main>
      <LandingFooter />
      {/* FAQPage JSON-LD, generated from the same content the page renders. */}
      <SeoScripts names={['faq']} />
    </div>
  );
}
