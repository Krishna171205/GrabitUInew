'use client';
/**
 * Where a delivery order goes.
 *
 * Three steps, in the order the customer thinks in: which address (if they have any),
 * where exactly on the map, and then the part no map knows - which flat, which floor,
 * which gate. The pin is the source of truth for the coordinates; the typed lines are
 * what the rider reads at the door. The typed text is never geocoded back into a point.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MS } from '@/components/gb/kit';
import {
  deleteAddress, getPickedAddress, listAddresses, quoteDelivery, reverseGeocodePoint,
  saveAddress, searchPlaces, setPickedAddress, shortAddress,
  type DeliveryQuote, type DraftAddress, type PlaceResult, type SavedAddress,
} from '@/components/gb/delivery';

// Connaught Place. Only a place to open the map when there is nothing better: no
// picked address, no saved one, no location permission. It is emphatically NOT a
// guess at where the customer is, so nothing is said about delivery until the map
// has actually moved somewhere they chose. See `untouched` below.
const FALLBACK = { lat: 28.6315, lng: 77.2167 };
const LABELS = ['Home', 'Work', 'Other'];

type Step = 'list' | 'map' | 'form';

export function AddressSheet({
  cafeId, cartValue, startOn = 'list', editing = null, onPicked, onClose,
}: {
  cafeId: number | null;
  /**
   * The basket this address is for, so the map can price the ride honestly while the
   * pin moves. Undefined when the sheet is opened from the address book, where there
   * is no basket and a price would be a guess: the map stays quiet about money then.
   */
  cartValue?: number;
  /** The address book opens straight on the map for "add new"; checkout opens on the list. */
  startOn?: Step;
  /** An existing address being corrected, so the form opens on it rather than empty. */
  editing?: DraftAddress | null;
  /** The address this basket is going to, or null when the customer has just removed it. */
  onPicked: (address: DraftAddress | null) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(startOn);
  const [saved, setSaved] = useState<SavedAddress[] | null>(null);
  const [draft, setDraft] = useState<DraftAddress | null>(editing);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // A customer with no saved addresses should land on the map, not on an empty list.
  useEffect(() => {
    let live = true;
    listAddresses().then((rows) => {
      if (!live) return;
      setSaved(rows);
      if (rows.length === 0 && startOn === 'list') setStep('map');
    });
    return () => { live = false; };
  }, []);

  function pick(address: DraftAddress) {
    setPickedAddress(address);
    onPicked(address);
    onClose();
  }

  if (!mounted) return null;

  return createPortal((
    <div
      // The palette lives on .gb-app, and a portal lands outside it: without this class
      // every --gb-* token resolves to nothing and the sheet renders unpainted.
      className="gb-app"
      style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Delivery address"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="om-enter"
        style={{ background: 'var(--gb-surface)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {step === 'list' && (
          <AddressList
            saved={saved}
            onAddNew={() => { setDraft(null); setStep('map'); }}
            onSelect={(a) => pick(a)}
            onEdit={(a) => { setDraft(a); setStep('map'); }}
            onDelete={async (id) => {
              setSaved((rows) => (rows ?? []).filter((r) => r.id !== id));
              // If the basket was going here, it is not going anywhere now. Leaving it
              // picked left the cart displaying a deleted address and sending its id.
              if (getPickedAddress()?.id === id) {
                setPickedAddress(null);
                onPicked(null);
              }
              await deleteAddress(id);
            }}
            onClose={onClose}
          />
        )}
        {step === 'map' && (
          <MapStep
            cafeId={cafeId}
            cartValue={cartValue}
            start={draft}
            onBack={saved && saved.length > 0 ? () => setStep('list') : onClose}
            onConfirm={(point) => {
              setDraft((d) => ({
                label: d?.label ?? 'Home',
                line1: d?.line1 ?? '',
                line2: point.area || d?.line2 || '',
                landmark: d?.landmark ?? '',
                id: d?.id,
                formatted_address: point.formatted,
                latitude: point.latitude,
                longitude: point.longitude,
              }));
              setStep('form');
            }}
          />
        )}
        {step === 'form' && draft && (
          <DetailsStep
            draft={draft}
            onBack={() => setStep('map')}
            onSave={async (finished) => {
              // Save first, then pick what came back: the row carries the id the list
              // marks as selected, and coordinates rounded to the column's 6 decimal
              // places. Picking the unrounded local copy left every saved address
              // looking unselected, because the two never compared equal.
              //
              // Best effort still: a guest has no address book to write to, and a failed
              // save must not cost them the address they just typed.
              // First address a customer saves becomes their default, so delivery has
              // something to assume next time. Later ones leave the existing default
              // where the customer put it.
              const first = (saved ?? []).length === 0 && !finished.id;
              const stored = await saveAddress(finished, first ? true : undefined);
              pick(stored
                ? { ...finished, id: stored.id, latitude: stored.latitude, longitude: stored.longitude }
                : finished);
            }}
          />
        )}
      </div>
    </div>
  ), document.body);
}

