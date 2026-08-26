/**
 * Grabbit consumer app shell. Applies the warm editorial theme (.gb-app).
 * Width is owned per-page via .gb-shell (narrow, always) or .gb-shell-wide
 * (expands on desktop), see globals.css.
 */
import { cookies } from 'next/headers';
import { ReviewGate } from '@/components/gb/ReviewSheet';
import { LocationGate } from '@/components/gb/LocationGate';
import { DesktopTopNav } from '@/components/gb/kit';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const signedIn = !!(await cookies()).get('grabbit_customer_token')?.value;
  return (
    <div className="gb-app">
      <div style={{ minHeight: '100dvh', position: 'relative' }}>
        {/* Desktop-only (CSS-toggled at 860px). Lives here rather than in the tabs
            layout so Favourites, Offers, Notifications, Settings and Support are
            reachable on a laptop too - they had no navigation at all before. */}
        <DesktopTopNav signedIn={signedIn} />
        {children}
        <ReviewGate />
        {/* Swiggy/Zomato-style: a location must be chosen before browsing the app. */}
        <LocationGate />
      </div>
    </div>
  );
}
