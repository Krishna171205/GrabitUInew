'use client';
/** Saved delivery-area label — client-only (no saved-address backend yet). */
import { useEffect, useState } from 'react';

const KEY = 'grabit_location';
const DEFAULT_LOCATION = 'MG Road, Bengaluru';

export function getSavedLocation(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  return window.localStorage.getItem(KEY) || DEFAULT_LOCATION;
}

export function setSavedLocation(label: string) {
  window.localStorage.setItem(KEY, label);
}

export function useSavedLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  useEffect(() => setLocation(getSavedLocation()), []);
  return location;
}
