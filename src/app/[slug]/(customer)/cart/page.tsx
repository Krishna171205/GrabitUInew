'use client';
/**
 * Cart = checkout, Zomato-style: one screen from items to payment. Pick your
 * pickup slot (or dine-in table), review items, add more / add a note, grab a
 * recommendation or two, pick a payment method, and Place Order — which either
 * launches Cashfree (online) straight from this screen. No separate review
 * page; the order page after payment is the tracking screen.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import * as Sentry from '@sentry/nextjs';
import { useCart, cartLineKey } from '@/store/cart';
import type { GrabbitAvailableSlot, GrabbitMenuCategory, GrabbitMenuItem } from '@gradient365/gradient-commons';
import { MS } from '@/components/gb/kit';
import { LineNote } from '@/components/gb/LineNote';
import { inr } from '@/components/gb/format';

import { offerHeadline, offerTerms, type GrabbitOffer } from '@/components/gb/offers';
import { useOfferRotation, OFFER_SLIDE_MS } from '@/components/gb/useOfferRotation';
import { useBackTo } from '@/lib/useBackTo';
import { menuImageSrc } from '@/lib/menu-image';
import { AddressSheet } from '@/components/gb/AddressSheet';
import { getPickedAddress, listAddresses, quoteDelivery, saveAddress, setPickedAddress, shortAddress, type DeliveryQuote, type DraftAddress } from '@/components/gb/delivery';
import GrabbitCup3D from '@/components/cup3d/GrabbitCup3D';

interface SlotsData { slots: GrabbitAvailableSlot[]; label: string | null; }

/**
 * Why the cafe will not bring this order here, in words that say what to do next.
 *
 * Every branch has an action in it, because "no" on its own leaves the customer
 * staring at a full basket. Only BELOW_MIN_ORDER is recoverable by spending more,
 * and it is the one worth naming a number for.
 */
function unserviceableReason(quote: DeliveryQuote, itemsPayable: number): string {
  switch (quote.reason) {
    case 'BELOW_MIN_ORDER': {
      const min = Number(quote.min_order_value ?? 0);
      const short = Math.max(0, min - itemsPayable);
      return short > 0
        ? `Delivery starts at ${inr(min)}. Add ${inr(short)} more, or switch to pickup.`
        : `Delivery starts at ${inr(min)} of items. Switch to pickup to order now.`;
    }
    case 'OUT_OF_RANGE':
      return quote.max_distance_km
        ? `Too far to deliver. They reach up to ${quote.max_distance_km} km, and this is ${quote.distance_km} km away. Pick another address, or switch to pickup.`
        : 'This address is outside the area they deliver to. Pick another, or switch to pickup.';
    case 'NO_PIN':
      // The cafe has not placed itself on the map, so no distance can be measured.
      // Nothing the customer can fix, so do not ask them to try another address.
      return 'This cafe has not set its location yet, so delivery cannot be worked out. Pickup is available.';
    default:
      return 'This cafe is not delivering right now. Switch to pickup to order.';
  }
}

