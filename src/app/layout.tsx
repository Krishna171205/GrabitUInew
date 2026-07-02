import type { Metadata } from 'next';
import { Inter, Newsreader, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Grabit consumer app — warm editorial pairing (serif headings + grotesk body).
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-hanken',
});

export const metadata: Metadata = {
  title: 'Grabit — Order Ahead',
  description: 'Pre-order from your favourite cafe',
  icons: { icon: '/grabit-logo.svg' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${newsreader.variable} ${hanken.variable}`}>
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
