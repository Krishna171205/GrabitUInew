import type { Metadata } from 'next';
import { Baloo_2, Mukta } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// Grabit brand type — Marigold system.
// Display / wordmark: Baloo 2 (rounded, playful, native Devanagari).
const baloo = Baloo_2({
  subsets: ['latin', 'devanagari'],
  weight: ['500', '700', '800'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});

// UI / body: Satoshi (Fontshare, self-hosted). Latin only — Devanagari falls to Mukta.
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
  title: 'Grabit — Order Ahead',
  description: 'Pre-order from your favourite cafe',
  icons: { icon: '/grabit-logo.svg' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${baloo.variable} ${satoshi.variable} ${mukta.variable}`}>
      <head>
        {/* Material Symbols Rounded — icon font used across the consumer app */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400,0..1,0"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
