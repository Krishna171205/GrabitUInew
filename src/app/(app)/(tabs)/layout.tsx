import { cookies } from 'next/headers';
import { BottomNav } from '@/components/gb/kit';

/**
 * Tab screens (Home / Explore / Orders / Profile) share the phone's bottom bar,
 * guests browse without it. The desktop top nav is applied one level up, in the
 * app layout, since every app screen needs it and not just these four.
 */
export default async function TabsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('grabbit_customer_token')?.value;
  return (
    <>
      {children}
      {token && <BottomNav />}
    </>
  );
}
