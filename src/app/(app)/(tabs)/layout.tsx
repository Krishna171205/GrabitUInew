import { BottomNav } from '@/components/gb/kit';

/** Tab screens (Home / Explore / Orders / Profile) share the bottom nav. */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
