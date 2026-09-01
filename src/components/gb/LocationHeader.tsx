'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MS } from './kit';
import { useSavedLocation } from './location';
import { AddressSheet } from './AddressSheet';
import { saveAddress, type DraftAddress } from './delivery';

/**
 * The home hero's top-left block: location leads, bold and tappable, the way
 * Swiggy/Zepto/Zomato all treat it - not a name greeting with the location
 * demoted to a pill underneath. `secondary` carries whatever used to be the
 * greeting, now a quiet second line instead of the loudest thing in the hero.
 *
 * `address` is the customer's default saved address (delivery.ts's address
 * book, built for checkout - the same "type it once" flow Swiggy uses), fetched
 * server-side in home/page.tsx. Present, it replaces the GPS-to-Nominatim
 * guess useSavedLocation() falls back to: a live coordinate reverse-geocode
 * has no house-number data for most of India and reads as a nearby village,
 * a saved address is exactly what the customer typed.
 *
 * Tapping opens the same address-book sheet checkout already uses (list of
 * every saved address, pick one, add a new one) rather than routing to /addresses
 * or to the unrelated GPS/area picker - showing one saved address here with no
 * way to switch to another was the actual complaint this fixes. Picking a
 * different one makes it the account's default (saveAddress(..., true)), the
 * same call /addresses' own "Make default" button already makes, so the choice
 * sticks past this one visit instead of being a this-tab-only preference.
 */
export function LocationHeader({
  secondary, address,
}: {
  secondary: string;
  address?: { label: string; shortText: string } | null;
}) {
  const router = useRouter();
  const { location } = useSavedLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const primary = address?.shortText ?? location;

  async function handlePicked(picked: DraftAddress | null) {
    setSheetOpen(false);
    // A real saved row always carries its id; a bare draft (shouldn't happen from
    // the list step, but the shared type allows it) has nothing to mark default.
    if (picked?.id != null) await saveAddress(picked, true);
    router.refresh();
  }

  if (!address) {
    return (
      <Link href="/location" style={{ display: 'block', color: '#fff' }}>
        <Body primary={primary} secondary={secondary} />
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        style={{ display: 'block', color: '#fff', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
      >
        <Body primary={primary} secondary={secondary} />
      </button>
      {sheetOpen && (
        <AddressSheet
          cafeId={null}
          startOn="list"
          onPicked={handlePicked}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}

function Body({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <MS name="location_on" size={17} color="var(--gb-peach)" />
        <span className="gb-serif" style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{primary}</span>
        <MS name="expand_more" size={19} color="rgba(255,255,255,.65)" />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,.62)', marginTop: 3 }}>{secondary}</div>
    </>
  );
}
