'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MS } from '@/components/gb/kit';
import { setSavedLocation } from '@/components/gb/location';

// Static suggestions — no saved-address backend yet (ponytail: swap for real data when addresses land).
const SUGGESTED = ['MG Road, Bengaluru', 'Indiranagar, Bengaluru', 'Koramangala, Bengaluru', 'HSR Layout, Bengaluru'];

export default function LocationPickerPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  function choose(label: string) {
    setSavedLocation(label);
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
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const label = data?.address
            ? [data.address.suburb || data.address.neighbourhood, data.address.city || data.address.town]
                .filter(Boolean)
                .join(', ')
            : `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          choose(label || 'Current location');
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

  const matches = query.trim()
    ? SUGGESTED.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()))
    : SUGGESTED;

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
            Suggested areas
          </div>
          {matches.map((s) => (
            <button
              key={s}
              onClick={() => choose(s)}
              style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--gb-line)', padding: '14px 18px', cursor: 'pointer', textAlign: 'left' }}
            >
              <MS name="location_on" size={20} color="var(--gb-muted)" />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{s}</span>
            </button>
          ))}
          {matches.length === 0 && (
            <p style={{ padding: '14px 18px', color: 'var(--gb-muted)', fontSize: 14 }}>No matches — try a different search.</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
