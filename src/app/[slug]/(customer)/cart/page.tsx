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
import { inr } from '@/components/gb/format';
import { ph } from '@/components/gb/data';

interface SlotsData { slots: GrabbitAvailableSlot[]; label: string | null; }

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

interface GrabbitOffer {
  id: number;
  title: string;
  description: string | null;
  offer_type: 'PERCENT' | 'FLAT' | 'FIRST_ORDER' | 'FREE_ITEM';
  percent_off: number | null;
  flat_off: number | null;
  max_discount: number | null;
  min_order_value: number | null;
  free_item_menu_item_id: number | null;
  free_item_name: string | null;
  free_item_price: number | null;
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

const pad2 = (n: number) => String(n).padStart(2, '0');

// Nearest available slot to a picked wall-clock time, since the native time
// picker's step doesn't know which slots are sold out.
function nearestAvailableSlotIndex(slots: GrabbitAvailableSlot[], hh: number, mm: number): number {
  const targetMinutes = hh * 60 + mm;
  let bestIdx = -1;
  let bestDiff = Infinity;
  slots.forEach((s, i) => {
    if (s.available_count === 0) return;
    const d = new Date(s.slot_start);
    const diff = Math.abs(d.getHours() * 60 + d.getMinutes() - targetMinutes);
    if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
  });
  return bestIdx;
}

// Native <input type="time"> so mobile browsers render their own scroll-wheel
// time picker (matches the OS alarm-picker feel) instead of a hand-rolled
// +/- stepper that clipped off-screen in a narrow card.
function TimeStepper({ slots, index, onChange }: { slots: GrabbitAvailableSlot[]; index: number; onChange: (i: number) => void }) {
  const current = new Date(slots[index].slot_start);
  const first = new Date(slots[0].slot_start);
  const last = new Date(slots[slots.length - 1].slot_start);
  const toHHMM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hh, mm] = e.target.value.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;
    const idx = nearestAvailableSlotIndex(slots, hh, mm);
    if (idx >= 0) onChange(idx);
  }

  return (
    <input
      type="time"
      step={300}
      min={toHHMM(first)}
      max={toHHMM(last)}
      value={toHHMM(current)}
      onChange={handleChange}
      className="gb-serif"
      style={{
        background: '#fff', border: '1.5px solid #EEE4D6', borderRadius: 14,
        padding: '9px 12px', fontSize: 17, fontWeight: 600, color: 'var(--gb-text)',
        width: 132, flex: 'none',
      }}
    />
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
  const { items, updateQty, removeItem, total, addItem } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingCashfree, setPendingCashfree] = useState<{ data: { order_id: number; payable: number | null; cashfree: { env: string; payment_session_id: string; cashfree_order_id: string } }; orderUrl: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [dineInTable, setDineInTable] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [customIndex, setCustomIndex] = useState(0);
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
  const [recCat, setRecCat] = useState<GrabbitMenuCategory | 'all'>('all');
  useEffect(() => {
    setDineInTable(sessionStorage.getItem('grabbit_table'));
    const savedNotes = sessionStorage.getItem('grabbit_notes') ?? '';
    setNotes(savedNotes);
    if (savedNotes) setShowNoteInput(true);
  }, []);
  const canProceed = dineInTable ? true : !!selectedSlot;

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
      if (!cid) {
        try {
          const d = await fetch(`/api/proxy/grabit/menu/${slug}`).then(r => (r.ok ? r.json() : null));
          cid = d?.cafe?.id ?? null;
          if (cid) sessionStorage.setItem(`grabbit_cafe_id_${slug}`, String(cid));
        } catch { /* ignore */ }
      }
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
        const inCart = new Set(items.map(i => i.menu_item_id));
        setRecs((d.items as GrabbitMenuItem[]).filter(i => i.is_available && !inCart.has(i.id)));
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
        setSelectedSlot((prev) => prev != null && fresh.slots.some((s) => s.slot_start === prev) ? prev : null);
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

  // FIRST_ORDER offers depend on eligibility (has this customer ever ordered
  // here?) that only the server knows - never auto-apply one here, since a
  // discount the checkout silently declines is worse than showing none.
  const applicableOffers = offers.filter((o) => o.offer_type !== 'FIRST_ORDER');
  // A FREE_ITEM offer's own granted item is a line in `subtotal` too, so it must
  // never count toward earning itself: mirrors the server-side fix in
  // OfferService.applyToOrder (eligibilitySubtotal) - dropping real items below
  // min_order_value must drop the free item too, not have the free item's own
  // price prop the subtotal back above the line.
  function eligibilitySubtotal(offer: GrabbitOffer): number {
    if (offer.offer_type !== 'FREE_ITEM') return subtotal;
    const freeLine = items.find(i => i.menu_item_id === offer.free_item_menu_item_id);
    return freeLine ? subtotal - freeLine.price : subtotal;
  }
  const bestOffer = applicableOffers
    .map((o) => ({ offer: o, discount: discountFor(o, eligibilitySubtotal(o)) }))
    .filter((x) => x.discount > 0)
    .sort((a, b) => b.discount - a.discount)[0];
  // Nearest offer the cart just misses, so we can nudge "add ₹X more" instead
  // of saying nothing.
  const nearMissOffer = !bestOffer
    ? applicableOffers
        .filter((o) => o.min_order_value != null && eligibilitySubtotal(o) < o.min_order_value)
        .sort((a, b) => a.min_order_value! - b.min_order_value!)[0]
    : undefined;

  // A FREE_ITEM discount only nets out once the item is actually claimed into the
  // cart (see claimFreeItem) - it's opt-in now, so "eligible" and "in the cart"
  // are different things. Showing the discount before the item is added
  // undercharges the display relative to what's actually in the cart.
  const freeItemClaimed = bestOffer?.offer.offer_type !== 'FREE_ITEM'
    || items.some(i => i.menu_item_id === bestOffer.offer.free_item_menu_item_id);
  const toPay = Math.max(0, bestOffer && freeItemClaimed ? subtotal - bestOffer.discount : subtotal);

  // The customer claims the FREE_ITEM giveaway with an explicit tap (see claimFreeItem
  // below) rather than it being auto-added - not everyone wants the free item, and
  // silently dropping one into the cart surprised people. ownedFreeItemRef tracks the
  // one unit *we* added on their behalf, so a line the customer already had is never
  // touched, and we only ever remove the unit we ourselves added.
  useEffect(() => {
    const freeOffer = bestOffer?.offer.offer_type === 'FREE_ITEM' ? bestOffer.offer : null;
    const targetId = freeOffer?.free_item_menu_item_id ?? null;

    if (targetId == null && ownedFreeItemRef.current != null) {
      const owned = ownedFreeItemRef.current;
      const line = items.find(i => i.menu_item_id === owned);
      if (line) {
        const key = cartLineKey(line);
        if (line.quantity <= 1) removeItem(key); else updateQty(key, line.quantity - 1);
      }
      ownedFreeItemRef.current = null;
    }
  }, [bestOffer, items, removeItem, updateQty]);

  function claimFreeItem() {
    const freeOffer = bestOffer?.offer.offer_type === 'FREE_ITEM' ? bestOffer.offer : null;
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
    if (!canProceed) { nudgeSlot(); return; }
    setCheckingAuth(true);
    setError('');
    // Fresh check right before proceeding - the cafe could have gone offline
    // any time between opening the menu and tapping this button.
    const accepting = await fetch(`/api/proxy/grabit/cafes/${slug}/status`)
      .then((r) => (r.ok ? r.json() : { acceptingOrders: true }))
      .then((d) => d.acceptingOrders !== false)
      .catch(() => true); // fail open, same as the server-side check
    if (!accepting) { setCheckingAuth(false); setShowOfflineModal(true); return; }
    if (dineInTable) {
      sessionStorage.removeItem('grabbit_slot');
      sessionStorage.removeItem('grabbit_slot_asap');
    } else {
      sessionStorage.setItem('grabbit_slot', selectedSlot!);
      const isAsap = !slotsData?.label && slotsData?.slots[0]?.slot_start === selectedSlot;
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
    const offerIdToSend = dropOffer === null ? undefined : bestOffer?.offer.id;
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
            : { pickup_slot: selectedSlot }),
          ...(notes ? { notes } : {}),
          payment_method: 'online' as const,
          offer_id: offerIdToSend,
          items: items.map(i => ({
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            addon_ids: (i.addons ?? []).map(a => a.id),
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
        <div style={{ padding: '70px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center' }}><MS name="shopping_bag" size={42} color="var(--gb-primary)" /></div>
          <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500 }}>Your cart is empty</div>
          <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, maxWidth: 240 }}>Add a few things from the menu and pick a pickup slot.</div>
          <Link href={`/${slug}`} style={{ background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', borderRadius: 14, padding: '13px 22px', fontSize: 15, fontWeight: 800 }}>Browse the menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 170 }}>
      {showFreeItemCelebration && bestOffer?.offer.offer_type === 'FREE_ITEM' && (
        <FreeItemCelebration offer={bestOffer.offer} onDismiss={() => setShowFreeItemCelebration(false)} />
      )}

      {/* header */}
      <div style={{ background: '#fff', padding: 'calc(11px + env(safe-area-inset-top)) 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gb-line)' }}>
        <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={19} color="var(--gb-ink)" /></button>
        <div>
          <div className="gb-serif" style={{ fontSize: 17.5, fontWeight: 500, lineHeight: 1 }}>{cafeName}</div>
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{items.length} item{items.length > 1 ? 's' : ''} · {dineInTable ? 'Dine-in' : 'Pickup'}</div>
        </div>
      </div>

      {showCancelledBanner && (
        <div style={{ margin: '10px 16px 0', background: '#FDECEA', color: 'var(--gb-danger)', fontSize: 13, fontWeight: 700, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="cancel" size={17} color="var(--gb-danger)" />Transaction cancelled
        </div>
      )}

      {bestOffer?.offer.offer_type === 'FREE_ITEM' && (
        <div style={{ margin: '10px 16px 0', background: 'linear-gradient(135deg, #FFF7ED, #FFEFD5)', border: '1px solid #F3D9A6', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <MS name="celebration" size={19} color="var(--gb-primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--gb-text)' }}>Special offer for you</div>
            <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 1 }}>
              Free {bestOffer.offer.free_item_name ?? 'item'} worth {inr(bestOffer.offer.free_item_price ?? 0)}
            </div>
          </div>
          {items.some(i => i.menu_item_id === bestOffer.offer.free_item_menu_item_id) ? (
            <button
              onClick={removeFreeItem}
              aria-label="Remove free item"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#fff', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '4px 8px 4px 9px', flex: 'none', cursor: 'pointer' }}
            >
              ADDED<MS name="close" size={13} color="#fff" />
            </button>
          ) : (
            <button onClick={claimFreeItem} style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--gb-on-primary)', background: 'var(--gb-primary)', border: 'none', borderRadius: 8, padding: '7px 12px', flex: 'none', cursor: 'pointer' }}>Add</button>
          )}
        </div>
      )}

      {/* items */}
      <div style={{ padding: '4px 16px 2px' }}>
        {items.map(item => {
          const addonsSum = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
          const lineKey = cartLineKey(item);
          // The one unit of a FREE_ITEM giveaway we auto-added - system-controlled like
          // Zomato/Swiggy's free items, so no stepper: it comes and goes with the offer.
          const isFreeGift = bestOffer?.offer.offer_type === 'FREE_ITEM'
            && item.menu_item_id === bestOffer.offer.free_item_menu_item_id;
          return (
            <div key={lineKey} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--gb-line)' }}>
              <Veg veg={item.is_veg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</div>
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
                {item.addons && item.addons.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--gb-muted-2)', marginTop: 3 }}>
                    + {item.addons.map(a => a.name).join(', ')}
                  </div>
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

      {dineInTable ? (
        /* dine-in: table service, no pickup slot */
        <div style={{ margin: '14px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, padding: 14, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <MS name="restaurant" size={18} fill color="var(--gb-primary)" />
            <div className="gb-serif" style={{ fontSize: 15.5, fontWeight: 500 }}>Dine-in · Table {dineInTable}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 25 }}>We&apos;ll bring your order to the table.</div>
        </div>
      ) : (
      /* pickup slot */
      <div ref={slotRef} className={shakeSlot ? 'gb-shake' : undefined} style={{ margin: '14px 16px 0', background: '#fff', border: `1px solid ${shakeSlot ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 16, padding: 14, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <MS name="schedule" size={18} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 15.5, fontWeight: 500, flex: 1 }}>Pickup time</div>
          {slotsData && slotsData.slots.length > 0 && (
            <button
              onClick={() => setShowCustomTime((v) => !v)}
              style={{
                flex: 'none', border: `1.5px solid ${showCustomTime ? 'var(--gb-primary)' : '#EEE4D6'}`,
                background: showCustomTime ? 'var(--gb-primary-pale)' : '#fff', color: showCustomTime ? 'var(--gb-primary)' : '#5A4E42',
                fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 10, cursor: 'pointer',
              }}
            >
              Custom +
            </button>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 25 }}>
          It&apos;ll be fresh &amp; waiting, no waiting in line{slotsData?.label ? ` · ${slotsData.label}` : ''}
        </div>
        {slotsLoading && <p style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 10 }}>Loading slots…</p>}
        {!slotsLoading && slotsData?.slots.length === 0 && <p style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 10 }}>No slots available. Try again tomorrow.</p>}
        <div className="gb-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 11 }}>
          {slotsData?.slots.map((slot, idx) => {
            const full = slot.available_count === 0;
            const sel = selectedSlot === slot.slot_start;
            const time = new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const label = !slotsData?.label && idx === 0 ? 'ASAP' : time;
            return (
              <button
                key={slot.slot_start}
                disabled={full}
                onClick={() => setSelectedSlot(slot.slot_start)}
                style={{
                  flex: 'none', border: `1.5px solid ${sel ? 'var(--gb-primary)' : full ? 'var(--gb-line-4)' : '#EEE4D6'}`,
                  background: sel ? 'var(--gb-primary-pale)' : '#fff', color: sel ? 'var(--gb-primary)' : full ? 'var(--gb-muted-2)' : '#5A4E42',
                  fontSize: 12, fontWeight: 700, padding: '9px 13px', borderRadius: 11, textAlign: 'center', lineHeight: 1.1,
                  cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.6 : 1,
                }}
              >
                {full ? `${label} · Full` : label}
              </button>
            );
          })}
        </div>
        {showCustomTime && slotsData && slotsData.slots.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <TimeStepper
              slots={slotsData.slots}
              index={customIndex}
              onChange={(i) => { setCustomIndex(i); setSelectedSlot(slotsData.slots[i].slot_start); }}
            />
            <span style={{ fontSize: 12, color: 'var(--gb-muted)', minWidth: 0 }}>Pick any 5-min pickup time</span>
          </div>
        )}
      </div>
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
              <button onClick={() => setRecCat('all')} style={{ flex: 'none', padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, border: 'none', background: activeRecCat === 'all' ? '#fff' : 'transparent', color: activeRecCat === 'all' ? 'var(--gb-text)' : '#8A7C6C', boxShadow: activeRecCat === 'all' ? '0 1px 4px rgba(60,40,25,.15)' : 'none', cursor: 'pointer' }}>Popular</button>
              {recCats.map(c => (
                <button key={c} onClick={() => setRecCat(c)} style={{ flex: 'none', padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, border: 'none', background: activeRecCat === c ? '#fff' : 'transparent', color: activeRecCat === c ? 'var(--gb-text)' : '#8A7C6C', boxShadow: activeRecCat === c ? '0 1px 4px rgba(60,40,25,.15)' : 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{c}</button>
              ))}
            </div>
          )}
          <div className="gb-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 14px 2px' }}>
            {shownRecs.map(r => (
              <div key={r.id} style={{ flex: 'none', width: 116, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 15, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 84 }}>
                  <Image src={r.image_url || ph('photo-1541167760496-1628856ab772')} alt={r.name} fill sizes="116px" style={{ objectFit: 'cover' }} />
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

      {/* bill */}
      <div style={{ margin: '12px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6E6155', fontWeight: 600, padding: '4px 0' }}><span>Item total</span><span>{inr(subtotal)}</span></div>
        {!dineInTable && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6E6155', fontWeight: 600, padding: '4px 0' }}><span>Platform fee</span><span style={{ color: 'var(--gb-green)', fontWeight: 700 }}>FREE</span></div>}
        {offersLoading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, padding: '4px 0' }}><span>Checking for offers…</span></div>
        )}
        {bestOffer && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--gb-primary)', fontWeight: 700, padding: '4px 0' }}>
            <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bestOffer.offer.title}</span>
            <span style={{ flex: 'none' }}>-{inr(bestOffer.discount)}</span>
          </div>
        )}
        {!offersLoading && !bestOffer && nearMissOffer && (
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted)', fontWeight: 600, padding: '4px 0' }}>
            Add {inr(nearMissOffer.min_order_value! - eligibilitySubtotal(nearMissOffer))} more to unlock {nearMissOffer.description || nearMissOffer.title}
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
        Paid orders go straight to the cafe and can&apos;t be cancelled. Check your items and pickup
        slot first. <a href="/refunds" style={{ color: 'var(--gb-muted)', textDecoration: 'underline' }}>Refund policy</a>
      </p>

      {/* Zomato-style payment footer: static PAY USING label + Place Order.
          Method selection isn't ours to make - Cashfree's own checkout() page
          shows the real picker (UPI/card/wallet/netbanking) after this. */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', background: '#fff', borderTop: '1px solid #EEE4D6', padding: '12px 14px calc(18px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 24px -16px rgba(60,40,25,.4)' }}>
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
              boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: placing || checkingAuth ? 'not-allowed' : 'pointer', opacity: placing || checkingAuth ? 0.65 : 1,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.02em' }}>{inr(toPay)} TOTAL</span>
            <span style={{ fontSize: 15, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {placing ? 'Placing…' : checkingAuth ? 'Checking…' : canProceed ? 'Place Order' : 'Pick a slot'}<MS name="arrow_forward" size={18} />
            </span>
          </button>
        </div>
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
