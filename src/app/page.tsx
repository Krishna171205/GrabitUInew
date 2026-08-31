// grabit/src/app/page.tsx
import type { Metadata } from 'next';
import LandingClient from './LandingClient';
import { SeoScripts } from '@/components/SEOScripts';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Grabbit | LetsGrabbit — Order Coffee Ahead, Skip the Queue | Delhi',
  description:
    'LetsGrabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
    'Pre-order, skip the queue, pick up in minutes. Pay online with UPI, card, or netbanking. ' +
    'WhatsApp updates. Now live in Delhi. Try Grabbit / Lets Grabbit today.',
  keywords: [
    'lets grabbit',
    'grabbit',
    'order coffee ahead delhi',
    'cafe ordering delhi',
    'pre order coffee delhi',
    'skip the queue delhi',
    'whatsapp order updates',
  ],
  openGraph: {
    title: 'Grabbit | LetsGrabbit — Order Coffee Ahead, Skip the Queue',
    description:
      'LetsGrabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
      'Pre-order, skip the queue, pick up in minutes.',
    url: SITE_URL,
    siteName: 'Grabbit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    creator: '@grabbit',
    title: 'Grabbit | LetsGrabbit — Order Coffee Ahead, Skip the Queue',
    description:
      'LetsGrabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
      'Pre-order, skip the queue, pick up in minutes.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
};

export default function RootPage() {
  return (
    <>
      <LandingClient />
      {/* JSON-LD: FAQPage + HowTo for rich snippets in Google search */}
      <SeoScripts names={['faq', 'howTo']} />
    </>
  );
}
