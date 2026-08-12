'use client';
/**
 * Cart = checkout, Zomato-style: one screen from items to payment. Pick your
 * pickup slot (or dine-in table), review items, add more / add a note, grab a
 * recommendation or two, pick a payment method, and Place Order — which either
 * launches Cashfree (online) straight from this screen. No separate review
 * page; the order page after payment is the tracking screen.
 */
import { useState, useEffect, useRef } from 'react';
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

// Custom time is a stepper over the same server-computed slots, not a raw
// date picker - so it can never land on a full slot or outside pickup hours,
// and matches the app's own controls instead of the OS's native time UI.
function TimeStepper({ slots, index, onChange }: { slots: GrabbitAvailableSlot[]; index: number; onChange: (i: number) => void }) {
  const step = (dir: 1 | -1) => {
    let next = index + dir;
    while (next >= 0 && next < slots.length && slots[next].available_count === 0) next += dir;
    if (next >= 0 && next < slots.length) onChange(next);
  };
  const time = new Date(slots[index].slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const cell = { width: 40, height: 40, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', flex: 'none' } as const;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1.5px solid #EEE4D6', borderRadius: 14, overflow: 'hidden' }}>
      <button style={cell} disabled={index === 0} onClick={() => step(-1)}><MS name="remove" size={20} /></button>
      <span className="gb-serif" style={{ minWidth: 92, textAlign: 'center', fontSize: 17, fontWeight: 600, color: 'var(--gb-text)' }}>{time}</span>
      <button style={cell} disabled={index === slots.length - 1} onClick={() => step(1)}><MS name="add" size={20} /></button>
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

// Payment methods (Zomato-style PAY USING sheet). UPI apps / card / netbanking
// all map to the backend's 'online' rail (Cashfree renders the actual gateway
// options). Pay-at-counter was removed from the consumer flow.
const PAY_METHODS = [
  { id: 'phonepe', label: 'PhonePe UPI', icon: 'smartphone', color: '#7C3AED', kind: 'online' as const },
  { id: 'gpay', label: 'Google Pay', icon: 'smartphone', color: '#4285F4', kind: 'online' as const },
  { id: 'paytm', label: 'Paytm UPI', icon: 'smartphone', color: '#00A9E0', kind: 'online' as const },
  { id: 'bhim', label: 'BHIM UPI', icon: 'smartphone', color: '#FF7E1D', kind: 'online' as const },
  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card', color: '#6B5D50', kind: 'online' as const },
  { id: 'netbanking', label: 'Net Banking', icon: 'account_balance', color: '#6B5D50', kind: 'online' as const },
] as const;
type PayMethodId = typeof PAY_METHODS[number]['id'];

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, updateQty, removeItem, total, addItem } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [dineInTable, setDineInTable] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customIndex, setCustomIndex] = useState(0);
  const slotRef = useRef<HTMLDivElement>(null);
  const [shakeSlot, setShakeSlot] = useState(false);
  // Order placement state (moved here from the deleted /checkout page)
  const submitting = useRef(false);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Payment method selection
  const [payMethod, setPayMethod] = useState<PayMethodId>('phonepe');
  const [showPaySheet, setShowPaySheet] = useState(false);
  // Complete-your-meal recommendations
  const [recs, setRecs] = useState<GrabbitMenuItem[]>([]);
  const [recCat, setRecCat] = useState<GrabbitMenuCategory | 'all'>('all');
  useEffect(() => {
    setDineInTable(sessionStorage.getItem('grabbit_table'));
    setNotes(sessionStorage.getItem('grabbit_notes') ?? '');
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
  const toPay = subtotal;
  const payLabel = PAY_METHODS.find(m => m.id === payMethod)!.label;

  // Recommendations filtered by pill + already-in-cart (in case one was just added)
  const recCats = Array.from(new Set(recs.map(r => r.category)));
  const activeRecCat = recCat !== 'all' && recCats.includes(recCat) ? recCat : 'all';
  const inCartIds = new Set(items.map(i => i.menu_item_id));
  const shownRecs = recs.filter(r => !inCartIds.has(r.id) && (activeRecCat === 'all' || r.category === activeRecCat));

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

  // Order creation + payment (moved from the deleted /checkout page).
  async function createOrder() {
    if (!cafeId) { setError('Could not load the café. Please try again.'); return; }
    if (submitting.current) return;
    submitting.current = true;
    setPlacing(true);
    setError('');
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
        return;
      }
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
      {/* header */}
      <div style={{ background: '#fff', padding: 'calc(14px + env(safe-area-inset-top)) 18px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
        <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={22} color="var(--gb-ink)" /></button>
        <div>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1 }}>{cafeName}</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{items.length} item{items.length > 1 ? 's' : ''} · {dineInTable ? 'Dine-in' : 'Pickup'}</div>
        </div>
      </div>

      {/* items */}
      <div style={{ padding: '8px 18px 4px' }}>
        {items.map(item => {
          const addonsSum = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
          const lineKey = cartLineKey(item);
          return (
            <div key={lineKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--gb-line)' }}>
              <Veg veg={item.is_veg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{inr(item.price)}</div>
                {item.addons && item.addons.length > 0 && (
                  <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', marginTop: 3 }}>
                    + {item.addons.map(a => a.name).join(', ')}
                  </div>
                )}
              </div>
              <Stepper qty={item.quantity} onChange={(v) => updateQty(lineKey, v)} />
              <div style={{ minWidth: 56, textAlign: 'right', fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr((item.price + addonsSum) * item.quantity)}</div>
            </div>
          );
        })}
        <Link href={`/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14, color: 'var(--gb-primary)', fontSize: 13.5, fontWeight: 700 }}>
          <MS name="add" size={18} />Add more items
        </Link>
      </div>

      {dineInTable ? (
        /* dine-in: table service, no pickup slot */
        <div style={{ margin: '22px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MS name="restaurant" size={20} fill color="var(--gb-primary)" />
            <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500 }}>Dine-in · Table {dineInTable}</div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 28 }}>We&apos;ll bring your order to the table.</div>
        </div>
      ) : (
      /* pickup slot */
      <div ref={slotRef} className={shakeSlot ? 'gb-shake' : undefined} style={{ margin: '22px 16px 0', background: '#fff', border: `1px solid ${shakeSlot ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="schedule" size={20} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, flex: 1 }}>Pickup time</div>
          {slotsData && slotsData.slots.length > 0 && (
            <button
              onClick={() => setShowCustomTime((v) => !v)}
              style={{
                flex: 'none', border: `1.5px solid ${showCustomTime ? 'var(--gb-primary)' : '#EEE4D6'}`,
                background: showCustomTime ? 'var(--gb-primary-pale)' : '#fff', color: showCustomTime ? 'var(--gb-primary)' : '#5A4E42',
                fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 11, cursor: 'pointer',
              }}
            >
              Custom +
            </button>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 28 }}>
          It&apos;ll be fresh &amp; waiting, no waiting in line{slotsData?.label ? ` · ${slotsData.label}` : ''}
        </div>
        {slotsLoading && <p style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 12 }}>Loading slots…</p>}
        {!slotsLoading && slotsData?.slots.length === 0 && <p style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 12 }}>No slots available. Try again tomorrow.</p>}
        <div className="gb-scroll" style={{ display: 'flex', gap: 9, overflowX: 'auto', marginTop: 14 }}>
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
                  fontSize: 13, fontWeight: 700, padding: '11px 16px', borderRadius: 13, textAlign: 'center', lineHeight: 1.1,
                  cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.6 : 1,
                }}
              >
                {full ? `${label} · Full` : label}
              </button>
            );
          })}
        </div>
        {showCustomTime && slotsData && slotsData.slots.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <TimeStepper
              slots={slotsData.slots}
              index={customIndex}
              onChange={(i) => { setCustomIndex(i); setSelectedSlot(slotsData.slots[i].slot_start); }}
            />
            <span style={{ fontSize: 12, color: 'var(--gb-muted)' }}>Step through 5-min pickup times</span>
          </div>
        )}
      </div>
      )}

      {/* add a note for the restaurant (Zomato-style) */}
      <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="edit_note" size={20} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500 }}>Add a note for the cafe</div>
          <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: 'var(--gb-muted-2)' }}>Optional</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 200))}
          rows={2}
          placeholder="Less sugar, no ice, extra spicy…"
          style={{ width: '100%', marginTop: 12, border: '1px solid #EEE4D6', borderRadius: 13, padding: '11px 13px', fontSize: 14, fontFamily: 'var(--gb-sans)', fontWeight: 500, color: 'var(--gb-text)', background: 'var(--gb-surface)', outline: 'none', resize: 'none' }}
        />
        <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 4 }}>
          The cafe will try its best. {notes.length}/200
        </div>
      </div>

      {/* complete your meal — recommendations */}
      {recs.length > 0 && (
        <div style={{ padding: '18px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span className="gb-serif" style={{ fontSize: 16, fontWeight: 500 }}>Complete your meal with</span>
          </div>
          {recCats.length > 1 && (
            <div className="gb-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 10px' }}>
              <button onClick={() => setRecCat('all')} style={{ flex: 'none', padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${activeRecCat === 'all' ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`, background: activeRecCat === 'all' ? 'var(--gb-ink)' : '#fff', color: activeRecCat === 'all' ? '#fff' : '#5A4E42', cursor: 'pointer' }}>Popular</button>
              {recCats.map(c => (
                <button key={c} onClick={() => setRecCat(c)} style={{ flex: 'none', padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${activeRecCat === c ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`, background: activeRecCat === c ? 'var(--gb-ink)' : '#fff', color: activeRecCat === c ? '#fff' : '#5A4E42', cursor: 'pointer', textTransform: 'capitalize' }}>{c}</button>
              ))}
            </div>
          )}
          <div className="gb-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }}>
            {shownRecs.map(r => (
              <div key={r.id} style={{ flex: 'none', width: 132, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 96 }}>
                  <Image src={r.image_url || ph('photo-1541167760496-1628856ab772')} alt={r.name} fill sizes="132px" style={{ objectFit: 'cover' }} />
                  <button
                    onClick={() => addItem({ menu_item_id: r.id, name: r.name, price: r.price, quantity: 1, image_url: r.image_url, is_veg: r.is_veg }, slug)}
                    aria-label={`Add ${r.name}`}
                    style={{ position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}
                  >
                    <MS name="add" size={17} />
                  </button>
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gb-text)', marginTop: 4 }}>{inr(r.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* bill */}
      <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#6E6155', fontWeight: 600, padding: '5px 0' }}><span>Item total</span><span>{inr(subtotal)}</span></div>
        {!dineInTable && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#6E6155', fontWeight: 600, padding: '5px 0' }}><span>Pickup fee</span><span style={{ color: 'var(--gb-green)', fontWeight: 700 }}>FREE</span></div>}
        <div style={{ height: 1, background: 'var(--gb-line)', margin: '9px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--gb-text)' }}><span>To pay</span><span>{inr(toPay)}</span></div>
      </div>

      {error && (
        <div style={{ margin: '14px 16px 0', color: 'var(--gb-danger)', fontSize: 13.5, fontWeight: 600, padding: '12px 14px', background: '#FDECEA', borderRadius: 14 }}>{error}</div>
      )}

      {/* online-only disclaimer */}
      <p style={{ fontSize: 12, color: 'var(--gb-muted)', fontWeight: 500, margin: '12px 20px 0', lineHeight: 1.5, textAlign: 'center' }}>
        Paid orders go straight to the cafe and can&apos;t be cancelled. Check your items and pickup
        slot first. <a href="/refunds" style={{ color: 'var(--gb-muted)', textDecoration: 'underline' }}>Refund policy</a>
      </p>

      {/* Zomato-style payment footer: PAY USING ▾ + Place Order */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', background: '#fff', borderTop: '1px solid #EEE4D6', padding: '12px 14px calc(18px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 24px -16px rgba(60,40,25,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
          <button
            onClick={() => setShowPaySheet(true)}
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: '2px 2px 2px 4px' }}
            aria-label="Choose payment method"
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--gb-muted-2)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              PAY USING<MS name="arrow_drop_down" size={16} color="var(--gb-muted-2)" />
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{payLabel}</span>
          </button>
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

      {/* PAY USING sheet */}
      {showPaySheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowPaySheet(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '18px 20px calc(20px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 480, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)', marginBottom: 4 }}>Payment options</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginBottom: 12 }}>Choose how you&apos;d like to pay for this order</div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-faint)', margin: '10px 2px 4px' }}>Pay online</div>
            {PAY_METHODS.map(m => {
              const active = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => { setPayMethod(m.id); setShowPaySheet(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 6px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--gb-line)' }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: `${m.color}18`, color: m.color, display: 'grid', placeItems: 'center', flex: 'none' }}>
                    <MS name={m.icon} size={19} fill color={m.color} />
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 14.5, fontWeight: active ? 800 : 600, color: 'var(--gb-text)' }}>{m.label}</span>
                  {active && <MS name="check_circle" size={20} fill color="var(--gb-primary)" />}
                </button>
              );
            })}


          </div>
        </div>
      )}

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
    </div>
  );
}
