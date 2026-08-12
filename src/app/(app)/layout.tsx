/**
 * Grabbit consumer app shell. Applies the warm editorial theme (.gb-app).
 * Width is owned per-page via .gb-shell (narrow, always) or .gb-shell-wide
 * (expands on desktop), see globals.css.
 */
import { ReviewGate } from '@/components/gb/ReviewSheet';
import { LocationGate } from '@/components/gb/LocationGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gb-app">
      <div style={{ minHeight: '100dvh', position: 'relative' }}>
        {children}
        <ReviewGate />
        {/* Swiggy/Zomato-style: a location must be chosen before browsing the app. */}
        <LocationGate />
      </div>
    </div>
  );
}
