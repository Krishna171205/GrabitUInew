import { headers } from 'next/headers';
import { CafeProvider } from './CafeProvider';
import type { GrabbitStaffRole } from '@/types/grabbit';

export default async function CafeLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const rawCafe  = headersList.get('x-cafe-id');
  const rawStaff = headersList.get('x-staff-id');
  const rawRole  = headersList.get('x-staff-role');
  const cafeId  = rawCafe  ? (parseInt(rawCafe,  10) || null) : null;
  const staffId = rawStaff ? (parseInt(rawStaff, 10) || null) : null;
  const role    = (rawRole as GrabbitStaffRole | null) ?? null;

  return (
    <CafeProvider cafeId={cafeId} staffId={staffId} role={role}>
      <div style={{ minHeight: '100vh', background: 'var(--g-surface)' }}>
        {children}
      </div>
    </CafeProvider>
  );
}
