import type { Metadata } from 'next';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import { SITE_URL } from '@/lib/seo';
import PartnerPitch from '@/components/landing/PartnerPitch';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Partner with Grabbit | LetsGrabbit — Cafe Pre-order Platform',
  description:
    'Bring your cafe online with Grabbit. Get your own order-ahead POS, keep your margin, ' +
    'and never miss an order. Partner with LetsGrabbit — order ahead made for cafes.',
  keywords: [
    'partner with grabbit',
    'lets grabbit for cafes',
    'cafe ordering platform',
    'order ahead for cafes',
    'grabbit partner',
    'cafe pos system',
    'india cafe platform',
  ],
  openGraph: {
    title: 'Partner with Grabbit | LetsGrabbit — Cafe Pre-order Platform',
    description: 'Bring your cafe online with Grabbit. Order-ahead POS, keep your margin, never miss an order.',
    url: `${SITE_URL}/partner`,
    siteName: 'Grabbit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner with Grabbit | LetsGrabbit — Cafe Pre-order Platform',
    description: 'Bring your cafe online with Grabbit. Order-ahead POS, keep your margin, never miss an order.',
  },
  alternates: { canonical: `${SITE_URL}/partner` },
  robots: { index: true, follow: true },
};

export default function PartnerLandingPage() {
  return (
    <div className="gb-app">
      <LandingNav />
      {/* CAFÉ OPERATIONS SECTION */}
      <PartnerPitch />

      {/* ONBOARDING GET STARTED CARD */}
      <div style={{ maxWidth: 560, margin: '0 auto', background: 'var(--gb-surface)' }}>
        <div style={{ padding: '60px 26px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          <h2
            className="text-[36px] sm:text-[48px] font-normal uppercase tracking-wide leading-[1.05] text-[#111317] mb-3"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            PARTNER WITH <span className="text-[#0055D4]">GRABBIT</span>
          </h2>

          <p className="text-[#111317]/60 font-medium text-[15px] sm:text-[17px] mb-8 max-w-[320px]">
            Bring your café online for order-ahead pickup.
          </p>

          <Link
            href="/partner/signup"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--gb-primary)', color: '#fff', height: 56, borderRadius: 14, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)' }}
          >
            Get started<MS name="arrow_forward" size={20} />
          </Link>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
