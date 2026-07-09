'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MS } from '@/components/gb/kit';
import { reverseGeocode, searchLocations, setSavedLocation, type LocationResult } from '@/components/gb/location';

// Static suggestions shown when the search box is empty (no saved-address backend yet).
const SUGGESTED: LocationResult[] = [
  { label: 'MG Road, Bengaluru', city: 'Bengaluru' },
  { label: 'Indiranagar, Bengaluru', city: 'Bengaluru' },
  { label: 'Koramangala, Bengaluru', city: 'Bengaluru' },
  { label: 'HSR Layout, Bengaluru', city: 'Bengaluru' },
];

export default function LocationPickerPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>(SUGGESTED);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults(SUGGESTED); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        setResults(await searchLocations(q));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  function choose(label: string, city?: string) {
    setSavedLocation(label, city);
    router.back();
  }

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setError('Location not supported on this device');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { label, city } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          choose(label, city);
        } catch {
          setError('Could not determine your address');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Location permission denied');
        setLocating(false);
      }
    );
  }

  return (
    <div className="gb-app">
      <div className="gb-location-backdrop">
        <div className="gb-location-card" style={{ minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 18px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: 'var(--gb-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MS name="arrow_back" size={22} color="var(--gb-ink)" />
          </button>
          <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500 }}>Select a location</div>
        </div>

        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '13px 15px', boxShadow: '0 6px 16px -12px rgba(60,40,25,.4)' }}>
            <MS name="search" size={20} color="#B0A08C" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for area, street name…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14.5, color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)', fontWeight: 500 }}
            />
          </div>

          <button
            onClick={useCurrentLocation}
            disabled={locating}
            style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', marginTop: 16, background: 'none', border: 'none', padding: '14px 2px', cursor: locating ? 'default' : 'pointer', textAlign: 'left' }}
          >
            <MS name="my_location" size={22} color="var(--gb-primary)" />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--gb-primary)' }}>
              {locating ? 'Locating…' : 'Use current location'}
            </span>
          </button>
          {error && <p style={{ color: 'var(--gb-danger)', fontSize: 13, marginTop: 2 }}>{error}</p>}
        </div>

        <div style={{ padding: '10px 4px 30px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-faint)', padding: '10px 18px 6px' }}>
            {query.trim() ? 'Search results' : 'Suggested areas'}
          </div>
          {results.map((r, i) => (
            <button
              key={`${r.label}-${i}`}
              onClick={() => choose(r.label, r.city)}
              style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--gb-line)', padding: '14px 18px', cursor: 'pointer', textAlign: 'left' }}
            >
              <MS name="location_on" size={20} color="var(--gb-muted)" />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{r.label}</span>
            </button>
          ))}
          {!searching && results.length === 0 && (
            <p style={{ padding: '14px 18px', color: 'var(--gb-muted)', fontSize: 14 }}>No matches, try a different search.</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
