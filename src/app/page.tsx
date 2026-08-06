// grabbit/src/app/page.tsx
import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'Grabbit: Order ahead, skip the queue',
  description: 'Pre-order from cafés near you. Ready when you arrive, no queue. Now in Delhi.',
  openGraph: {
    title: 'Grabbit: Order ahead, skip the queue',
    description: 'Pre-order from cafés near you. Ready when you arrive, no queue.',
    url: 'https://grabit365.com',
    siteName: 'Grabbit',
  },
};

export default function RootPage() {
  return <LandingClient />;
}
