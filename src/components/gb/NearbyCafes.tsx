'use client';

import { useEffect, useState } from 'react';
import { RealCafeCard, type RealCafe } from './cards';

/**
 * A cafe with no pin set (most, before location became cafe-wide) never appears here —
 * there is nothing to measure a distance from. Renders nothing while loading or if the
 * customer has no fix or declines the permission prompt: no skeleton, no error state,
 * just absence, same as the section never existed for them.
 */
export function NearbyCafes() {
  const [cafes, setCafes] = useState<RealCafe[]>([]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`/api/proxy/grabit/cafes/nearby?lat=${latitude}&lng=${longitude}&radiusKm=5`)
          .then((res) => (res.ok ? res.json() : []))
          .then(setCafes)
          .catch(() => {});
      },
      () => {},
      { timeout: 8000 },
    );
  }, []);

  if (cafes.length === 0) return null;

  return (
    <div>
      <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 22 }}>Cafes near you</div>
      {cafes.map((c) => <RealCafeCard key={c.id} cafe={c} coverHeight={110} />)}
    </div>
  );
}
