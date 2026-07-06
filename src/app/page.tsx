// grabit/src/app/page.tsx
import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'Grabit: Order ahead, skip the queue',
  description: 'Pre-order from cafés near you. Ready when you arrive, no queue. Now in Delhi.',
  openGraph: {
    title: 'Grabit: Order ahead, skip the queue',
    description: 'Pre-order from cafés near you. Ready when you arrive, no queue.',
    url: 'https://grabit365.com',
    siteName: 'Grabit',
  },
};

export default function RootPage() {
  return <LandingClient />;
}
