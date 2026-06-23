'use client';
import { createContext, useContext } from 'react';
import type { GrabitStaffRole } from '@/types/grabit';

interface CafeContextValue {
  cafeId: number | null;
  staffId: number | null;
  role: GrabitStaffRole | null;
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
  role: GrabitStaffRole | null;
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

export function useCafeRole(): GrabitStaffRole | null {
  return useContext(CafeContext).role;
}