function dateStr(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function interleaveByCategory(items: GrabbitMenuItem[]): GrabbitMenuItem[] {
  const byCat = new Map<string, GrabbitMenuItem[]>();
  for (const item of items) {
    const list = byCat.get(item.category);
    if (list) list.push(item); else byCat.set(item.category, [item]);
  }
  const buckets = Array.from(byCat.values());
  const result: GrabbitMenuItem[] = [];
  for (let i = 0; result.length < items.length; i++) {
    for (const bucket of buckets) if (bucket[i]) result.push(bucket[i]);
  }
  return result;
}

// Mirrors OfferService.discountFor in preorderservice: percent discounts round
// HALF_UP to 2dp before the max_discount cap is applied, and every result is
// clamped to the cart value so a preview can never promise more than checkout
// can honor. Server re-derives this from offer_id regardless - this is preview
// only, so a stale value can only misdisplay, not mischarge.
function discountFor(offer: GrabbitOffer, cartValue: number): number {
  if (offer.min_order_value != null && cartValue < offer.min_order_value) return 0;
  let discount: number;
  if (offer.offer_type === 'FLAT') {
    discount = offer.flat_off ?? 0;
  } else if (offer.offer_type === 'FREE_ITEM') {
    discount = offer.free_item_price ?? 0;
  } else {
    discount = Math.round(cartValue * (offer.percent_off ?? 0)) / 100;
    if (offer.max_discount != null && discount > offer.max_discount) discount = offer.max_discount;
  }
  return discount > cartValue ? cartValue : discount;
}

// Nearest-to-now available slot, for opening the picker centered on something
// meaningful instead of always index 0 (which is the day's first slot, not "now").
function nearestAvailableSlotIndexToNow(slots: GrabbitAvailableSlot[]): number {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  let bestIdx = 0;
  let bestDiff = Infinity;
  slots.forEach((s, i) => {
    if (s.available_count === 0) return;
    const d = new Date(s.slot_start);
    const diff = Math.abs(d.getHours() * 60 + d.getMinutes() - nowMinutes);
    if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
  });
  return bestIdx;
}

const fmtTick = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const WHEEL_ITEM_H = 44;

// Backend never validates pickup_slot against the bookable-slot list (see
// OrderService.createOrder - it only checks for non-null and stores it
// verbatim), so the custom picker doesn't need to snap to a real slot at all.
// It just stamps the dialed wall-clock time onto the cafe's own timezone.
//
// slot_start comes back as a bare UTC timestamp ("...Z"), not "+05:30" -
// there's no offset to read off the string. Grabbit is India-only, so the
// cafe's wall-clock offset is hardcoded IST rather than parsed. Deliberately
// NOT using Date.getHours()/setHours() anywhere here either: those read the
// *browser's* local timezone, which happens to be IST on a real user's
// device but isn't guaranteed everywhere this code runs (a CI runner, a
// differently-timezoned dev machine) - going through this fixed offset keeps
// the picker correct regardless of the viewing device's own timezone.
const IST_OFFSET_MIN = 330;
function wallClockOf(iso: string) {
  const local = new Date(new Date(iso).getTime() + IST_OFFSET_MIN * 60000);
  return { y: local.getUTCFullYear(), mo: local.getUTCMonth() + 1, d: local.getUTCDate(), h: local.getUTCHours(), mnt: local.getUTCMinutes() };
}
function buildUtcSlotIso(y: number, mo: number, d: number, h: number, mnt: number): string {
  return new Date(Date.UTC(y, mo - 1, d, h, mnt, 0) - IST_OFFSET_MIN * 60000).toISOString();
}
function epochOf(y: number, mo: number, d: number, h: number, mnt: number): number {
  return Date.UTC(y, mo - 1, d, h, mnt, 0) - IST_OFFSET_MIN * 60000;
}
function fmtWallClock(iso: string): string {
  const { h, mnt } = wallClockOf(iso);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mnt).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/**
 * One column of a 3-column wheel (hour / minute / AM-PM), each scrolling
 * completely independently - matches the native iOS "Edit Alarm" reference,
 * where hour/minute/period are three separate wheels, not one combined list.
 *
 * Root cause of an earlier single-column attempt's "blank" centered row: a
 * decorative position:absolute highlight div sitting over an overflow:auto
 * sibling scroller composited unpredictably in real browsers, independent of
 * DOM order. Fixed by putting the highlight on the centered item itself
 * instead of a separate overlay - nothing left to mis-layer. Same approach
 * used here.
 */
function WheelColumn({
  items, initialIndex, onChange, width,
}: {
  items: string[]; initialIndex: number; onChange: (index: number) => void; width: number;
}) {
  const [centeredPos, setCenteredPos] = useState(initialIndex);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[initialIndex]?.scrollIntoView({ block: 'center', behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pos = Number((entry.target as HTMLElement).dataset.pos);
            if (!Number.isNaN(pos)) { setCenteredPos(pos); onChange(pos); }
          }
        }
      },
      { root, rootMargin: '-49% 0px -49% 0px', threshold: 0 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <div
      ref={listRef}
      className="gb-scroll"
      style={{ width, height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', padding: `${WHEEL_ITEM_H}px 0` }}
    >
      {items.map((label, pos) => (
        <div
          key={label + pos}
          ref={(el) => { itemRefs.current[pos] = el; }}
          data-pos={pos}
          style={{
            height: WHEEL_ITEM_H, scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: pos === centeredPos ? 'var(--gb-primary-pale)' : 'transparent',
            borderRadius: pos === centeredPos ? 12 : 0,
            fontSize: pos === centeredPos ? 19 : 15.5, fontWeight: pos === centeredPos ? 700 : 500,
            color: pos === centeredPos ? 'var(--gb-ink)' : 'var(--gb-muted-2)',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPM = ['AM', 'PM'];

function TimeWheelSheet({
  initialIso, onConfirm, onClose,
}: {
  initialIso: string;
  onConfirm: (iso: string) => void; onClose: () => void;
}) {
  const wc = useMemo(() => wallClockOf(initialIso), [initialIso]);
  const initialHourPos = (wc.h % 12 === 0 ? 12 : wc.h % 12) - 1;
  const initialMinPos = wc.mnt;
  const initialAmpmPos = wc.h < 12 ? 0 : 1;

  const [hourPos, setHourPos] = useState(initialHourPos);
  const [minPos, setMinPos] = useState(initialMinPos);
  const [ampmPos, setAmpmPos] = useState(initialAmpmPos);

  const hh24 = ((hourPos + 1) % 12) + (ampmPos === 1 ? 12 : 0);
  const targetEpoch = epochOf(wc.y, wc.mo, wc.d, hh24, minPos);
  const minsFromNow = Math.round((targetEpoch - Date.now()) / 60000);

  function handleConfirm() {
    onConfirm(buildUtcSlotIso(wc.y, wc.mo, wc.d, hh24, minPos));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 400, borderRadius: 20, padding: '18px 20px 20px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: 'none', background: 'transparent', color: 'var(--gb-muted)', padding: 6, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            <MS name="close" size={20} />
          </button>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gb-primary)' }}>
            {minsFromNow <= 0 ? 'ASAP' : `In ${minsFromNow} min`}
          </div>
          <button
            onClick={handleConfirm}
            aria-label="Confirm time"
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <MS name="check" size={19} />
          </button>
        </div>

        <div style={{ position: 'relative', height: WHEEL_ITEM_H * 3, marginTop: 10, display: 'flex', justifyContent: 'center', gap: 4 }}>
          <WheelColumn key="h" items={HOURS_12} initialIndex={initialHourPos} onChange={setHourPos} width={70} />
          <WheelColumn key="m" items={MINUTES_60} initialIndex={initialMinPos} onChange={setMinPos} width={70} />
          <WheelColumn key="a" items={AMPM} initialIndex={initialAmpmPos} onChange={setAmpmPos} width={70} />
        </div>
      </div>
    </div>
  );
}

function Veg({ size = 14, veg }: { size?: number; veg?: boolean | null }) {
  if (veg == null) return null;
  const c = veg ? '#3E8E4E' : '#9E2A2B';
  return (
    <span style={{ width: size, height: size, border: `1.5px solid ${c}`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <span style={{ width: size * 0.43, height: size * 0.43, borderRadius: '50%', background: c }} />
    </span>
  );
}

function Stepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  const cell = { width: 30, height: 32, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #E7DCCC', borderRadius: 10, overflow: 'hidden' }}>
      <button style={cell} onClick={() => onChange(qty - 1)}><MS name="remove" size={18} /></button>
      <span style={{ minWidth: 18, textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{qty}</span>
      <button style={cell} onClick={() => onChange(qty + 1)}><MS name="add" size={18} /></button>
    </div>
  );
}

const CONFETTI_COLORS = ['#E08A1E', '#3E8E4E', '#9E2A2B', '#2E6F9E', '#C9A227'];

// Zomato-style "offer unlocked" popup: a burst of falling confetti behind a
// small card. Pure CSS animation, no new dependency - see globals.css's
// gb-confetti-fall/gb-celebrate-in keyframes.
/** One offer's two lines in the rotating cart banner. */
const OFFER_ROW_H = 34;

// The cart's offer banner rotates through every live offer, like the strip on the
// cafe page, instead of pinning the one the cart happens to lead with - two live
// offers were invisible from here otherwise. The action belongs to whichever offer
// is showing; rotation pauses while a finger or cursor is on the card so the button
// can't change under a tap.
function OfferBanner({ rows, appliedId, onChoose, onUnclaim, onOpenPicker }: {
  rows: { offer: GrabbitOffer; discount: number; shortfall: number; unclaimed: boolean }[];
  appliedId: number | undefined;
  onChoose: (offer: GrabbitOffer) => void;
  onUnclaim: () => void;
  onOpenPicker: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const { index, sliding } = useOfferRotation(rows.length, paused);
  if (rows.length === 0) return null;
  const shown = rows[index % rows.length];
  const applied = shown.offer.id === appliedId;
  const isFreeItem = shown.offer.offer_type === 'FREE_ITEM';
  const track = [...rows, rows[0]];

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      style={{ margin: '10px 16px 0', background: 'linear-gradient(135deg, #FFF7ED, #FFEFD5)', border: '1px solid #F3D9A6', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}>
        <MS name={isFreeItem ? 'celebration' : 'local_offer'} size={19} color="var(--gb-primary)" />
      </div>

      <button
        onClick={onOpenPicker}
        style={{ flex: 1, minWidth: 0, height: OFFER_ROW_H, overflow: 'hidden', background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
      >
        <span style={{ display: 'block', transform: `translateY(-${index * OFFER_ROW_H}px)`, transition: sliding ? `transform ${OFFER_SLIDE_MS}ms cubic-bezier(.4,0,.2,1)` : 'none' }}>
          {track.map((r, i) => (
            <span key={`${r.offer.id}-${i}`} style={{ display: 'block', height: OFFER_ROW_H }}>
              <span style={{ display: 'block', height: 16, lineHeight: '16px', fontSize: 12.5, fontWeight: 800, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {offerHeadline(r.offer)}
              </span>
              <span style={{ display: 'block', height: 15, lineHeight: '15px', marginTop: 3, fontSize: 11.5, fontWeight: 600, color: 'var(--gb-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.discount > 0 ? (r.offer.description || offerTerms(r.offer).join(' · ') || r.offer.title) : `Add ${inr(r.shortfall)} more to unlock`}
              </span>
            </span>
          ))}
        </span>
      </button>

      {shown.discount === 0 ? (
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gb-muted-2)', flex: 'none' }}>LOCKED</span>
      ) : applied && isFreeItem && !shown.unclaimed ? (
        <button onClick={onUnclaim} aria-label="Remove free item" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#fff', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '4px 8px 4px 9px', flex: 'none', cursor: 'pointer' }}>
          ADDED<MS name="close" size={13} color="#fff" />
        </button>
      ) : applied && isFreeItem ? (
        <button onClick={() => onChoose(shown.offer)} style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--gb-on-primary)', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '7px 12px', flex: 'none', cursor: 'pointer' }}>Add</button>
      ) : applied ? (
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gb-primary)', flex: 'none' }}>APPLIED</span>
      ) : (
        <button onClick={() => onChoose(shown.offer)} style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--gb-on-primary)', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '7px 12px', flex: 'none', cursor: 'pointer' }}>Apply</button>
      )}
    </div>
  );
}

// Pick-one offer sheet: an order carries a single offer_id, so two live offers on
// the same cafe are a choice, not a stack. Offers the cart doesn't reach yet stay
// listed but disabled, with what it would take to unlock them.
function OfferPicker({ rows, appliedId, onChoose, onClose }: {
  rows: { offer: GrabbitOffer; discount: number; shortfall: number; unclaimed: boolean }[];
  appliedId: number | undefined;
  onChoose: (offer: GrabbitOffer) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--gb-surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: '72vh', overflowY: 'auto', padding: '16px 16px calc(18px + env(safe-area-inset-bottom))' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500, color: 'var(--gb-text)' }}>Offers</div>
            <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>Only one offer can be applied per order.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--gb-line-2)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flex: 'none' }}>
            <MS name="close" size={18} color="var(--gb-ink)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {rows.map(({ offer, discount, shortfall, unclaimed }) => {
            const eligible = discount > 0;
            const applied = offer.id === appliedId;
            return (
              <button
                key={offer.id}
                disabled={!eligible}
                onClick={() => { onChoose(offer); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left', width: '100%',
                  background: '#fff', cursor: eligible ? 'pointer' : 'default', opacity: eligible ? 1 : .55,
                  border: `1px solid ${applied ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`,
                  borderRadius: 14, padding: '12px 13px',
                }}
              >
                <MS
                  name={applied ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={19}
                  color={applied ? 'var(--gb-primary)' : 'var(--gb-muted-2)'}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: 'var(--gb-text)' }}>{offerHeadline(offer)}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{offer.description || offer.title}</span>
                  {offerTerms(offer).length > 0 && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 4 }}>
                      {offerTerms(offer).join(' · ')}
                    </span>
                  )}
                </span>
                <span style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: eligible ? 'var(--gb-primary)' : 'var(--gb-muted-2)', whiteSpace: 'nowrap' }}>
                  {!eligible ? `Add ${inr(shortfall)} more` : unclaimed ? 'Add the free item' : `-${inr(discount)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FreeItemCelebration({ offer, onDismiss }: { offer: GrabbitOffer; onDismiss: () => void }) {
  const pieces = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.5 + Math.random() * 1.1,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  })), []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(20,14,8,0.45)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="gb-confetti-piece"
            style={{
              left: `${p.left}%`,
              width: 8,
              height: 8,
              background: p.color,
              borderRadius: p.round ? '50%' : 2,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="gb-celebrate-card" style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: '28px 24px', width: 'min(320px, 86vw)', textAlign: 'center', boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35)' }}>
        <div style={{ fontSize: 40, lineHeight: 1 }}>🎉</div>
        <div className="gb-serif" style={{ fontSize: 18, fontWeight: 700, marginTop: 10, color: 'var(--gb-text)' }}>Offer unlocked!</div>
        <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 6 }}>
          {offer.free_item_name ?? 'A free item'} worth {inr(offer.free_item_price ?? 0)} added to your cart, free.
        </div>
        <button
          onClick={onDismiss}
          style={{ marginTop: 18, width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', background: 'var(--gb-primary)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  // Retry-from-order does router.replace() onto this page, so the entry behind it
  // is the spent Cashfree checkout. Browser back matches the header back arrow.
  useBackTo(`/${slug}`);
  const { items: heldItems, updateQty, removeItem, total, addItem, setLineNote, cafeSlug: cartCafe } = useCart();
  // A basket held for another cafe is not this cafe's, and must never be priced or
  // ordered under this cafe's id: this page reads it as empty, which is the same
  // screen the customer would get by arriving here with nothing. The menu page
  // applies the same rule, so the only way in is a stale link or a back button.
  const items = cartCafe === null || cartCafe === slug ? heldItems : [];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  /** ASAP is a moving target, not a time: it has to follow the clock once picked. */
  const [asapChosen, setAsapChosen] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingCashfree, setPendingCashfree] = useState<{ data: { order_id: number; payable: number | null; cashfree: { env: string; payment_session_id: string; cashfree_order_id: string } }; orderUrl: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [dineInTable, setDineInTable] = useState<string | null>(null);
  // Delivery: off unless the cafe offers it, and never on a dine-in table.
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [mode, setMode] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState<DraftAddress | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [customTimeIso, setCustomTimeIso] = useState<string | null>(null);
  const customTimeIsoRef = useRef<string | null>(null);
  customTimeIsoRef.current = customTimeIso;
  const slotRef = useRef<HTMLDivElement>(null);
  const [shakeSlot, setShakeSlot] = useState(false);
  // Order placement state (moved here from the deleted /checkout page)
  const submitting = useRef(false);
  // Tracks the menu_item_id of the free-item unit *we* auto-added, so we only
  // ever touch that one unit - never a line the customer added themselves.
  const ownedFreeItemRef = useRef<number | null>(null);
  const [showFreeItemCelebration, setShowFreeItemCelebration] = useState(false);
  // Once per cart: claiming the free item after re-crossing min_order_value (added,
  // removed, added again) should just unlock it quietly - the party-popper is a
  // first-time moment, not something to replay every re-claim in the same cart.
  // A plain ref is enough: it resets on remount, i.e. a fresh cart/page load.
  const hasCelebratedRef = useRef(false);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showCancelledBanner, setShowCancelledBanner] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('cancelled') !== '1') return;
    setShowCancelledBanner(true);
    window.history.replaceState(null, '', window.location.pathname);
    const t = setTimeout(() => setShowCancelledBanner(false), 4000);
    return () => clearTimeout(t);
  }, []);
  // Complete-your-meal recommendations
  const [recs, setRecs] = useState<GrabbitMenuItem[]>([]);
  /** menu_item_id -> minutes the counter needs for one of them, from the menu row. */
  const [prepByItem, setPrepByItem] = useState<Map<number, number>>(new Map());
  /** menu_item_id -> the item's menu category, for the quick notes offered on that line. */
  const [categoryByItem, setCategoryByItem] = useState<Map<number, string>>(new Map());
  const [recCat, setRecCat] = useState<GrabbitMenuCategory | 'all'>('all');
  useEffect(() => {
    setDineInTable(sessionStorage.getItem('grabbit_table'));
    // The address the customer last chose survives a reload, because checkout is
    // open to guests and there is no account to read it back from yet.
    setAddress(getPickedAddress());
    const savedNotes = sessionStorage.getItem('grabbit_notes') ?? '';
    setNotes(savedNotes);
    if (savedNotes) setShowNoteInput(true);
  }, []);
  // The kitchen cannot have the order ready before its slowest item is made, so
  // the picker must not offer a time that is. Times are per item on the menu row
  // (prep_time_minutes); the counter works items in parallel, so the cart is
  // ready when its slowest item is, not when the sum of them would be.
  const DEFAULT_PREP_MINUTES = 10;
  const prepMinutes = prepByItem.size === 0 || items.length === 0
    ? 0
    : Math.max(...items.map(i => prepByItem.get(i.menu_item_id) ?? DEFAULT_PREP_MINUTES));
  // Counted from the top of the current minute, not from this instant: slots start
  // on the minute, so measuring from 10:23:40 put the floor at 10:30:40 and threw
  // away the 10:30 slot that is exactly the seven minutes away we just promised.
  const readyAtMs = new Date().setSeconds(0, 0) + prepMinutes * 60_000;
  // The cafe's slots sit on a grid anchored to its opening time, so the first one
  // at or after the food is ready can be minutes later than the food is ready: a
  // seven minute cart at 1:50 landed on 2:00 and read as a ten minute wait next to
  // a seven minute promise. ASAP is that exact minute instead, which the order API
  // accepts the same way it accepts a custom time off the wheel.
  //
  // Delivery books no slot at all: the same prep time is what the rider waits on,
  // not something the customer picks, so none of this is rendered for it.
  //
  // Only for today's own slots: when the cart has fallen through to tomorrow's
  // list, nothing is ready in seven minutes and offering it would be a lie. And
  // only inside the window the cafe actually generated, so it can never outlive
  // the counter's last slot.
  const gridSlots = (slotsData?.slots ?? []).filter(
    s => new Date(s.slot_start).getTime() >= readyAtMs);
  const asapSlot: GrabbitAvailableSlot | null = (() => {
    const all = slotsData?.slots ?? [];
    if (slotsData?.label || prepMinutes <= 0 || all.length === 0) return null;
    const lastStart = new Date(all[all.length - 1].slot_start).getTime();
    if (readyAtMs > lastStart) return null;
    // The grid already offers this exact minute, so there is nothing to add.
    if (all.some(x => new Date(x.slot_start).getTime() === readyAtMs)) return null;
    const first = all[0];
    const spanMs = Math.max(
      new Date(first.slot_end).getTime() - new Date(first.slot_start).getTime(), 60_000);
    return {
      ...first,
      slot_start: new Date(readyAtMs).toISOString(),
      slot_end: new Date(readyAtMs + spanMs).toISOString(),
    };
  })();
  // Everything downstream reads this rather than slotsData.slots: what the cafe
  // offers, minus what it cannot cook in time, with the exact ready minute first.
  const bookableSlots = asapSlot ? [asapSlot, ...gridSlots] : gridSlots;
  /** The cafe has slots left today, but none of them far enough out for this cart. */
  const tooLateForToday = (slotsData?.slots.length ?? 0) > 0 && bookableSlots.length === 0;

  // A cart edited after the time was picked can outgrow it: adding nachos to a
  // coffee moves the earliest time past the slot already chosen. Drop the choice
  // rather than send the counter a time it cannot hit.
  useEffect(() => {
    if (!selectedSlot) return;
    if (asapChosen) {
      // Every minute that passes moves "as soon as possible" along with it.
      if (asapSlot && selectedSlot !== asapSlot.slot_start) setSelectedSlot(asapSlot.slot_start);
      return;
    }
    if (new Date(selectedSlot).getTime() >= new Date().setSeconds(0, 0) + prepMinutes * 60_000) return;
    setSelectedSlot(null);
    setShowCustomTime(false);
    setCustomTimeIso(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot, prepMinutes, asapChosen, asapSlot?.slot_start]);

  const delivering = mode === 'delivery' && !dineInTable && deliveryEnabled;
  const canProceed = dineInTable
    ? true
    : delivering
      ? !!address && !quoting && quote?.serviceable === true
      : !!selectedSlot;


  // Habit is to jump straight to Pay: instead of a dead disabled button, point at
  // the thing that's missing (scroll + shake + a short haptic).
  function nudgeSlot() {
    slotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    navigator.vibrate?.(60);
    setShakeSlot(false);
    requestAnimationFrame(() => setShakeSlot(true));
    setTimeout(() => setShakeSlot(false), 550);
  }

  // Offers for this cafe, client-side preview only - see discountFor's comment.
  const [offers, setOffers] = useState<GrabbitOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  // Which offer the customer picked, when more than one fits the cart. null = let
  // the best-saving one lead.
  const [chosenOfferId, setChosenOfferId] = useState<number | null>(null);
  const [showOfferPicker, setShowOfferPicker] = useState(false);
  useEffect(() => {
    if (!slug) { setOffersLoading(false); return; }
    let cancelled = false;
    setOffersLoading(true);
    fetch(`/api/proxy/grabit/offers/${slug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => { if (!cancelled) setOffers(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setOffers([]); })
      .finally(() => { if (!cancelled) setOffersLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  // Resolve cafe id (MenuClient caches it), and pull the logged-in customer's
  // name/phone so the order can be created without re-asking.
  useEffect(() => {
    const resolveIds = async () => {
      const cached = sessionStorage.getItem(`grabbit_cafe_id_${slug}`);
      let cid: number | null = cached ? Number(cached) : null;
      // Always read the menu: the cached id says nothing about whether this cafe
      // delivers, and offering delivery it cannot do is the worse failure.
      try {
        const d = await fetch(`/api/proxy/grabit/menu/${slug}`).then(r => (r.ok ? r.json() : null));
        cid = d?.cafe?.id ?? cid;
        if (cid) sessionStorage.setItem(`grabbit_cafe_id_${slug}`, String(cid));
        setDeliveryEnabled(d?.cafe?.delivery_enabled === true);
      } catch { /* ignore */ }
      setCafeId(cid);
    };
    resolveIds();
    fetch('/api/proxy/grabit/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(d => { if (d) { setName(d.name ?? ''); setPhone(d.phone ?? ''); } })
      .catch(() => {});
  }, [slug]);

  // Zomato-style "Complete your meal": same menu, available items not already in
  // the cart, category pills to filter.
  useEffect(() => {
    if (items.length === 0) { setRecs([]); return; }
    let cancelled = false;
    fetch(`/api/proxy/grabit/menu/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || !d?.items) return;
        const menu = d.items as (GrabbitMenuItem & { prep_time_minutes?: number | null })[];
        // Built from the whole menu, not the filtered recommendations below: the
        // items we need prep times for are exactly the ones already in the cart.
        setPrepByItem(new Map(menu
          .filter(i => i.prep_time_minutes != null)
          .map(i => [i.id, i.prep_time_minutes as number])));
        // Read off the live menu rather than off the line: only some of the ways into
        // the cart (the menu grid, the customization sheet) know an item's category,
        // so a coffee added from a reorder, a pairing or the recommendation strip had
        // none and fell back to the food notes. The menu knows for every line, and for
        // lines that were already sitting in a saved cart.
        setCategoryByItem(new Map(menu
          .filter(i => i.category != null)
          .map(i => [i.id, i.category as string])));
        const inCart = new Set(items.map(i => i.menu_item_id));
        setRecs(menu.filter(i => i.is_available && !inCart.has(i.id)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (items.length === 0 || dineInTable) return; // dine-in: no pickup slot

    let cancelled = false;
    async function loadSlots(showLoading: boolean) {
      if (showLoading) setSlotsLoading(true);
      try {
        const todayRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(0)}`);
        if (!todayRes.ok) throw new Error('slots fetch failed');
        const todayData = await todayRes.json() as { slots: GrabbitAvailableSlot[] };
        const fresh = todayData.slots.length > 0
          ? { slots: todayData.slots, label: null as string | null }
          : await (async () => {
              const tomorrowRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(1)}`);
              const tomorrowData = tomorrowRes.ok ? await tomorrowRes.json() as { slots: GrabbitAvailableSlot[] } : { slots: [] };
              return { slots: tomorrowData.slots, label: 'Tomorrow' as string | null };
            })();
        if (cancelled) return;
        setSlotsData(fresh);
        setSelectedSlot((prev) => prev != null && (prev === customTimeIsoRef.current || fresh.slots.some((s) => s.slot_start === prev)) ? prev : null);
      } catch {
        if (!cancelled) setSlotsData({ slots: [], label: null });
      } finally {
        if (!cancelled && showLoading) setSlotsLoading(false);
      }
    }

    loadSlots(true);
    const interval = setInterval(() => loadSlots(false), 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [slug, items.length, dineInTable]);

  const cafeName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Your order';
  const subtotal = total();
  // Preview only, the same way the offer discount above is: order creation re-quotes
  // from the coordinates, so a stale number here can misdisplay but never mischarge.
  const deliveryFee = delivering && quote?.serviceable ? Number(quote.charge ?? 0) : 0;

  // FIRST_ORDER eligibility (has this customer ever ordered here?) is decided
  // server-side: GET /api/grabit/offers already drops a FIRST_ORDER offer unless
  // the caller is a logged-in customer who has never ordered at this cafe.
  const applicableOffers = offers;
  // What the customer actually spent, which is what earns an offer: a giveaway line
  // sitting in the cart never counts toward any min_order_value. For the FREE_ITEM
  // offer that granted it this mirrors OfferService.applyToOrder (dropping real items
  // below the threshold must drop the gift too, not have the gift's own price prop
  // the subtotal back up); for every other offer it keeps claiming a gift from
  // changing what else the cart qualifies for, so switching offers can't bounce the
  // cart between two states. Conservative by a gift's price vs the server, which only
  // nets it out for the offer that granted it - a preview may under-promise, never over.
  const giftLine = items.find((i) => applicableOffers.some(
    (o) => o.offer_type === 'FREE_ITEM' && o.free_item_menu_item_id === i.menu_item_id));
  const earnedSubtotal = subtotal - (giftLine?.price ?? 0);
  // Every live offer, with what it would take off this cart right now. An order
  // carries a single offer_id (the server applies exactly one), so this is a
  // pick-one list, not a stack: the customer chooses, and until they do we lead
  // with the one that saves the most.
  const rankedOffers = applicableOffers
    .map((o) => ({ offer: o, discount: discountFor(o, earnedSubtotal) }))
    .sort((a, b) => b.discount - a.discount);
  const eligibleOffers = rankedOffers.filter((x) => x.discount > 0);
  // What the picker lists: everything the cart already earns, plus the ones it only
  // misses on cart value (those we can tell her how to unlock). Anything else is
  // noise she can't act on.
  const offerRows = rankedOffers
    .filter((x) => x.discount > 0 || x.offer.min_order_value != null)
    .map((x) => ({
      ...x,
      shortfall: Math.max(0, (x.offer.min_order_value ?? 0) - earnedSubtotal),
      // A FREE_ITEM offer only pays out once its item is claimed into the cart, so
      // the row says "add the item" rather than a saving the bill isn't showing.
      unclaimed: x.offer.offer_type === 'FREE_ITEM'
        && !items.some((i) => i.menu_item_id === x.offer.free_item_menu_item_id),
    }));
  // A choice that stops being eligible (cart shrank below its min) falls back to
  // the best one rather than silently applying nothing; it comes back if the cart
  // grows again, since chosenOfferId is left alone.
  const bestOffer = eligibleOffers.find((x) => x.offer.id === chosenOfferId) ?? eligibleOffers[0];
  // Nearest offer the cart just misses, so we can nudge "add ₹X more" instead
  // of saying nothing.
  const nearMissOffer = !bestOffer
    ? applicableOffers
        .filter((o) => o.min_order_value != null && earnedSubtotal < o.min_order_value)
        .sort((a, b) => a.min_order_value! - b.min_order_value!)[0]
    : undefined;

  // A FREE_ITEM discount only nets out once the item is actually claimed into the
  // cart (see claimFreeItem) - it's opt-in now, so "eligible" and "in the cart"
  // are different things. Showing the discount before the item is added
  // undercharges the display relative to what's actually in the cart.
  const freeItemClaimed = bestOffer?.offer.offer_type !== 'FREE_ITEM'
    || items.some(i => i.menu_item_id === bestOffer.offer.free_item_menu_item_id);
  // The only offer this order actually gets: eligibility alone (bestOffer) must
  // never reach the bill or the create-order payload, or an unclaimed FREE_ITEM
  // reads as auto-applied and the server grants it.
  const appliedOffer = bestOffer && freeItemClaimed ? bestOffer : undefined;
  // What the items come to after any offer, before delivery. The server prices the
  // ride from exactly this number (OrderService: delivery is quoted from `payable`),
  // and measures the cafe's minimum against it, so quoting from anything else here
  // would show a customer one answer and charge them another.
  const itemsPayable = Math.max(0, appliedOffer ? subtotal - appliedOffer.discount : subtotal);
  const toPay = itemsPayable + deliveryFee;

  // A returning customer has an address book; the one they marked default is the
  // one they meant. Only consulted when they switch to delivery and have not already
  // chosen an address for this basket, so a guest never triggers a 401 for nothing
  // and nobody's explicit choice is overwritten.
  // A ref, not state, and no cancellation on unmount: React remounts every effect once
  // in development, and a state flag set on the first mount made the second mount skip
  // while the first mount's answer was thrown away as stale, so the address never
  // arrived. Both fetches below are idempotent, so the only guard needed is "once".
  const defaultTried = useRef(false);
  useEffect(() => {
    if (!delivering || address || defaultTried.current) return;
    defaultTried.current = true;
    listAddresses().then((rows) => {
      if (rows.length === 0) return;
      const preferred = rows.find((r) => r.is_default) ?? rows[0];
      const { id, label, line1, line2, landmark, formatted_address, latitude, longitude } = preferred;
      const picked = { id, label, line1, line2, landmark, formatted_address, latitude, longitude };
      setPickedAddress(picked);
      setAddress(picked);
    });
  }, [delivering, address]);

  // The mirror case: an address chosen before logging in lives only in this browser,
  // and the customer is sent to log in from this very screen. Adopt it into the book
  // once there is an account to hang it on, or their first address is the one address
  // that never appears in their address book. A guest gets null back and nothing else
  // happens, so this stays a no-op until they sign in.
  const adoptTried = useRef(false);
  useEffect(() => {
    if (!delivering || !address || address.id || adoptTried.current) return;
    adoptTried.current = true;
    saveAddress(address).then((saved) => {
      if (!saved) return;
      const owned = { ...address, id: saved.id };
      setPickedAddress(owned);
      setAddress(owned);
    });
  }, [delivering, address]);

  // A cafe can turn delivery off, or move its slabs, between the address being saved
  // and this basket being paid. Re-quote rather than trusting what was shown before.
  //
  // The basket's value is part of the question, not just the address: a cafe with a
  // minimum refuses the same address until the cart clears it. Debounced, because
  // this re-runs on every quantity tap.
  useEffect(() => {
    if (!delivering || !address || !cafeId) { setQuote(null); setQuoting(false); return; }
    let live = true;
    // Drop the previous answer before asking again. It was priced for a different
    // basket or a different address, and leaving it up meant the bill showed a
    // delivery charge, and Place Order stayed live, against a quote the server was
    // about to refuse: drop one item below the cafe's minimum and the old ₹30 stood
    // for a third of a second with the button still enabled.
    setQuote(null);
    setQuoting(true);
    const timer = setTimeout(() => {
      quoteDelivery(cafeId, address.latitude, address.longitude, itemsPayable)
        .then((q) => { if (live) setQuote(q); })
        .finally(() => { if (live) setQuoting(false); });
    }, 350);
    return () => { live = false; clearTimeout(timer); };
  }, [delivering, address, cafeId, itemsPayable]);

  // The customer claims the FREE_ITEM giveaway with an explicit tap (see claimFreeItem
  // below) rather than it being auto-added - not everyone wants the free item, and
  // silently dropping one into the cart surprised people. ownedFreeItemRef tracks the
  // one unit *we* added on their behalf, so a line the customer already had is never
  // touched, and we only ever remove the unit we ourselves added.
  useEffect(() => {
    const freeOffer = bestOffer?.offer.offer_type === 'FREE_ITEM' ? bestOffer.offer : null;
    const targetId = freeOffer?.free_item_menu_item_id ?? null;

    if (ownedFreeItemRef.current != null && ownedFreeItemRef.current !== targetId) {
      const owned = ownedFreeItemRef.current;
      const line = items.find(i => i.menu_item_id === owned);
      if (line) {
        const key = cartLineKey(line);
        if (line.quantity <= 1) removeItem(key); else updateQty(key, line.quantity - 1);
      }
      ownedFreeItemRef.current = null;
    }
  }, [bestOffer, items, removeItem, updateQty]);

  function claimFreeItem(offer: GrabbitOffer) {
    const freeOffer = offer.offer_type === 'FREE_ITEM' ? offer : null;
    const targetId = freeOffer?.free_item_menu_item_id ?? null;
    if (targetId == null || items.some(i => i.menu_item_id === targetId)) return;
    addItem({
      menu_item_id: targetId,
      name: freeOffer!.free_item_name ?? 'Free item',
      price: freeOffer!.free_item_price ?? 0,
      quantity: 1,
      image_url: null,
      addons: [],
    }, slug);
    ownedFreeItemRef.current = targetId;
    if (!hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      setShowFreeItemCelebration(true);
    }
  }

  // Picking an offer is a single action: it becomes the applied offer, and a giveaway
  // it grants goes into the cart, since a FREE_ITEM offer pays out nothing until its
  // item is there. Both the banner's Add and the picker's row land here - the picker
  // used to only set the choice, so tapping the free-item row it was already leading
  // with looked dead.
  function chooseOffer(offer: GrabbitOffer) {
    setChosenOfferId(offer.id);
    if (offer.offer_type === 'FREE_ITEM') claimFreeItem(offer);
  }

  // Lets the customer decline the free item after claiming it - only ever touches
  // the one unit we ourselves added (ownedFreeItemRef), same invariant as the
  // ineligibility auto-remove above.
  function removeFreeItem() {
    const owned = ownedFreeItemRef.current;
    if (owned == null) return;
    const line = items.find(i => i.menu_item_id === owned);
    if (line) {
      const key = cartLineKey(line);
      if (line.quantity <= 1) removeItem(key); else updateQty(key, line.quantity - 1);
    }
    ownedFreeItemRef.current = null;
  }

  // Recommendations filtered by pill + already-in-cart (in case one was just added)
  const recCats = Array.from(new Set(recs.map(r => r.category)));
  const activeRecCat = recCat !== 'all' && recCats.includes(recCat) ? recCat : 'all';
  const inCartIds = new Set(items.map(i => i.menu_item_id));
  const availableRecs = recs.filter(r => !inCartIds.has(r.id));
  // "Popular" (activeRecCat==='all') interleaves categories round-robin so it
  // reads distinct from single-category pills instead of just showing the
  // same leading items as whichever category the API returns first.
  const shownRecs = activeRecCat === 'all'
    ? interleaveByCategory(availableRecs)
    : availableRecs.filter(r => r.category === activeRecCat);

  async function placeOrder() {
    if (!canProceed) {
      // Nothing to shake at when the address itself is missing: open the picker.
      if (delivering && !address) { setAddressSheetOpen(true); return; }
      nudgeSlot();
      return;
    }
    setCheckingAuth(true);
    setError('');
    // Fresh check right before proceeding - the cafe could have gone offline
    // any time between opening the menu and tapping this button.
    const accepting = await fetch(`/api/proxy/grabit/cafes/${slug}/status`)
      .then((r) => (r.ok ? r.json() : { acceptingOrders: true }))
      .then((d) => d.acceptingOrders !== false)
      .catch(() => true); // fail open, same as the server-side check
    if (!accepting) { setCheckingAuth(false); setShowOfflineModal(true); return; }
    if (dineInTable || delivering) {
      sessionStorage.removeItem('grabbit_slot');
      sessionStorage.removeItem('grabbit_slot_asap');
    } else {
      sessionStorage.setItem('grabbit_slot', selectedSlot!);
      const isAsap = !slotsData?.label && bookableSlots[0]?.slot_start === selectedSlot;
      if (isAsap) sessionStorage.setItem('grabbit_slot_asap', '1');
      else sessionStorage.removeItem('grabbit_slot_asap');
    }
    sessionStorage.setItem('grabbit_notes', notes.trim());
    // Use THIS fetch's body (not the mount-time snapshot) for name/phone - the
    // mount fetch can still be in flight when the user taps Place Order, and the
    // backend requires customer_phone, so a stale empty value would 400.
    const me = await fetch('/api/proxy/grabit/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    setCheckingAuth(false);
    if (!me) { setShowLoginPrompt(true); return; }
    setName(me.name ?? '');
    setPhone(me.phone ?? '');
    await createOrder();
  }

  // Loads and launches the Cashfree SDK for an already-created order. Split out
  // of createOrder so the price-mismatch confirmation below can call it after
  // the customer explicitly agrees to the server-corrected total.
  async function launchCashfreeCheckout(data: { order_id: number; cashfree: { env: string; payment_session_id: string; cashfree_order_id: string } }, orderUrl: string) {
    await new Promise<void>((resolve, reject) => {
      if (document.getElementById('cashfree-sdk')) { resolve(); return; }
      const script = document.createElement('script');
      script.id = 'cashfree-sdk';
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
      document.head.appendChild(script);
    });
    // redirectTarget: '_self' (not '_modal') - the UPI app-intent (PayTM/PhonePe)
    // has to launch from a top-level page. A full-page redirect to Cashfree's
    // hosted checkout doesn't have the iframe app-intent problem.
    // @ts-ignore
    const result = await Cashfree({ mode: data.cashfree.env === 'production' ? 'production' : 'sandbox' })
      .checkout({
        paymentSessionId: data.cashfree.payment_session_id,
        returnUrl: `${window.location.origin}${orderUrl}`,
        redirectTarget: '_self',
      });
    // result.error here is a pre-navigation SDK/network failure (the browser never
    // left this page). Actual payment success/failure is decided server-side.
    if (result?.error) {
      Sentry.captureMessage('cashfree_checkout_error', {
        level: 'warning',
        tags: { feature: 'checkout', order_id: String(data.order_id), cashfree_order_id: data.cashfree.cashfree_order_id },
        extra: { error: result.error },
      });
      setError('Payment was not completed. Please try again.');
    }
  }

  // Order creation + payment (moved from the deleted /checkout page).
  // dropOffer: pass null to force a full-price retry after the server rejects
  // the offer this render's bestOffer picked (claimed by someone else, cap
  // hit, window closed since the customer opened the cart).
  async function createOrder(dropOffer?: null) {
    if (!cafeId) { setError('Could not load the café. Please try again.'); return; }
    if (submitting.current) return;
    submitting.current = true;
    setPlacing(true);
    setError('');
    const offerIdToSend = dropOffer === null ? undefined : appliedOffer?.offer.id;
    try {
      const res = await fetch('/api/proxy/grabit/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim() || undefined,
          customer_phone: phone,
          cafe_id: cafeId,
          ...(dineInTable
            ? { order_type: 'dine_in', table_number: Number(dineInTable) }
            : delivering && address
              ? {
                  order_type: 'delivery',
                  // No charge in here on purpose: the server re-quotes it from these
                  // coordinates, so there is nothing for a tampered client to set.
                  delivery: {
                    address_id: address.id ?? null,
                    line1: address.line1,
                    line2: address.line2 ?? null,
                    landmark: address.landmark ?? null,
                    formatted_address: address.formatted_address ?? null,
                    latitude: address.latitude,
                    longitude: address.longitude,
                  },
                }
              : { pickup_slot: selectedSlot }),
          ...(notes ? { notes } : {}),
          payment_method: 'online' as const,
          offer_id: offerIdToSend,
          items: items.map(i => ({
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            addon_ids: (i.addons ?? []).map(a => a.id),
            ...(i.variation ? { variation_id: i.variation.id } : {}),
            ...((i.options ?? []).length ? { option_ids: i.options!.map(o => o.id) } : {}),
            ...(i.notes ? { notes: i.notes } : {}),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Stale cart: an item was deactivated/removed on the cafe's menu since it
        // was added. Drop it and let the customer retry instead of a dead-end error.
        if (data.code === 'ITEMS_UNAVAILABLE' && Array.isArray(data.invalid_item_ids)) {
          const staleNames = [...new Set(items
            .filter(i => data.invalid_item_ids.includes(i.menu_item_id))
            .map(i => i.name))];
          items
            .filter(i => data.invalid_item_ids.includes(i.menu_item_id))
            .forEach(i => removeItem(cartLineKey(i)));
          const who = staleNames.length ? staleNames.join(', ') : 'One or more items';
          const plural = staleNames.length !== 1;
          setError(`${who} ${plural ? 'are' : 'is'} no longer available and ${plural ? 'were' : 'was'} removed from your cart. Please review and try again.`);
          return;
        }
        if (data.code === 'CAFE_OFFLINE') {
          setShowOfflineModal(true);
          return;
        }
        // The offer stopped being valid between preview and submit. Retry once
        // at full price instead of dead-ending checkout on an offer the
        // customer didn't cause the problem with.
        if ((data.code === 'OFFER_INVALID' || data.code === 'OFFER_MIN_ORDER') && offerIdToSend != null) {
          submitting.current = false;
          setPlacing(false);
          await createOrder(null);
          return;
        }
        throw new Error(data.error || 'Failed');
      }

      const token = data.access_token as string;
      const orderUrl = `/${slug}/order/${data.order_id}?t=${token}`;

      // Online: Cashfree order creation is non-fatal server-side (the order is
      // already placed) - a null session here means the online-payment step itself
      // is down, not that the whole order failed.
      if (!data.cashfree) {
        throw new Error('Online payment is temporarily unavailable. Please try again in a moment.');
      }

      // Server independently re-derives the discount from offer_id - if it
      // silently granted less than this render's preview showed (offer
      // dropped above, or eligibility changed underneath), don't launch
      // payment on a total the customer never agreed to.
      const serverPayable = data.payable != null ? Number(data.payable) : subtotal;
      if (Math.abs(serverPayable - toPay) > 0.5) {
        setPendingCashfree({ data, orderUrl });
        return;
      }

      await launchCashfreeCheckout(data, orderUrl);
      // result.redirect: true - the browser is navigating to Cashfree's hosted page.
      // The order page (return_url) picks up from here and clears the cart itself.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setPlacing(false);
      submitting.current = false;
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        <div style={{ background: '#fff', padding: 'calc(14px + env(safe-area-inset-top)) 18px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
          <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={22} color="var(--gb-ink)" /></button>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500 }}>Your order</div>
        </div>
        <div style={{ padding: '48px 32px 70px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* The cup carries the empty state instead of a bag glyph. Falls back to
              the old icon wherever WebGL isn't available. */}
          <div style={{ width: 180, height: 180, marginBottom: -8 }}>
            <GrabbitCup3D
              variant="spot"
              interactive={false}
              fallback={
                <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '44px auto' }}>
                  <MS name="shopping_bag" size={42} color="var(--gb-primary)" />
                </div>
              }
            />
          </div>
          <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500 }}>Your cart is empty</div>
          <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, maxWidth: 240 }}>Add a few things from the menu and pick a pickup slot.</div>
          <Link href={`/${slug}`} style={{ background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', borderRadius: 14, padding: '13px 22px', fontSize: 15, fontWeight: 800 }}>Browse the menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gb-cart-root gb-wide-lg" style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 170 }}>
      {showOfferPicker && (
        <OfferPicker
          rows={offerRows}
          appliedId={bestOffer?.offer.id}
          onChoose={chooseOffer}
          onClose={() => setShowOfferPicker(false)}
        />
      )}

      {showFreeItemCelebration && bestOffer?.offer.offer_type === 'FREE_ITEM' && (
        <FreeItemCelebration offer={bestOffer.offer} onDismiss={() => setShowFreeItemCelebration(false)} />
      )}

      {/* header */}
      <div style={{ background: '#fff', padding: 'calc(11px + env(safe-area-inset-top)) 16px 12px', borderBottom: '1px solid var(--gb-line)' }}>
        {/* The bar stays full-bleed; what is written on it lines up with the columns
            below, so the back arrow isn't stranded in the far corner of a wide screen. */}
        <div className="gb-cart-head" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={19} color="var(--gb-ink)" /></button>
          <div>
            <div className="gb-serif" style={{ fontSize: 17.5, fontWeight: 500, lineHeight: 1 }}>{cafeName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{items.length} item{items.length > 1 ? 's' : ''} · {dineInTable ? 'Dine-in' : delivering ? 'Delivery' : 'Pickup'}</div>
          </div>
        </div>
      </div>

      {/* Below the header the page is two columns on a laptop: the order on the left,
          what it costs and the button parked on the right. One column on a phone. */}
      <div className="gb-cart-cols">
      <div>

      {showCancelledBanner && (
        <div style={{ margin: '10px 16px 0', background: '#FDECEA', color: 'var(--gb-danger)', fontSize: 13, fontWeight: 700, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="cancel" size={17} color="var(--gb-danger)" />Transaction cancelled
        </div>
      )}

      {!offersLoading && offerRows.length > 0 && (
        <OfferBanner
          rows={offerRows}
          appliedId={bestOffer?.offer.id}
          onChoose={chooseOffer}
          onUnclaim={removeFreeItem}
          onOpenPicker={() => setShowOfferPicker(true)}
        />
      )}

      {/* items */}
      <div style={{ padding: '4px 16px 2px' }}>
        {items.map(item => {
          // Options are priced like add-ons; item.price is already the chosen variation's.
          const addonsSum = (item.addons ?? []).reduce((s, a) => s + a.price, 0)
            + (item.options ?? []).reduce((s, o) => s + o.price, 0);
          const lineKey = cartLineKey(item);
          // The one unit of a FREE_ITEM giveaway we auto-added - system-controlled like
          // Zomato/Swiggy's free items, so no stepper: it comes and goes with the offer.
          const isFreeGift = bestOffer?.offer.offer_type === 'FREE_ITEM'
            && item.menu_item_id === bestOffer.offer.free_item_menu_item_id;
          return (
            <div key={lineKey} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--gb-line)' }}>
              <Veg veg={item.is_veg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)' }}>
                  {item.name}{item.variation ? ` · ${item.variation.name}` : ''}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isFreeGift ? (
                    <>
                      <span style={{ textDecoration: 'line-through' }}>{inr(item.price)}</span>
                      <span style={{ color: 'var(--gb-primary)', fontWeight: 800 }}>FREE</span>
                    </>
                  ) : (
                    inr(item.price)
                  )}
                </div>
                {(() => {
                  const extras = [...(item.options ?? []), ...(item.addons ?? [])].map(e => e.name);
                  return extras.length > 0 ? (
                    <div style={{ fontSize: 11, color: 'var(--gb-muted-2)', marginTop: 3 }}>
                      + {extras.join(', ')}
                    </div>
                  ) : null;
                })()}
                {/* Per-dish instruction. The free item is the offer's, not hers to change. */}
                {!isFreeGift && (
                  <LineNote
                    note={item.notes}
                    dish={item.name}
                    category={categoryByItem.get(item.menu_item_id) ?? item.category}
                    onChange={(note) => setLineNote(lineKey, note)}
                  />
                )}
              </div>
              {isFreeGift ? (
                <button
                  onClick={removeFreeItem}
                  aria-label="Remove free item"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#fff', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '4px 8px 4px 9px', flex: 'none', cursor: 'pointer' }}
                >
                  ADDED<MS name="close" size={13} color="#fff" />
                </button>
              ) : (
                <Stepper qty={item.quantity} onChange={(v) => updateQty(lineKey, v)} />
              )}
              <div style={{ minWidth: 52, textAlign: 'right', fontSize: 13.5, fontWeight: 800, color: 'var(--gb-text)' }}>
                {isFreeGift ? (
                  <span style={{ textDecoration: 'line-through', color: 'var(--gb-muted-2)' }}>{inr((item.price + addonsSum) * item.quantity)}</span>
                ) : (
                  inr((item.price + addonsSum) * item.quantity)
                )}
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Link href={`/${slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, border: '1px solid var(--gb-line-3)', borderRadius: 11, padding: '9px 10px', color: 'var(--gb-primary)', fontSize: 12.5, fontWeight: 700 }}>
            <MS name="add" size={16} />Add more items
          </Link>
          <button
            onClick={() => setShowNoteInput((v) => !v)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, border: '1px solid var(--gb-line-3)', borderRadius: 11, padding: '9px 10px', background: '#fff', color: 'var(--gb-text)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            <MS name="edit_note" size={16} />{notes ? 'Edit note' : 'Add a note'}
          </button>
        </div>
        {showNoteInput && (
          <textarea
            autoFocus
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            rows={2}
            placeholder="Less sugar, no ice, extra spicy…"
            style={{ width: '100%', marginTop: 8, border: '1px solid #EEE4D6', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--gb-sans)', fontWeight: 500, color: 'var(--gb-text)', background: 'var(--gb-surface)', outline: 'none', resize: 'none' }}
          />
        )}
      </div>

      {/* pickup or delivery: only shown when this cafe actually delivers */}
      {!dineInTable && deliveryEnabled && (
        <div style={{ margin: '14px 16px 0', display: 'flex', gap: 3, background: 'var(--gb-surface)', border: '1px solid var(--gb-line-2)', borderRadius: 13, padding: 3 }}>
          {(['pickup', 'delivery'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                // Choosing delivery with nothing to deliver to is a dead end: ask straight away.
                if (m === 'delivery' && !address) setAddressSheetOpen(true);
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--gb-text)' : '#8A7C6C',
                boxShadow: mode === m ? '0 1px 4px rgba(15,23,42,.15)' : 'none',
                fontSize: 13, fontWeight: 800,
              }}
            >
              <MS name={m === 'pickup' ? 'storefront' : 'delivery_dining'} size={17} />
              {m === 'pickup' ? 'Pickup' : 'Delivery'}
            </button>
          ))}
        </div>
      )}

      {dineInTable ? (
        /* dine-in: table service, no pickup slot */
        <div style={{ margin: '22px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(15,23,42,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MS name="restaurant" size={20} fill color="var(--gb-primary)" />
            <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500 }}>Dine-in · Table {dineInTable}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 25 }}>We&apos;ll bring your order to the table.</div>
        </div>
      ) : delivering ? (
      /* delivery: an address instead of a slot. Delivery is as soon as it is ready. */
      <div ref={slotRef} className={shakeSlot ? 'gb-shake' : undefined} style={{ margin: '22px 16px 0', background: '#fff', border: `1px solid ${shakeSlot ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(15,23,42,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="delivery_dining" size={20} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, flex: 1 }}>Delivery address</div>
          {address && (
            <button
              onClick={() => setAddressSheetOpen(true)}
              style={{ flex: 'none', border: '1.5px solid #EEE4D6', background: '#fff', color: '#5A4E42', fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 10, cursor: 'pointer' }}
            >
              Change
            </button>
          )}
        </div>

        {!address ? (
          <button
            onClick={() => setAddressSheetOpen(true)}
            style={{ marginTop: 11, width: '100%', display: 'flex', alignItems: 'center', gap: 9, border: '1.5px dashed var(--gb-primary)', background: 'var(--gb-primary-pale)', borderRadius: 13, padding: '12px 13px', cursor: 'pointer', color: 'var(--gb-primary)', fontSize: 13.5, fontWeight: 800 }}
          >
            <MS name="add_location_alt" size={19} />Add your delivery address
          </button>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <MS name={address.label === 'Work' ? 'work' : address.label === 'Home' ? 'home' : 'location_on'} size={17} color="var(--gb-primary)" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--gb-text)' }}>{address.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 2, fontWeight: 600, lineHeight: 1.45 }}>
                  {shortAddress(address)}{address.landmark ? ` · ${address.landmark}` : ''}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 9, fontSize: 12, fontWeight: 700 }}>
              {quoting && <span style={{ color: 'var(--gb-muted)' }}>Checking delivery…</span>}
              {!quoting && quote?.serviceable && (
                <span style={{ color: 'var(--gb-green)' }}>
                  {quote.charge ? `₹${quote.charge} delivery` : 'Free delivery'}{quote.distance_km ? ` · ${quote.distance_km} km` : ''} · we start as soon as it is ready
                </span>
              )}
              {!quoting && quote && !quote.serviceable && (
                <span style={{ color: '#C2410C' }}>{unserviceableReason(quote, itemsPayable)}</span>
              )}
              {!quoting && quote === null && (
                <span style={{ color: 'var(--gb-muted)' }}>Could not check delivery for this address just now.</span>
              )}
            </div>
          </div>
        )}
      </div>
      ) : (
      /* pickup slot */
      <div ref={slotRef} className={shakeSlot ? 'gb-shake' : undefined} style={{ margin: '22px 16px 0', background: '#fff', border: `1px solid ${shakeSlot ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(15,23,42,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="schedule" size={20} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, flex: 1 }}>Pickup time</div>
          {bookableSlots.length > 0 && (
            showCustomTime ? (
              <button
                onClick={() => setPickerOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', border: '1.5px solid var(--gb-primary)', background: 'var(--gb-primary-pale)', color: 'var(--gb-primary)', fontSize: 12.5, fontWeight: 700, padding: '6px 11px', borderRadius: 10, cursor: 'pointer' }}
              >
                {fmtWallClock(customTimeIso ?? bookableSlots[0].slot_start)}
                <MS name="schedule" size={15} />
              </button>
            ) : (
              <button
                onClick={() => setPickerOpen(true)}
                style={{ flex: 'none', border: '1.5px solid #EEE4D6', background: '#fff', color: '#5A4E42', fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 10, cursor: 'pointer' }}
              >
                Custom +
              </button>
            )
          )}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 25 }}>
          It&apos;ll be fresh &amp; waiting, no waiting in line{slotsData?.label ? ` · ${slotsData.label}` : ''}
        </div>
        {/* Why the earliest time moves between carts: it is this cart's own cooking
            time, not a fixed number, so a chai and a plate of nachos differ. */}
        {prepMinutes > 0 && bookableSlots.length > 0 && (
          <div style={{ fontSize: 11.5, color: 'var(--gb-primary)', fontWeight: 700, marginTop: 6, marginLeft: 25 }}>
            {slotsData?.label
              // A cart that outlived the counter closing is looking at tomorrow's
              // times, where "seven minutes from now" is not a thing that can happen.
              ? `About ${prepMinutes} min to make, counted from when the counter opens.`
              : `Earliest is about ${prepMinutes} min: what this cart takes to make. It shifts with what you order.`}
          </div>
        )}
        {slotsLoading && <p style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 10 }}>Loading slots…</p>}
        {!slotsLoading && slotsData?.slots.length === 0 && <p style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 10 }}>No slots available. Try again tomorrow.</p>}
        {!slotsLoading && tooLateForToday && (
          <p style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 10, fontWeight: 600 }}>
            This cart needs about {prepMinutes} min and the counter closes before that. Try a smaller order, or tomorrow.
          </p>
        )}
        <div className="gb-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 11 }}>
          {bookableSlots.map((slot, idx) => {
            const full = slot.available_count === 0;
            const sel = selectedSlot === slot.slot_start;
            const time = new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const asap = !slotsData?.label && idx === 0;
            return (
              <button
                key={slot.slot_start}
                disabled={full}
                onClick={() => { setSelectedSlot(slot.slot_start); setAsapChosen(asap); setShowCustomTime(false); setCustomTimeIso(null); }}
                style={{
                  flex: 'none', border: `1.5px solid ${sel ? 'var(--gb-primary)' : full ? 'var(--gb-line-4)' : '#EEE4D6'}`,
                  background: sel ? 'var(--gb-primary-pale)' : '#fff', color: sel ? 'var(--gb-primary)' : full ? 'var(--gb-muted-2)' : '#5A4E42',
                  fontSize: 12, fontWeight: 700, padding: '9px 13px', borderRadius: 11, textAlign: 'center', lineHeight: 1.1,
                  cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.6 : 1,
                }}
              >
                {asap
                  ? <>ASAP<span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, opacity: 0.75, marginTop: 2 }}>{full ? 'Full' : time}</span></>
                  : full ? `${time} · Full` : time}
              </button>
            );
          })}
        </div>
      </div>
      )}
      {addressSheetOpen && (
        <AddressSheet
          cafeId={cafeId}
          cartValue={itemsPayable}
          onPicked={(a) => setAddress(a)}
          onClose={() => setAddressSheetOpen(false)}
        />
      )}

      {pickerOpen && bookableSlots.length > 0 && (
        <TimeWheelSheet
          initialIso={customTimeIso ?? bookableSlots[nearestAvailableSlotIndexToNow(bookableSlots)].slot_start}
          onConfirm={(iso) => {
            // A wheel can be spun to any time, including one before the food exists.
            // Clamp rather than reject: the customer asked for "as early as possible".
            const clamped = Math.max(new Date(iso).getTime(), readyAtMs);
            const chosen = new Date(clamped).toISOString();
            setCustomTimeIso(chosen);
            setSelectedSlot(chosen);
            setAsapChosen(false);
            setShowCustomTime(true);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* complete your meal — recommendations */}
      {recs.length > 0 && (
        <div style={{ margin: '12px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, padding: '14px 0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--gb-primary-pale)', display: 'grid', placeItems: 'center', flex: 'none' }}>
              <MS name="grid_view" size={15} color="var(--gb-primary)" />
            </div>
            <span className="gb-serif" style={{ fontSize: 14.5, fontWeight: 500 }}>Complete your meal with</span>
          </div>
          {recCats.length > 1 && (
            <div style={{ margin: '0 14px 10px', display: 'flex', gap: 2, background: 'var(--gb-surface)', borderRadius: 11, padding: 3, overflowX: 'auto' }} className="gb-scroll">
              <button onClick={() => setRecCat('all')} style={{ flex: 'none', padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, border: 'none', background: activeRecCat === 'all' ? '#fff' : 'transparent', color: activeRecCat === 'all' ? 'var(--gb-text)' : '#8A7C6C', boxShadow: activeRecCat === 'all' ? '0 1px 4px rgba(15,23,42,.15)' : 'none', cursor: 'pointer' }}>Popular</button>
              {recCats.map(c => (
                <button key={c} onClick={() => setRecCat(c)} style={{ flex: 'none', padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, border: 'none', background: activeRecCat === c ? '#fff' : 'transparent', color: activeRecCat === c ? 'var(--gb-text)' : '#8A7C6C', boxShadow: activeRecCat === c ? '0 1px 4px rgba(15,23,42,.15)' : 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{c}</button>
              ))}
            </div>
          )}
          <div className="gb-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 14px 2px' }}>
            {shownRecs.map(r => (
              <div key={r.id} style={{ flex: 'none', width: 116, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 15, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 84 }}>
                  <Image src={menuImageSrc(r.image_url)} alt={r.name} fill sizes="116px" style={{ objectFit: 'cover' }} />
                  {r.is_bestseller && (
                    <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(30,22,14,.72)', backdropFilter: 'blur(3px)', color: '#FFD27A', fontSize: 8.5, fontWeight: 800, padding: '3px 6px 3px 5px', borderRadius: 999, letterSpacing: 0.3 }}>
                      <MS name="local_fire_department" size={10} fill color="#FFD27A" />
                      BESTSELLER
                    </div>
                  )}
                  <button
                    onClick={() => addItem({ menu_item_id: r.id, name: r.name, price: r.price, quantity: 1, image_url: r.image_url, is_veg: r.is_veg }, slug)}
                    aria-label={`Add ${r.name}`}
                    style={{ position: 'absolute', right: 6, bottom: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}
                  >
                    <MS name="add" size={15} />
                  </button>
                </div>
                <div style={{ padding: '7px 9px 9px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--gb-text)', marginTop: 3 }}>{inr(r.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>

      <aside className="gb-cart-aside">
      {/* bill */}
      <div style={{ margin: '12px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6E6155', fontWeight: 600, padding: '4px 0' }}><span>Item total</span><span>{inr(subtotal)}</span></div>
        {!dineInTable && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6E6155', fontWeight: 600, padding: '4px 0' }}><span>Platform fee</span><span style={{ color: 'var(--gb-green)', fontWeight: 700 }}>FREE</span></div>}
        {delivering && quote?.serviceable && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6E6155', fontWeight: 600, padding: '4px 0' }}>
            <span>Delivery{quote.distance_km ? ` · ${quote.distance_km} km` : ''}</span>
            <span>{deliveryFee > 0 ? inr(deliveryFee) : <span style={{ color: 'var(--gb-green)', fontWeight: 700 }}>FREE</span>}</span>
          </div>
        )}
        {offersLoading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, padding: '4px 0' }}><span>Checking for offers…</span></div>
        )}
        {appliedOffer && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--gb-primary)', fontWeight: 700, padding: '4px 0' }}>
            <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appliedOffer.offer.title}</span>
            <span style={{ flex: 'none' }}>-{inr(appliedOffer.discount)}</span>
          </div>
        )}
        {!offersLoading && offerRows.length > 1 && (
          <button
            onClick={() => setShowOfferPicker(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#6E6155' }}>
              <MS name="local_offer" size={15} color="var(--gb-primary)" />
              {eligibleOffers.length > 1 ? `${eligibleOffers.length} offers apply to this cart` : 'More offers at this cafe'}
            </span>
            <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 12.5, fontWeight: 800, color: 'var(--gb-primary)' }}>
              {appliedOffer ? 'Change' : 'View'}<MS name="chevron_right" size={16} color="var(--gb-primary)" />
            </span>
          </button>
        )}
        {!offersLoading && !bestOffer && nearMissOffer && (
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, padding: '4px 0' }}>
            Add {inr(nearMissOffer.min_order_value! - earnedSubtotal)} more to unlock {nearMissOffer.description || nearMissOffer.title}
          </div>
        )}
        <div style={{ height: 1, background: 'var(--gb-line)', margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}><span>To pay</span><span>{inr(toPay)}</span></div>
      </div>

      {error && (
        <div style={{ margin: '14px 16px 0', color: 'var(--gb-danger)', fontSize: 13.5, fontWeight: 600, padding: '12px 14px', background: '#FDECEA', borderRadius: 14 }}>{error}</div>
      )}

      {/* online-only disclaimer */}
      <p style={{ fontSize: 12, color: 'var(--gb-muted)', fontWeight: 500, margin: '12px 20px 0', lineHeight: 1.5, textAlign: 'center' }}>
        Paid orders go straight to the cafe and can&apos;t be cancelled. Check your items and{' '}
        {delivering ? 'delivery address' : dineInTable ? 'table' : 'pickup slot'} first.{' '}
        <a href="/refunds" style={{ color: 'var(--gb-muted)', textDecoration: 'underline' }}>Refund policy</a>
      </p>

      {/* Zomato-style payment footer: static PAY USING label + Place Order.
          Method selection isn't ours to make - Cashfree's own checkout() page
          shows the real picker (UPI/card/wallet/netbanking) after this. */}
      <div className="gb-paybar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', background: '#fff', borderTop: '1px solid #EEE4D6', padding: '12px 14px calc(18px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 24px -16px rgba(15,23,42,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, padding: '2px 2px 2px 4px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--gb-muted-2)' }}>PAY USING</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>UPI</span>
          </div>
          <button
            disabled={placing || checkingAuth}
            onClick={placeOrder}
            style={{
              flex: 1.4, border: 'none', borderRadius: 15, padding: '10px 16px', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              boxShadow: '0 12px 24px -10px rgba(0,85,212,.6)', cursor: placing || checkingAuth ? 'not-allowed' : 'pointer', opacity: placing || checkingAuth ? 0.65 : 1,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.02em' }}>{inr(toPay)} TOTAL</span>
            <span style={{ fontSize: 15, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {placing ? 'Placing…' : checkingAuth ? 'Checking…' : canProceed ? 'Place Order' : delivering ? (address ? 'Check address' : 'Add address') : 'Pick a slot'}<MS name="arrow_forward" size={18} />
            </span>
          </button>
        </div>
      </div>

      </aside>
      </div>

      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <MS name="lock" size={26} color="var(--gb-primary)" />
            </div>
            <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 14 }}>Log in to continue</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              Your order&apos;s saved, log in to place it.
            </div>
            <Link
              href={`/login?next=${encodeURIComponent(`/${slug}/cart`)}`}
              style={{ display: 'block', marginTop: 18, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 800 }}
            >
              Log in
            </Link>
            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', padding: 8 }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {showOfflineModal && (
        <div
          onClick={() => setShowOfflineModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FDECEA', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <MS name="storefront" size={26} color="var(--gb-danger)" />
            </div>
            <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 14 }}>Cafe is offline</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              This cafe isn&apos;t accepting orders right now. Please check back shortly.
            </div>
            <button
              onClick={() => setShowOfflineModal(false)}
              style={{ display: 'block', width: '100%', marginTop: 18, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', border: 'none', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Order is already placed - this only confirms the server-corrected
          total before launching payment, it never offers to cancel. */}
      {pendingCashfree && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gb-primary-pale)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <MS name="info" size={26} color="var(--gb-primary)" />
            </div>
            <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 14 }}>Total has changed</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              Your order is placed, but the discount shown didn&apos;t apply. You&apos;ll pay {inr(Number(pendingCashfree.data.payable ?? 0))} instead of {inr(toPay)}.
            </div>
            <button
              onClick={() => {
                const p = pendingCashfree;
                setPendingCashfree(null);
                if (p) launchCashfreeCheckout(p.data, p.orderUrl);
              }}
              style={{ display: 'block', width: '100%', marginTop: 18, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', border: 'none', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
            >
              Continue to pay {inr(Number(pendingCashfree.data.payable ?? 0))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
