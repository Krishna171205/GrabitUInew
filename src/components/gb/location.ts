'use client';
/** Saved delivery-area label, client-only (no saved-address backend yet). */
import { useEffect, useState } from 'react';

const KEY = 'grabbit_location';
const CITY_KEY = 'grabbit_location_city';
export const DEFAULT_LOCATION = 'Rohini, Delhi';
const DEFAULT_CITY = 'Delhi';

// Static suggestions shown when the search box is empty (no saved-address backend yet).
// Delhi-first — Grabbit's launch market (see landing SEO: "Now live in Delhi").
export const SUGGESTED_LOCATIONS: LocationResult[] = [
  { label: 'Rohini, Delhi', city: 'Delhi' },
  { label: 'Dwarka, Delhi', city: 'Delhi' },
  { label: 'Lajpat Nagar, Delhi', city: 'Delhi' },
  { label: 'Connaught Place, New Delhi', city: 'New Delhi' },
  { label: 'Saket, New Delhi', city: 'New Delhi' },
  { label: 'Rajouri Garden, Delhi', city: 'Delhi' },
];

export function getSavedLocation(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  return window.localStorage.getItem(KEY) || DEFAULT_LOCATION;
}

export function getSavedCity(): string {
  if (typeof window === 'undefined') return DEFAULT_CITY;
  return window.localStorage.getItem(CITY_KEY) || DEFAULT_CITY;
}

export function setSavedLocation(label: string, city?: string) {
  window.localStorage.setItem(KEY, label);
  window.localStorage.setItem(CITY_KEY, city || label.split(',').pop()?.trim() || label);
}

/** Reverse-geocodes coords to an "area, city" label + bare city via OSM Nominatim (free, no key). */
export async function reverseGeocode(latitude: number, longitude: number): Promise<{ label: string; city: string }> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  const data = await res.json();
  const city = data?.address?.city || data?.address?.town || data?.address?.village || DEFAULT_CITY;
  const area = data?.address?.suburb || data?.address?.neighbourhood;
  return { label: [area, city].filter(Boolean).join(', ') || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`, city };
}

export interface LocationResult { label: string; city: string; }

/** Forward-geocodes free-text (area/street/city) to matching places via OSM Nominatim. */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(query)}`
  );
  const results: Array<{ address?: Record<string, string>; display_name: string }> = await res.json();
  const seen = new Set<string>();
  const out: LocationResult[] = [];
  for (const r of results) {
    const a = r.address || {};
    const city = a.city || a.town || a.village || DEFAULT_CITY;
    const area = a.suburb || a.neighbourhood || a.road;
    const label = [area, city].filter(Boolean).join(', ') || r.display_name;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, city });
  }
  return out;
}

/**
 * Reads the saved location (or the Delhi default). Acquisition is owned by the
 * LocationGate — by the time this hook runs, a location is always already saved,
 * so it never triggers a browser permission prompt on its own.
 */
export function useSavedLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [city, setCity] = useState(DEFAULT_CITY);

  useEffect(() => {
    setLocation(getSavedLocation());
    setCity(getSavedCity());
  }, []);

  return { location, city };
}
