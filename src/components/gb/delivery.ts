'use client';
/**
 * Delivery addresses and what a delivery costs.
 *
 * Two stores, deliberately: the server holds a signed-in customer's address book, and
 * localStorage holds the one address the current basket is going to. Checkout is open to
 * guests, so the picked address has to survive a page load before anyone has logged in.
 */

export interface SavedAddress {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  formatted_address: string | null;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

/** An address being captured, before it has an id. */
export interface DraftAddress {
  id?: number;
  label: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  formatted_address?: string | null;
  latitude: number;
  longitude: number;
}

export interface DeliveryQuote {
  serviceable: boolean;
  distance_km: number | null;
  charge: number | null;
  max_distance_km: number | null;
  /** What the cafe requires before it will send anyone out. Zero when it has no minimum. */
  min_order_value: number | null;
  /**
   * Why not, when it is not serviceable. The server sends exactly one of:
   * DELIVERY_OFF   the cafe has delivery switched off, or has priced no distance
   * NO_PIN         the cafe has not placed itself on the map, so nothing can be measured
   * BELOW_MIN_ORDER the basket is worth less than the cafe's minimum
   * OUT_OF_RANGE   the address is further than the cafe delivers
   */
  reason?: 'DELIVERY_OFF' | 'NO_PIN' | 'BELOW_MIN_ORDER' | 'OUT_OF_RANGE' | null;
}

// Where the customer wants their food, not which cafe is sending it: deliberately one
// key for the whole app rather than one per cafe. Your home does not change because you
// switched cafe, and re-picking it at every cafe is the friction this key removes.
// Serviceability is not cached with it: the cart re-quotes against the cafe it is on,
// so a saved address that one cafe cannot reach still fails there and only there.
const PICKED_KEY = 'grabbit_delivery_address';

export function getPickedAddress(): DraftAddress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PICKED_KEY);
    return raw ? (JSON.parse(raw) as DraftAddress) : null;
  } catch {
    return null;
  }
}

export function setPickedAddress(address: DraftAddress | null) {
  if (address) window.localStorage.setItem(PICKED_KEY, JSON.stringify(address));
  else window.localStorage.removeItem(PICKED_KEY);
}

// --- server address book ---------------------------------------------------
// Every call returns empty / null rather than throwing when the customer is not
// signed in: the address book is a convenience on top of the picked address, and
// a guest must still reach checkout.

export async function listAddresses(): Promise<SavedAddress[]> {
  try {
    const res = await fetch('/api/proxy/grabit/addresses');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Creates or updates one address.
 *
 * `makeDefault` is deliberately opt-in. This used to send is_default: true on every
 * save, so renaming "Home" to "House" quietly took the default away from whichever
 * address the customer had chosen for it. Omitting the field leaves the server's
 * existing flag alone; the first address a customer saves becomes their default on
 * the server's side regardless.
 */
export async function saveAddress(
  draft: DraftAddress,
  makeDefault?: boolean,
): Promise<SavedAddress | null> {
  const body = {
    label: draft.label,
    line1: draft.line1,
    line2: draft.line2 ?? null,
    landmark: draft.landmark ?? null,
    formatted_address: draft.formatted_address ?? null,
    latitude: draft.latitude,
    longitude: draft.longitude,
    ...(makeDefault === undefined ? {} : { is_default: makeDefault }),
  };
  try {
    const res = await fetch(
      draft.id ? `/api/proxy/grabit/addresses/${draft.id}` : '/api/proxy/grabit/addresses',
      {
        method: draft.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
export async function deleteAddress(id: number): Promise<void> {
  try {
    await fetch(`/api/proxy/grabit/addresses/${id}`, { method: 'DELETE' });
  } catch {
    // Nothing to recover: the list refetches, and a failed delete just stays listed.
  }
}

/**
 * Whether this cafe delivers here, and for how much. Never throws; an unreachable
 * server reads as "cannot tell".
 *
 * cartValue matters: the server compares it against the cafe's minimum order value
 * and answers BELOW_MIN_ORDER when it falls short. Omitting it defaults the server
 * to zero, which made every cafe with a minimum look like it refused the address.
 */
export async function quoteDelivery(
  cafeId: number,
  lat: number,
  lng: number,
  cartValue: number,
): Promise<DeliveryQuote | null> {
  try {
    const res = await fetch(
      `/api/proxy/grabit/cafes/${cafeId}/delivery-quote?lat=${lat}&lng=${lng}&cartValue=${encodeURIComponent(cartValue.toFixed(2))}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- geocoding -------------------------------------------------------------
// OpenStreetMap's Nominatim, the same service the location gate already uses.
// Free and keyless; its usage policy asks for at most one request a second, which
// is why every caller here is debounced.

export interface PlaceResult {
  label: string;
  sublabel: string;
  latitude: number;
  longitude: number;
}

/** What the pin is currently sitting on, in words. */
export async function reverseGeocodePoint(lat: number, lng: number): Promise<{ formatted: string; area: string }> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`);
  const data = await res.json();
  const a = data?.address ?? {};
  const area = [a.road || a.neighbourhood || a.suburb, a.suburb && a.road ? a.suburb : null]
    .filter(Boolean).join(', ');
  return {
    formatted: data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    area: area || a.city || a.town || '',
  };
}

/** Search-as-you-type over Indian addresses, keeping the coordinates the pin needs. */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(query)}`,
  );
  const rows: Array<{ display_name: string; lat: string; lon: string; address?: Record<string, string> }> = await res.json();
  return rows.map((r) => {
    const parts = r.display_name.split(',').map((p) => p.trim());
    return {
      label: parts[0] || r.display_name,
      sublabel: parts.slice(1, 4).join(', '),
      latitude: Number(r.lat),
      longitude: Number(r.lon),
    };
  });
}

/** One line for a card or a bill, the way a rider would read it out. */
export function shortAddress(a: { line1: string; line2?: string | null; formatted_address?: string | null }): string {
  return [a.line1, a.line2].filter(Boolean).join(', ') || a.formatted_address || '';
}
