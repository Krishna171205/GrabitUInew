'use client';
/**
 * "You will love pairing it with": a strip above the cart bar that opens a sheet of
 * items that go with what is already in the cart (a dip with fries, cheese on a
 * burger, a drink with a meal that has none). Rules live in ./pairings.
 */
import Image from 'next/image';
import { useState } from 'react';
import type { GrabbitMenuItem } from '@gradient365/gradient-commons';
import { MS, Veg } from './kit';
import { inr } from './format';
import type { Pairing } from './pairings';

interface Props {
  pairings: Pairing[];
  /** Quantity of the plain (no add-on) line for an item, as the menu grid counts it. */
  qtyOf: (id: number) => number;
  onAdd: (item: GrabbitMenuItem) => void;
  onQty: (id: number, qty: number) => void;
  /** Fallback photo id for items with no image, owned by the menu page. */
  placeholderFor: (item: GrabbitMenuItem) => string;
  photoUrl: (id: string, w?: number, h?: number) => string;
}

function Card({ item, qty, onAdd, onQty, src }: {
  item: GrabbitMenuItem; qty: number; src: string;
  onAdd: (item: GrabbitMenuItem) => void; onQty: (id: number, qty: number) => void;
}) {
  return (
    <div style={{ background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
      <div style={{ position: 'relative', height: 104 }}>
        <Image src={src} alt={item.name} fill sizes="(max-width: 480px) 45vw, 200px" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(255,255,255,.92)', borderRadius: 4, padding: 2, display: 'grid', placeItems: 'center' }}>
          <Veg veg={item.is_veg} />
        </div>
        {qty > 0 ? (
          <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 999, overflow: 'hidden', boxShadow: '0 3px 10px rgba(60,40,25,.25)' }}>
            <button onClick={() => onQty(item.id, qty - 1)} aria-label={`Remove one ${item.name}`} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
            <span style={{ minWidth: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qty}</span>
            <button onClick={() => onQty(item.id, qty + 1)} aria-label={`Add one ${item.name}`} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            style={{ position: 'absolute', right: 8, bottom: 8, display: 'inline-flex', alignItems: 'center', gap: 2, background: '#fff', border: '1.5px solid var(--gb-primary)', color: 'var(--gb-primary)', borderRadius: 10, padding: '5px 10px', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(60,40,25,.2)' }}
          >
            ADD<MS name="add" size={14} />
          </button>
        )}
      </div>
      <div style={{ padding: '9px 10px 11px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gb-text)', marginTop: 3 }}>{inr(item.price)}</div>
      </div>
    </div>
  );
}

export function PairingSheet({ pairings, qtyOf, onAdd, onQty, placeholderFor, photoUrl }: Props) {
  // Snapshot taken when the sheet opens. Adding a drink satisfies the "something to
  // drink?" rule, so a live list would delete that whole section, and the item just
  // tapped, out from under the customer. The cards' steppers still read live cart
  // quantities, so the add is visible; the list settles on the next open.
  const [shown, setShown] = useState<Pairing[] | null>(null);
  const open = shown !== null;

  if (pairings.length === 0 && !open) return null;
  const count = pairings.reduce((n, p) => n + p.items.length, 0);
  const stripPrompt = pairings[0]?.prompt;
  const srcFor = (item: GrabbitMenuItem) => item.image_url || photoUrl(placeholderFor(item));

  return (
    <>
      {/* collapsed strip, sitting on top of the floating cart bar */}
      {stripPrompt && <button
        onClick={() => setShown(pairings)}
        className="gb-pairing-strip"
        style={{
          position: 'fixed', bottom: 'calc(92px + env(safe-area-inset-bottom))', left: 16, right: 16,
          maxWidth: 448, margin: '0 auto', zIndex: 34, background: 'var(--gb-primary-soft)',
          border: '1px solid #EAD6C4', borderRadius: 14, padding: '11px 14px', display: 'flex',
          alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 10px 24px -16px rgba(60,40,25,.5)',
        }}
      >
        <MS name="restaurant" size={18} fill color="var(--gb-primary)" />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--gb-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stripPrompt}
        </span>
        <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700, color: 'var(--gb-muted)' }}>
          {count}
          <MS name="expand_less" size={18} />
        </span>
      </button>}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={() => setShown(null)}>
          <button
            onClick={() => setShown(null)}
            aria-label="Close"
            style={{ alignSelf: 'center', marginBottom: 14, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <MS name="close" size={22} color="var(--gb-ink)" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--gb-surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: '60vh', overflowY: 'auto', padding: '18px 16px calc(18px + env(safe-area-inset-bottom))' }}
          >
            {(shown ?? []).map((p, pi) => (
              <div key={p.prompt} style={{ marginTop: pi === 0 ? 0 : 22 }}>
                <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500, color: 'var(--gb-text)' }}>{p.prompt}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  {p.items.map((item) => (
                    <Card key={item.id} item={item} qty={qtyOf(item.id)} onAdd={onAdd} onQty={onQty} src={srcFor(item)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
