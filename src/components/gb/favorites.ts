'use client';
/**
 * Café bookmarks, client-only (no backend favourites table yet).
 * ponytail: localStorage set, swap for a real endpoint when one exists.
 */
import { useEffect, useState } from 'react';

const KEY = 'grabbit_favorite_cafes';

function readAll(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeAll(set: Set<string>) {
  window.localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function useFavoriteCafe(slug: string) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(readAll().has(slug));
  }, [slug]);

  function toggle() {
    const all = readAll();
    if (all.has(slug)) all.delete(slug); else all.add(slug);
    writeAll(all);
    setFavorite(all.has(slug));
  }

  return { favorite, toggle };
}
