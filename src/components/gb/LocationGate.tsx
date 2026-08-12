'use client';
/**
 * Mandatory location gate (Swiggy/Zomato-style). Blocks the consumer app until
 * the user either grants location access (auto-detected, reverse-geocoded) or
 * manually picks an area. There is no dismiss — a saved location is required to
 * browse. Location acquisition lives here, and only here.
 */
import { useEffect, useState } from 'react';
import { MS } from './kit';
import { reverseGeocode, searchLocations, setSavedLocation, SUGGESTED_LOCATIONS, type LocationResult } from './location';

export function LocationGate() {
  // 'checking' = first paint, reading localStorage (avoid gate-flash for returning users)
  const [phase, setPhase] = useState<'checking' | 'gate' | 'done'>('checking');
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>(SUGGESTED_LOCATIONS);
  const [searching, setSearching] = useState(false);

  // Returning users with a saved location skip the gate entirely.
  useEffect(() => {
    if (window.localStorage.getItem('grabbit_location')) setPhase('done');
    else setPhase('gate');
  }, []);

  // Search-as-you-type over Delhi areas (Nominatim).
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults(SUGGESTED_LOCATIONS); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try { setResults(await searchLocations(q)); } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  if (phase === 'checking' || phase === 'done') return null;

  function grantLocation() {
    if (!('geolocation' in navigator)) {
      setDenied(true);
      return;
    }
    setLocating(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { label, city } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setSavedLocation(label, city);
          setPhase('done');
        } catch {
          setDenied(true);
        } finally {
          setLocating(false);
        }
      },
      () => { setDenied(true); setLocating(false); },
      { timeout: 10000 },
    );
  }

  function pick(r: LocationResult) {
    setSavedLocation(r.label, r.city);
    setPhase('done');
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Choose your location" style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--gb-hero)', color: '#fff', overflowY: 'auto' }}>
      {/* faint brand mark */}
      <div style={{ padding: 'calc(40px + env(safe-area-inset-top)) 26px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(4px)', padding: '7px 14px', borderRadius: 999 }}>
          <MS name="bolt" size={16} fill color="#FFD98E" />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.02em' }}>GrabBit</span>
        </div>
        <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.15, marginTop: 26, letterSpacing: '-.01em' }}>
          Where should we<br />find your cafés?
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: 'rgba(255,255,255,.82)', marginTop: 10, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
          Enable location access to see cafés near you — or pick an area below.
        </div>

        {/* primary: grant access */}
        <button
          onClick={grantLocation}
          disabled={locating}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', maxWidth: 340, margin: '26px auto 0', background: '#fff', color: '#2E2019', border: 'none', borderRadius: 14, padding: '15px 0', fontSize: 15, fontWeight: 800, cursor: locating ? 'default' : 'pointer', boxShadow: '0 12px 26px -12px rgba(20,10,5,.55)' }}
        >
          <MS name="my_location" size={19} fill color="var(--gb-primary)" />
          {locating ? 'Locating…' : 'Enable location access'}
        </button>
        {denied && (
          <div style={{ marginTop: 12, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>
            <MS name="info" size={17} fill color="#FFD98E" />
            <span>We couldn’t access your location. Pick an area below to continue — you can change it anytime.</span>
          </div>
        )}

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 340, margin: '22px auto 0' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.25)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>or choose manually</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.25)' }} />
        </div>
      </div>

      {/* white sheet with search + suggestions */}
      <div style={{ background: 'var(--gb-surface)', color: 'var(--gb-text)', borderRadius: '24px 24px 0 0', marginTop: 22, padding: '18px 18px calc(30px + env(safe-area-inset-bottom))', minHeight: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '12px 14px', boxShadow: '0 6px 16px -12px rgba(60,40,25,.4)' }}>
          <MS name="search" size={20} color="#B0A08C" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for area, street name…"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14.5, color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)', fontWeight: 500 }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" style={{ display: 'flex', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
              <MS name="close" size={19} color="#B0A08C" />
            </button>
          )}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-faint)', padding: '14px 4px 4px' }}>
          {query.trim() ? 'Search results' : 'Suggested areas'}
        </div>
        {searching && <p style={{ padding: '10px 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>Searching…</p>}
        {!searching && results.map((r) => (
          <button
            key={r.label}
            onClick={() => pick(r)}
            style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--gb-line)', padding: '14px 4px', cursor: 'pointer', textAlign: 'left' }}
          >
            <MS name="location_on" size={20} color="var(--gb-primary)" />
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{r.label}</span>
            <MS name="chevron_right" size={18} color="var(--gb-faint)" />
          </button>
        ))}
        {!searching && results.length === 0 && (
          <p style={{ padding: '12px 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>No matches, try a different search.</p>
        )}
      </div>
    </div>
  );
}
