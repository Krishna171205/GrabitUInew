import type { Metadata, Viewport } from 'next';
import { Baloo_2, Mukta, Anton, Caveat } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { SeoScripts } from '@/components/SEOScripts';
import { Analytics } from '@/components/Analytics';
import { UpdateOnResume } from '@/components/gb/UpdateOnResume';
import AnimatedFavicon from '@/components/cup3d/AnimatedFavicon';
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

// Vibrant Display Font
const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-anton',
});

// Handwriting Script Font
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: Order ahead, skip the queue`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'lets grabbit',
    'grabbit',
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
  // Single-locale site: an hreflang set with one entry pointing at itself tells
  // Google nothing it can't already see, so there isn't one.
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME}: Order ahead, skip the queue`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    creator: '@grabbit',
    title: `${SITE_NAME}: Order ahead, skip the queue`,
    description: DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/favicon-icon.png', sizes: '315x315', type: 'image/png' }],
    apple: [{ url: '/favicon-icon.png', sizes: '315x315' }],
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {}),
  },
  category: 'Food & Dining',
};

// No viewport meta at all left tap-zoom up to the browser default - most mobile browsers
// auto-zoom to fit a tapped element, which read as "the page zoomed in" on every filter tap.
// App-shell UI (bottom sheets, floating cart bar, sticky chip rows) assumes no page zoom.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8FAFC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${baloo.variable} ${satoshi.variable} ${mukta.variable} ${anton.variable} ${caveat.variable}`}>
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
        <SeoScripts names={['organization', 'website']} />
      </head>
      <body>
        {children}
        <Analytics />
        <UpdateOnResume />
        <AnimatedFavicon />
      </body>
    </html>
  );
}
