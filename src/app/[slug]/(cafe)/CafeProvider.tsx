'use client';
import { createContext, useContext } from 'react';
import type { GrabbitStaffRole } from '@/types/grabbit';

interface CafeContextValue {
  cafeId: number | null;
  staffId: number | null;
  role: GrabbitStaffRole | null;
}

const CafeContext = createContext<CafeContextValue>({ cafeId: null, staffId: null, role: null });

export function CafeProvider({
  cafeId,
  staffId,
  role,
  children,
}: {
  cafeId: number | null;
  staffId: number | null;
  role: GrabbitStaffRole | null;
  children: React.ReactNode;
}) {
  return (
    <CafeContext.Provider value={{ cafeId, staffId, role }}>
      {children}
    </CafeContext.Provider>
  );
}

export function useCafeId(): number | null {
  return useContext(CafeContext).cafeId;
}

export function useStaffId(): number | null {
  return useContext(CafeContext).staffId;
}

export function useCafeRole(): GrabbitStaffRole | null {
  return useContext(CafeContext).role;
}
