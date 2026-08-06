// grabit/src/app/page.tsx
import type { Metadata } from 'next';
import LandingClient from './LandingClient';
import { SeoScripts } from '@/components/SEOScripts';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Grabbit | LetsGrabbit — Order Coffee Ahead, Skip the Queue | Delhi',
  description:
    'LetsGrabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
    'Pre-order, skip the queue, pick up in minutes. Pay online or at the counter. ' +
    'WhatsApp updates. Now live in Delhi. Try Grabbit / Lets Grabit today.',
  keywords: [
    'lets grabbit',
    'lets grabit',
    'grabbit',
    'grabit',
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
    images: [
      {
        url: `https://letsgrabbit.com/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'Grabbit — Order coffee ahead, skip the queue | LetsGrabbit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    creator: '@grabbit',
    title: 'Grabbit | LetsGrabbit — Order Coffee Ahead, Skip the Queue',
    description:
      'LetsGrabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
      'Pre-order, skip the queue, pick up in minutes.',
    images: ['https://letsgrabbit.com/og-image.svg'],
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
