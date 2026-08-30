'use client';
/**
 * The customer's address book.
 *
 * The same addresses the cart picks from, somewhere they can be tidied up before
 * anyone is mid-checkout: rename one, fix a landmark, drop the flat they moved out
 * of, choose which one delivery should assume. Checkout stays the place you pick an
 * address for an order; this is the place you own them.
 *
 * There is no basket here, so the map deliberately says nothing about delivery
 * charges or serviceability while a pin is being placed - see AddressSheet's
 * cartValue prop. What a cafe charges is a property of an order, not of a home.
 */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '@/components/ui/kit';
import { MS } from '@/components/gb/kit';
import { NavSpacer } from '@/components/gb/kit';
import { AddressSheet } from '@/components/gb/AddressSheet';
import {
  deleteAddress, getPickedAddress, listAddresses, saveAddress, setPickedAddress,
  shortAddress, type DraftAddress, type SavedAddress,
} from '@/components/gb/delivery';

const labelIcon = (label: string) =>
  label === 'Work' ? 'work' : label === 'Home' ? 'home' : 'location_on';

export default function AddressesPage() {
  const [rows, setRows] = useState<SavedAddress[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [sheet, setSheet] = useState<null | { editing: DraftAddress | null }>(null);
  const [confirmDelete, setConfirmDelete] = useState<SavedAddress | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    // The address book is per account, so a guest has nothing to show. listAddresses
    // answers [] for both "signed out" and "none saved"; the auth check separates
    // them, because those two need different screens.
    const me = await fetch('/api/proxy/grabit/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    if (!me?.customerId) { setSignedOut(true); setRows([]); return; }
    setSignedOut(false);
    setRows(await listAddresses());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function makeDefault(a: SavedAddress) {
    if (busy) return;
    setBusy(true);
    // Optimistic: the flag is exclusive, so show it moving rather than waiting a
    // round trip on a tap whose only effect is a preference.
    setRows((prev) => prev?.map((r) => ({ ...r, is_default: r.id === a.id })) ?? prev);
    // A PATCH carrying only the flag is rejected: the endpoint validates the whole
    // address, so send the row back as it stands with the flag flipped.
    const saved = await saveAddress(a, true);
    if (!saved) await load();
    setBusy(false);
  }

  async function remove(a: SavedAddress) {
    setConfirmDelete(null);
    setBusy(true);
    setRows((prev) => prev?.filter((r) => r.id !== a.id) ?? prev);
    await deleteAddress(a.id);
    // If the basket was going to this address, it is not going anywhere now. Leaving
    // it picked would send an order to an address the customer just deleted.
    if (getPickedAddress()?.id === a.id) setPickedAddress(null);
    await load();
    setBusy(false);
  }

  return (
    <div className="gb-shell gb-shell-read">
      <TopBar title="Saved addresses" />

      {rows === null && (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>Loading…</div>
      )}

      {signedOut && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <MS name="location_on" size={40} color="var(--gb-line-3)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', marginTop: 10 }}>Log in to save addresses</div>
          <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 4 }}>They live with your account, so any device you order from already knows where you are.</div>
          <Link href="/login?next=/addresses" style={{ display: 'inline-block', marginTop: 16, background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '11px 22px', borderRadius: 12 }}>Log in</Link>
        </div>
      )}

      {!signedOut && rows?.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <MS name="add_location_alt" size={40} color="var(--gb-line-3)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', marginTop: 10 }}>No addresses yet</div>
          <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 4 }}>Save one now and delivery will fill it in for you at checkout.</div>
        </div>
      )}

      {!signedOut && rows && rows.length > 0 && (
        <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((a) => (
            <div
              key={a.id}
              style={{ background: 'var(--gb-card)', border: `1px solid ${a.is_default ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 'var(--gb-r-md)', padding: 14, boxShadow: 'var(--gb-elev-1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <MS name={labelIcon(a.label)} size={19} color="var(--gb-primary)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{a.label}</span>
                    {a.is_default && (
                      <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.04em', color: 'var(--gb-primary)', background: 'var(--gb-primary-pale)', padding: '2px 7px', borderRadius: 999 }}>DEFAULT</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, lineHeight: 1.45 }}>
                    {shortAddress(a)}{a.landmark ? ` · ${a.landmark}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                {!a.is_default && (
                  <button
                    onClick={() => makeDefault(a)}
                    disabled={busy}
                    style={{ border: '1px solid var(--gb-line-2)', background: '#fff', color: 'var(--gb-text)', fontSize: 12.5, fontWeight: 700, padding: '7px 12px', borderRadius: 10, cursor: busy ? 'default' : 'pointer' }}
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => setSheet({ editing: a })}
                  style={{ border: '1px solid var(--gb-line-2)', background: '#fff', color: 'var(--gb-text)', fontSize: 12.5, fontWeight: 700, padding: '7px 12px', borderRadius: 10, cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(a)}
                  aria-label={`Delete ${a.label}`}
                  style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: 'var(--gb-danger)', fontSize: 12.5, fontWeight: 700, padding: '7px 4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!signedOut && rows && (
        <div style={{ padding: '16px 16px 0' }}>
          <button
            onClick={() => setSheet({ editing: null })}
            className="gb-press"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', border: 'none', borderRadius: 'var(--gb-r-sm)', padding: '13px 0', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}
          >
            <MS name="add" size={19} />Add an address
          </button>
        </div>
      )}

      {sheet && (
        <AddressSheet
          cafeId={null}
          startOn={sheet.editing ? 'form' : 'map'}
          editing={sheet.editing}
          onPicked={() => { setSheet(null); load(); }}
          onClose={() => { setSheet(null); load(); }}
        />
      )}

      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--gb-r-lg)', padding: 22, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>Delete {confirmDelete.label}?</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', marginTop: 6, lineHeight: 1.45, fontWeight: 600 }}>
              {shortAddress(confirmDelete)}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 'var(--gb-r-sm)', border: '1px solid var(--gb-line-2)', background: '#fff', color: 'var(--gb-text)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Keep</button>
              <button onClick={() => remove(confirmDelete)} style={{ flex: 1, padding: '12px 0', borderRadius: 'var(--gb-r-sm)', border: 'none', background: 'var(--gb-danger)', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <NavSpacer />
    </div>
  );
}
