'use client';
/** Saved delivery-area label, client-only (no saved-address backend yet). */
import { useEffect, useState } from 'react';

const KEY = 'grabbit_location';
const CITY_KEY = 'grabbit_location_city';
export const DEFAULT_LOCATION = 'MG Road, Bengaluru';
const DEFAULT_CITY = 'Bengaluru';

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

export function useSavedLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [city, setCity] = useState(DEFAULT_CITY);

  useEffect(() => {
    const savedLabel = window.localStorage.getItem(KEY);
    if (savedLabel) {
      setLocation(savedLabel);
      setCity(getSavedCity());
      return;
    }
    // First visit, no saved location yet: silently try to auto-detect (Zomato/Blinkit-style),
    // same permission prompt the browser shows once. Falls back to the Bengaluru default on
    // denial/error, no dialog or blocking UI shown.
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { label, city } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setSavedLocation(label, city);
          setLocation(label);
          setCity(city);
        } catch {
          // keep default silently, user can still pick manually
        }
      },
      () => {},
    );
  }, []);

  return { location, city };
}
