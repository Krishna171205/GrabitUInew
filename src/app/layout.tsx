import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grabit — Order Ahead',
  description: 'Pre-order from your favourite cafe',
  icons: { icon: '/grabit-logo.svg' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