// --- step 1: the saved addresses -------------------------------------------

function AddressList({
  saved, onAddNew, onSelect, onEdit, onDelete, onClose,
}: {
  saved: SavedAddress[] | null;
  onAddNew: () => void;
  onSelect: (a: SavedAddress) => void;
  onEdit: (a: SavedAddress) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  const picked = getPickedAddress();
  return (
    <div style={{ padding: '18px 18px calc(22px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, flex: 1, color: 'var(--gb-text)' }}>Deliver to</div>
        <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
          <MS name="close" size={22} color="var(--gb-muted)" />
        </button>
      </div>

      <button
        onClick={onAddNew}
        style={{ marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed var(--gb-primary)', background: 'var(--gb-primary-pale)', borderRadius: 14, padding: '13px 14px', cursor: 'pointer', color: 'var(--gb-primary)', fontSize: 14, fontWeight: 800 }}
      >
        <MS name="add_location_alt" size={20} />Add a new address
      </button>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {saved === null && <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600 }}>Loading your addresses…</div>}
        {saved?.map((a) => {
          const isPicked = picked?.id === a.id;
          return (
            <div
              key={a.id}
              style={{ border: `1.5px solid ${isPicked ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 14, padding: '12px 13px', background: '#fff', display: 'flex', gap: 11 }}
            >
              <MS name={a.label === 'Work' ? 'work' : a.label === 'Home' ? 'home' : 'location_on'} size={19} color="var(--gb-primary)" />
              <button
                onClick={() => onSelect(a)}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{a.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>
                  {shortAddress(a)}{a.landmark ? ` · ${a.landmark}` : ''}
                </div>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => onEdit(a)} aria-label={`Edit ${a.label}`} style={iconBtn}>
                  <MS name="edit" size={16} color="var(--gb-muted)" />
                </button>
                <button onClick={() => onDelete(a.id)} aria-label={`Delete ${a.label}`} style={iconBtn}>
                  <MS name="delete" size={16} color="var(--gb-muted)" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, lineHeight: 0,
};

// --- step 2: the pin --------------------------------------------------------

interface PickedPoint { latitude: number; longitude: number; formatted: string; area: string; }

function MapStep({
  cafeId, cartValue, start, onBack, onConfirm,
}: {
  cafeId: number | null;
  cartValue?: number;
  start: DraftAddress | null;
  onBack: () => void;
  onConfirm: (point: PickedPoint) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [point, setPoint] = useState<PickedPoint | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null | 'checking'>(null);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);
  // True while the map is still sitting on FALLBACK because we have no idea where the
  // customer is. Pricing a cafe against Connaught Place told people in Gurgaon their
  // cafe was "too far to deliver" when the truth was that they had refused the
  // location prompt and we had never asked them for an area.
  const [untouched, setUntouched] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);

  /**
   * Reads the map centre, names it, and prices it. Runs on every settle of the map.
   *
   * Sequenced, because a geocode plus a quote routinely outlast the next settle: drag
   * the map and then tap a search result and there are two in flight, and whichever
   * lands last wins. Landing the older one wrote the dragged coordinates back over the
   * searched ones while the map showed the searched place, so Confirm saved a pin the
   * customer never chose and a rider went to the wrong door. Only the newest may write.
   */
  const settleSeq = useRef(0);
  const settle = useCallback(async (lat: number, lng: number) => {
    const seq = ++settleSeq.current;
    setQuote('checking');
    setPoint({ latitude: lat, longitude: lng, formatted: '', area: '' });
    const [named, priced] = await Promise.all([
      reverseGeocodePoint(lat, lng).catch(() => ({ formatted: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, area: '' })),
      // No basket, no price: quoting a cart value of zero against a cafe with a
      // minimum would tell someone saving their home address that it cannot be
      // delivered to, which is both wrong and none of this screen's business.
      cafeId != null && cartValue != null
        ? quoteDelivery(cafeId, lat, lng, cartValue)
        : Promise.resolve(null),
    ]);
    if (seq !== settleSeq.current) return;
    setPoint({ latitude: lat, longitude: lng, ...named });
    setQuote(priced);
  }, [cafeId, cartValue]);

  // The map is built once, so its moveend handler closes over the first settle. Calling
  // through a ref keeps it on the current one, which matters the moment settle depends
  // on anything that can change under it - the basket's value does.
  const settleRef = useRef(settle);
  useEffect(() => { settleRef.current = settle; }, [settle]);

  // Leaflet touches window on import, so it can only be loaded in the browser.
  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      // The import is async, so this effect can be torn down and re-run (React runs
      // effects twice in development) before it gets here. Building a second map on
      // the same node throws "Map container is already initialized", and the two
      // instances then fight over the location prompt.
      if (cancelled || !holder.current || mapRef.current) return;
      const picked = start ?? getPickedAddress();
      const center: [number, number] = picked
        ? [picked.latitude, picked.longitude]
        : [FALLBACK.lat, FALLBACK.lng];
      map = L.map(holder.current, { center, zoom: picked ? 17 : 13, zoomControl: false, attributionControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      mapRef.current = map;
      // The pin is a fixed overlay and the map moves under it, so the point is
      // whatever the centre lands on. Debounced: a drag fires moveend once, but a
      // fling can settle twice, and each settle costs a geocode.
      map.on('moveend', () => {
        clearTimeout(timer);
        setUntouched(false);
        const c = map!.getCenter();
        timer = setTimeout(() => settleRef.current(c.lat, c.lng), 250);
      });
      settleRef.current(center[0], center[1]);
      // A saved address opens on itself and counts as chosen. Anyone else opens on the
      // fallback, which does not, and gets asked for their location: granting it moves
      // the map, which clears `untouched` through moveend.
      setUntouched(!picked);
      if (!picked) locate(map, L);
    })();
    return () => { cancelled = true; clearTimeout(timer); map?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locate(map?: import('leaflet').Map | null, _L?: unknown) {
    const target = map ?? mapRef.current;
    if (!target || !('geolocation' in navigator)) { setDenied(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setDenied(false);
        target.setView([pos.coords.latitude, pos.coords.longitude], 17);
      },
      () => { setLocating(false); setDenied(true); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  // Search-as-you-type, debounced: Nominatim asks for at most a request a second.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); return; }
    const t = setTimeout(async () => {
      try { setResults(await searchPlaces(q)); } catch { setResults([]); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const pricing = cartValue != null;
  const serviceable = quote !== 'checking' && quote?.serviceable === true;
  const outOfRange = quote !== 'checking' && quote?.serviceable === false;
  // At checkout a pin the cafe will not reach is not worth confirming. In the address
  // book there is nothing to reach it for yet, so any real point will do.
  const confirmable = !!point && !untouched && (!pricing || serviceable);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '92vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
          <MS name="arrow_back" size={22} color="var(--gb-text)" />
        </button>
        <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--gb-text)' }}>Set your location</div>
      </div>

      <div style={{ padding: '0 16px 10px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gb-line-2)', borderRadius: 12, background: '#fff', padding: '9px 11px' }}>
          <MS name="search" size={18} color="var(--gb-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your area, street, building"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--gb-sans)', color: 'var(--gb-text)', background: 'transparent' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }} aria-label="Clear" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
              <MS name="close" size={17} color="var(--gb-muted)" />
            </button>
          )}
        </div>
        {results.length > 0 && (
          <div style={{ position: 'absolute', left: 16, right: 16, top: 52, zIndex: 5, background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 12, boxShadow: '0 18px 40px -24px rgba(60,40,25,.55)', overflow: 'hidden' }}>
            {results.map((r, i) => (
              <button
                key={`${r.latitude},${r.longitude},${i}`}
                onClick={() => {
                  setResults([]);
                  setQuery('');
                  mapRef.current?.setView([r.latitude, r.longitude], 17);
                }}
                style={{ display: 'flex', gap: 9, width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid var(--gb-line)', background: '#fff', padding: '11px 12px', cursor: 'pointer' }}
              >
                <MS name="location_on" size={18} color="var(--gb-muted)" />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)' }}>{r.label}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--gb-muted)', marginTop: 1, fontWeight: 500 }}>{r.sublabel}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 220 }}>
        <div ref={holder} className="gb-map-tint" style={{ position: 'absolute', inset: 0 }} />
        <div className="gb-map-tint-overlay" />
        {/* The pin sits still and the map moves under it: the centre IS the address. */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', zIndex: 400, textAlign: 'center' }}>
          <MS name="location_on" size={40} fill color="var(--gb-primary)" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,85,212,.35))' }} />
          <div className="gb-map-pin-shadow" style={{ margin: '-6px auto 0' }} />
        </div>
        <button
          onClick={() => locate()}
          style={{ position: 'absolute', right: 14, bottom: 14, zIndex: 400, display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: '#fff', borderRadius: 'var(--gb-r-sm)', padding: '9px 13px', fontSize: 12.5, fontWeight: 800, color: 'var(--gb-primary)', cursor: 'pointer', boxShadow: 'var(--gb-elev-2)' }}
        >
          <MS name="my_location" size={16} />{locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      {/* Docked over the map rather than flush against it - a hairline border read
          as an afterthought where every other floating panel in the app (bottom
          nav, sheets) gets a rounded top and an upward glow instead. */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), 0 -20px 40px -24px rgba(15,23,42,.35)', padding: '16px 16px calc(16px + env(safe-area-inset-bottom))', background: 'var(--gb-surface)' }}>
        {denied && (
          <div style={{ fontSize: 12, color: 'var(--gb-muted)', fontWeight: 600, marginBottom: 8 }}>
            We could not read your location. Search for your area above, or drag the map.
          </div>
        )}
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <MS name="location_on" size={18} color="var(--gb-primary)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--gb-text)' }}>
              {point?.area || 'Move the map to your doorstep'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', marginTop: 2, fontWeight: 500, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {point?.formatted || ''}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, minHeight: 18, fontSize: 12.5, fontWeight: 700 }}>
          {untouched && (
            <span style={{ color: 'var(--gb-muted)' }}>
              {pricing ? 'Search your area or drag the map to see if they deliver.' : 'Search your area or drag the map to your doorstep.'}
            </span>
          )}
          {!untouched && quote === 'checking' && <span style={{ color: 'var(--gb-muted)' }}>Checking if they deliver here…</span>}
          {!untouched && serviceable && (
            <span style={{ color: 'var(--gb-green)' }}>
              Delivers here · {quote && 'charge' in quote && quote.charge ? `₹${quote.charge} delivery` : 'Free delivery'}
              {quote && quote.distance_km ? ` · ${quote.distance_km} km away` : ''}
            </span>
          )}
          {!untouched && outOfRange && (
            <span style={{ color: '#C2410C' }}>
              {quote?.reason === 'OUT_OF_RANGE' && quote.max_distance_km
                ? `Too far. This cafe delivers up to ${quote.max_distance_km} km, and this is ${quote.distance_km} km away.`
                : 'This cafe is not delivering right now.'}
            </span>
          )}
          {/* pricing gates this the same way settle() gates ever calling quoteDelivery:
              without it (the address book, opened with no cafeId/cartValue) a quote is
              never attempted, so quote === null here means "not applicable", not
              "failed" - showing this message on every pin drop on that screen was the
              bug, not a transient one. */}
          {!untouched && pricing && quote === null && point && <span style={{ color: 'var(--gb-muted)' }}>Could not check delivery. Try again in a moment.</span>}
        </div>

        <button
          disabled={!confirmable}
          onClick={() => point && onConfirm(point)}
          style={{
            marginTop: 11, width: '100%', border: 'none', borderRadius: 13, padding: '13px 14px',
            background: confirmable ? 'var(--gb-primary)' : 'var(--gb-line-2)',
            color: confirmable ? 'var(--gb-on-primary)' : 'var(--gb-muted)',
            fontSize: 14.5, fontWeight: 800, cursor: confirmable ? 'pointer' : 'not-allowed',
          }}
        >
          Confirm location
        </button>
      </div>
    </div>
  );
}

// --- step 3: the part no map knows ------------------------------------------

function DetailsStep({
  draft, onBack, onSave,
}: {
  draft: DraftAddress;
  onBack: () => void;
  onSave: (a: DraftAddress) => void;
}) {
  const [line1, setLine1] = useState(draft.line1 ?? '');
  const [line2, setLine2] = useState(draft.line2 ?? '');
  const [landmark, setLandmark] = useState(draft.landmark ?? '');
  const [label, setLabel] = useState(draft.label || 'Home');
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 4px' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
          <MS name="arrow_back" size={22} color="var(--gb-text)" />
        </button>
        <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--gb-text)' }}>Address details</div>
      </div>

      <div style={{ overflowY: 'auto', padding: '10px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--gb-primary-soft)', border: '1px solid #EEE5D8', borderRadius: 12, padding: '10px 12px' }}>
          <MS name="location_on" size={17} color="var(--gb-primary)" />
          <div style={{ fontSize: 12, color: 'var(--gb-muted)', fontWeight: 600, lineHeight: 1.45 }}>{draft.formatted_address}</div>
        </div>

        <Field label="House / flat / floor" value={line1} onChange={setLine1} placeholder="Flat 402, B wing" autoFocus required />
        <Field label="Apartment / road / area" value={line2} onChange={setLine2} placeholder="Palm Grove, MG Road" />
        <Field label="Landmark (optional)" value={landmark} onChange={setLandmark} placeholder="Opposite the metro gate" />

        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 800, color: 'var(--gb-muted)' }}>SAVE AS</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {LABELS.map((l) => (
            <button
              key={l}
              onClick={() => setLabel(l)}
              style={{
                border: `1.5px solid ${label === l ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`,
                background: label === l ? 'var(--gb-primary-pale)' : '#fff',
                color: label === l ? 'var(--gb-primary)' : 'var(--gb-text)',
                borderRadius: 11, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px calc(16px + env(safe-area-inset-bottom))' }}>
        <button
          disabled={!line1.trim() || saving}
          onClick={() => {
            setSaving(true);
            onSave({
              ...draft,
              label,
              line1: line1.trim(),
              line2: line2.trim() || null,
              landmark: landmark.trim() || null,
            });
          }}
          style={{
            width: '100%', border: 'none', borderRadius: 13, padding: '13px 14px',
            background: line1.trim() ? 'var(--gb-primary)' : 'var(--gb-line-2)',
            color: line1.trim() ? 'var(--gb-on-primary)' : 'var(--gb-muted)',
            fontSize: 14.5, fontWeight: 800, cursor: line1.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'Saving…' : 'Save and deliver here'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, autoFocus, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; autoFocus?: boolean; required?: boolean;
}) {
  return (
    <label style={{ display: 'block', marginTop: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gb-muted)' }}>
        {label}{required ? ' *' : ''}
      </span>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 120))}
        placeholder={placeholder}
        style={{ width: '100%', marginTop: 6, border: '1px solid var(--gb-line-2)', borderRadius: 12, padding: '11px 12px', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--gb-sans)', color: 'var(--gb-text)', background: '#fff', outline: 'none' }}
      />
    </label>
  );
}
