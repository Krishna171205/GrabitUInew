import { cookies } from 'next/headers';
import { BottomNav, DesktopTopNav } from '@/components/gb/kit';

/**
 * Tab screens (Home / Explore / Orders / Profile) share navigation, guests browse without any.
 * Signed-in: BottomNav on mobile, DesktopTopNav on desktop (CSS-toggled, see .gb-bottomnav/.gb-topnav).
 */
export default async function TabsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('grabit_customer_token')?.value;
  return (
    <>
      {token && <DesktopTopNav />}
      {children}
      {token && <BottomNav />}
    </>
  );
}
