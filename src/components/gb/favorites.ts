'use client';
/**
 * Saved cafés. Server-backed (grabit_favorite_cafes) so they show up on the
 * Favourites screen and survive a device change. Logged-out browsing still
 * bookmarks locally, and that local set is lifted to the account on first load
 * after login.
 */
import { useEffect } from 'react';
import { create } from 'zustand';

const KEY = 'grabbit_favorite_cafes';

/** Only the fields needed here. The full café shape lives in ./cards (which imports this file). */
type CafeRef = { id: number; slug: string };

function readLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(slugs: string[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(slugs)); } catch {}
}

async function toggleOnServer(cafeId: number) {
  return fetch('/api/proxy/grabit/favorites/cafes/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // snake_case: the API runs Jackson with SNAKE_CASE naming.
    body: JSON.stringify({ cafe_id: cafeId }),
  });
}

interface SavedCafesState {
  slugs: string[];
  loaded: boolean;
  /** False for anonymous browsing: bookmarks then live in localStorage only. */
  authed: boolean;
  load: () => Promise<void>;
  toggle: (cafe: CafeRef) => Promise<void>;
}

// Every café card mounts the hook, so the fetch is shared: one in flight, one load.
let inFlight: Promise<void> | null = null;

export const useSavedCafes = create<SavedCafesState>((set, get) => ({
  slugs: [],
  loaded: false,
  authed: false,

  load: async () => {
    if (get().loaded) return;
    if (inFlight) return inFlight;
    inFlight = (async () => {
      const res = await fetch('/api/proxy/grabit/favorites/mine');
      if (!res.ok) throw new Error('anonymous');
      const data: { cafes: CafeRef[] } = await res.json();
      const slugs = (data.cafes ?? []).map((c) => c.slug);

      // Lift bookmarks made before login (or before this was server-backed).
      const pending = readLocal().filter((s) => !slugs.includes(s));
      if (pending.length) {
        const all: CafeRef[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);
        for (const slug of pending) {
          const cafe = all.find((c) => c.slug === slug);
          if (!cafe) continue;
          const ok = await toggleOnServer(cafe.id).then((r) => r.ok).catch(() => false);
          if (ok) slugs.push(slug);
        }
      }
      writeLocal([]);
      set({ slugs, loaded: true, authed: true });
    })()
      .catch(() => set({ slugs: readLocal(), loaded: true, authed: false }))
      .finally(() => { inFlight = null; });
    return inFlight;
  },

  toggle: async (cafe) => {
    const prev = get().slugs;
    const next = prev.includes(cafe.slug)
      ? prev.filter((s) => s !== cafe.slug)
      : [cafe.slug, ...prev];
    set({ slugs: next });
    if (!get().authed) { writeLocal(next); return; }
    const ok = await toggleOnServer(cafe.id).then((r) => r.ok).catch(() => false);
    if (!ok) set({ slugs: prev });
  },
}));

export function useFavoriteCafe(cafe: CafeRef) {
  const slugs = useSavedCafes((s) => s.slugs);
  const load = useSavedCafes((s) => s.load);
  const toggleCafe = useSavedCafes((s) => s.toggle);
  useEffect(() => { load(); }, [load]);
  return { favorite: slugs.includes(cafe.slug), toggle: () => toggleCafe(cafe) };
}
