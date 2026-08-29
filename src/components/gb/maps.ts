'use client';
/**
 * Getting a customer to a cafe.
 *
 * We do not draw maps. Google Maps already knows where the customer is standing,
 * how to route them, and how to hand off to their phone's navigation, so the job
 * here is to open it pointed at the right place. `dir/?api=1` with only a
 * destination lets Maps use the device's live location as the origin, which is
 * what makes this work without asking the customer for anything.
 *
 * A cafe whose owner has not dropped a pin in Omega yet has no coordinates, so
 * we fall back to a Maps search for its name and address. Less exact, but a new
 * cafe is exactly the case where the customer needs something.
 */

export interface MappableCafe {
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

/** The pin as numbers, or null when the owner has not set one. */
export function cafeCoords(cafe: MappableCafe): { lat: number; lng: number } | null {
  const lat = Number(cafe.latitude);
  const lng = Number(cafe.longitude);
  if (cafe.latitude == null || cafe.longitude == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // 0,0 is the Atlantic, not a cafe: it is what an unset column looks like when
  // something has defaulted it rather than left it null.
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

/** Google Maps, routing from wherever the customer is to the cafe. */
export function directionsUrl(cafe: MappableCafe): string {
  const pin = cafeCoords(cafe);
  if (pin) return `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;
  const query = [cafe.name, cafe.address, cafe.city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line distance in km. Not walking distance, so it is only ever shown as "about". */
export function distanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * How far the cafe is from the customer, or null when either end is unknown.
 * Never guessed: the screen shows nothing rather than a number that is made up.
 */
export function distanceLabel(
  cafe: MappableCafe,
  me: { lat: number; lng: number } | null,
): string | null {
  const pin = cafeCoords(cafe);
  if (!pin || !me) return null;
  const km = distanceKm(me, pin);
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m away`;
  return `${km.toFixed(1)} km away`;
}
