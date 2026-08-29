'use client';
/** Saved delivery-area label, client-only (no saved-address backend yet). */
import { useEffect, useState } from 'react';

const KEY = 'grabbit_location';
const CITY_KEY = 'grabbit_location_city';
export const DEFAULT_LOCATION = 'DTU, Delhi';
const DEFAULT_CITY = 'Delhi';

// Only Raydee @ DTU is live - suggesting unrelated Delhi localities was noise
// with nothing behind them. One real suggestion beats six fake ones.
export const SUGGESTED_LOCATIONS: LocationResult[] = [
  { label: 'DTU, Delhi', city: 'Delhi' },
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

const COORDS_KEY = 'grabbit_location_coords';

/**
 * The coordinates behind the label, kept only when the customer actually granted
 * GPS. Picking an area by name gives us a label and no point, so there is nothing
 * to save and nothing to measure from - which is why distances disappear rather
 * than being estimated from a suburb name.
 */
export function setSavedCoords(latitude: number, longitude: number) {
  window.localStorage.setItem(COORDS_KEY, JSON.stringify({ lat: latitude, lng: longitude }));
}

export function clearSavedCoords() {
  window.localStorage.removeItem(COORDS_KEY);
}

export function getSavedCoords(): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { lat: number; lng: number };
    return Number.isFinite(v?.lat) && Number.isFinite(v?.lng) ? v : null;
  } catch {
    return null;
  }
}

/** Reverse-geocodes coords to an "area, city" label + bare city via OSM Nominatim (free, no key). */
export async function reverseGeocode(latitude: number, longitude: number): Promise<{ label: string; city: string }> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${latitude}&lon=${longitude}`);
  const data = await res.json();
  const city = data?.address?.city || data?.address?.town || data?.address?.village || DEFAULT_CITY;
  const area = data?.address?.suburb || data?.address?.neighbourhood;
  return { label: [area, city].filter(Boolean).join(', ') || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`, city };
}

export interface LocationResult { label: string; city: string; }

/** Forward-geocodes free-text (area/street/city) to matching places via OSM Nominatim. */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&accept-language=en&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(query)}`
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
