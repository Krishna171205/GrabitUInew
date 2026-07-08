'use client';
import Link from 'next/link';
import { MS } from './kit';
import { useSavedLocation } from './location';

export function LocationPill() {
  const { location } = useSavedLocation();
  return (
    <Link
      href="/location"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 16, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', padding: '7px 12px', borderRadius: 999, color: '#fff' }}
    >
      <MS name="location_on" size={16} color="var(--gb-peach)" />
      <span style={{ fontSize: 13, fontWeight: 600 }}>{location}</span>
      <MS name="expand_more" size={17} color="rgba(255,255,255,.65)" />
    </Link>
  );
}
