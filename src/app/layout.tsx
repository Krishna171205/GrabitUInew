import type { Metadata } from 'next';
import { Baloo_2, Mukta } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { SeoScripts } from '@/components/SEOScripts';
import { SITE_URL, SITE_NAME, DESCRIPTION } from '@/lib/seo';

// Grabbit brand type, Marigold system.
// Display / wordmark: Baloo 2 (rounded, playful, native Devanagari).
const baloo = Baloo_2({
  subsets: ['latin', 'devanagari'],
  weight: ['500', '700', '800'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});

// UI / body: Satoshi (Fontshare, self-hosted). Latin only, Devanagari falls to Mukta.
const satoshi = localFont({
  variable: '--font-ui',
  display: 'swap',
  src: [
    { path: '../fonts/Satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/Satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
});

// Hindi body / dense Devanagari UI.
const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-deva',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: Order ahead, skip the queue — ${SITE_NAME}`,
    template: `%s | ${SITE_NAME} — Order Coffee Ahead`,
  },
  description: DESCRIPTION,
  keywords: [
    'lets grabbit',
    'lets grabit',
    'grabbit',
    'grabit',
    'order ahead',
    'cafe ordering',
    'coffee order ahead delhi',
    'pre order coffee',
    'skip the queue',
    'cafe pickup',
    'delhi cafe app',
    'online cafe ordering',
    'whatsapp order updates',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-IN': `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME}: Order ahead, skip the queue`,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'Grabbit — Order coffee ahead, skip the queue',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    creator: '@grabbit',
    title: `${SITE_NAME}: Order ahead, skip the queue`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.svg`],
  },
  icons: {
    icon: [
      { url: '/new-logo.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/new-logo.svg', rel: 'mask-icon', color: '#241612' },
    ],
    apple: [{ url: '/new-logo.svg', sizes: '180x180' }],
  },
  themeColor: '#FFFDF8',
  category: 'Food & Dining',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${baloo.variable} ${satoshi.variable} ${mukta.variable}`}>
      <head>
        {/* Material Symbols Rounded, icon font used across the consumer app */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400,0..1,0"
        />
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD structured data: Organization + Website */}
        <SeoScripts names={['organization', 'website', 'breadcrumb']} />
      </head>
      <body>{children}</body>
    </html>
  );
}
