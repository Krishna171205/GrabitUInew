'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { MS } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  // React state (`loading`) updates asynchronously, so the disabled= guard on the
  // buttons doesn't stop a second event firing in the same tick - and it did: a
  // single tap created 3 separate orders (order_id 12 confirmed live) and raced 3
  // Cashfree checkout() calls, which is what broke the page after payment. A ref
  // is synchronous and closes that window completely.
  const submitting = useRef(false);
  const [pickupSlot, setPickupSlot] = useState<string | null>(null);
  const [dineInTable, setDineInTable] = useState<string | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerLoaded, setCustomerLoaded] = useState(false);
  const phoneValid = /^\d{10}$/.test(phone);
  const detailsValid = name.trim().length > 0 && phoneValid;

  // Dine-in (table QR) needs no slot; pickup requires one, else back to cart.
  useEffect(() => {
    const table = sessionStorage.getItem('grabit_table');
    const slot = sessionStorage.getItem('grabit_slot');
    if (!table && !slot) {
      router.push(`/${slug}/cart`);
      return;
    }
    setDineInTable(table);
    setPickupSlot(slot);
  }, [slug, router]);

  // cart's placeOrder() already gates every checkout on a live session (via the
  // same auth/me check), so name+phone are always known by the time we land here -
  // re-collecting them would just re-ask for what login already captured. Prefill
  // from the session; a 401 here means the session expired mid-flow, so bounce back
  // through login rather than falling back to a guest form.
  useEffect(() => {
    fetch('/api/proxy/grabit/auth/me')
      .then(res => {
        if (res.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/${slug}/checkout`)}`);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setCustomerLoaded(true);
      })
      .catch(() => setCustomerLoaded(true));
  }, [slug, router]);

  // Fetch cafe_id, read sessionStorage first (set by menu/home page on first load)
  useEffect(() => {
    const resolveIds = async () => {
      const cached = sessionStorage.getItem(`grabit_cafe_id_${slug}`);
      let cid: number | null = cached ? Number(cached) : null;
      if (!cid) {
        try {
          const d = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`).then(r => r.json());
          cid = d.cafe?.id ?? null;
          if (cid) sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(cid));
        } catch { /* ignore */ }
      }
      setCafeId(cid);
    };
    resolveIds();
  }, [slug]);

  async function handleOrder(paymentMethod: 'online' | 'counter') {
    if ((!pickupSlot && !dineInTable) || !cafeId || !detailsValid) return;
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone,
          cafe_id: cafeId,
          ...(dineInTable
            ? { order_type: 'dine_in', table_number: Number(dineInTable) }
            : { pickup_slot: pickupSlot }),
          payment_method: paymentMethod,
          items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const token = data.access_token as string;
      const orderUrl = `/${slug}/order/${data.order_id}?t=${token}`;

      if (paymentMethod === 'counter') {
        clearCart();
        sessionStorage.removeItem('grabit_slot');
        sessionStorage.removeItem('grabit_table');
        router.push(orderUrl);
      } else {
        // Cashfree order creation is non-fatal server-side (the order is already
        // placed) - a null session here means the online-payment step itself is
        // down, not that the whole order failed. Send the customer to pay at
        // counter instead of crashing on a null payment_session_id.
        if (!data.cashfree) {
          throw new Error('Online payment is temporarily unavailable. Please choose "Pay at counter" instead.');
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
        // @ts-ignore
        Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox' })
          .checkout({
            paymentSessionId: data.cashfree.payment_session_id,
            returnUrl: `${window.location.origin}${orderUrl}`,
          });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  }

  const header = (
    <div style={{ background: '#fff', padding: 'calc(14px + env(safe-area-inset-top)) 18px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
      <button onClick={() => router.push(`/${slug}/cart`)} aria-label="Back" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={22} color="var(--gb-ink)" /></button>
      <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500 }}>Checkout</div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        {header}
        <div style={{ padding: '70px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center' }}><MS name="shopping_bag" size={42} color="var(--gb-primary)" /></div>
          <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500 }}>Nothing in your cart</div>
          <Link href={`/${slug}`} style={{ background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', borderRadius: 14, padding: '13px 22px', fontSize: 15, fontWeight: 800 }}>Browse the menu</Link>
        </div>
      </div>
    );
  }

  const formattedTime = pickupSlot
    ? new Date(pickupSlot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';
  const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: 'var(--gb-faint)', marginBottom: 8 };
  const card = { background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 40 }}>
      {header}

      <div style={{ padding: '20px 18px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {dineInTable ? (
          <div>
            <div style={eyebrow}>Dine-in</div>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--gb-primary)' }}><MS name="restaurant" size={22} fill /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Table {dineInTable}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>We&apos;ll bring your order to the table</div>
              </div>
            </div>
          </div>
        ) : pickupSlot && (
          <div>
            <div style={eyebrow}>Pickup slot</div>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--gb-primary)' }}><MS name="schedule" size={22} fill /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{formattedTime}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>Order ahead, walk past the queue</div>
              </div>
              <button onClick={() => router.push(`/${slug}/cart`)} style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <MS name="edit" size={16} />Edit
              </button>
            </div>
          </div>
        )}

        <div>
          <div style={eyebrow}>Order summary</div>
          <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
            {items.map((item, i) => (
              <div key={item.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: i === 0 ? '0 0 10px' : '10px 0 0' }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{item.name} × {item.quantity}</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--gb-line)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gb-text)' }}>Total</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(total())}</span>
            </div>
          </div>
        </div>

        <div>
          <div style={eyebrow}>Your details</div>
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--gb-primary)' }}><MS name="person" size={22} fill /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{customerLoaded ? (name || '—') : 'Loading…'}</div>
              <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{customerLoaded && phone ? `+91 ${phone}` : ''}</div>
            </div>
          </div>
        </div>

        <div>
          <div style={eyebrow}>Payment method</div>

          {error && (
            <div style={{ color: 'var(--gb-danger)', fontSize: 13.5, fontWeight: 600, marginBottom: 14, padding: '12px 14px', background: '#FDECEA', borderRadius: 14 }}>{error}</div>
          )}

          <button
            disabled={loading || !detailsValid}
            onClick={() => handleOrder('online')}
            style={{
              width: '100%', border: 'none', borderRadius: 15, padding: 16, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)',
              fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)',
              cursor: loading || !detailsValid ? 'not-allowed' : 'pointer', opacity: loading || !detailsValid ? 0.6 : 1,
            }}
          >
            {loading ? 'Processing…' : `Pay ${inr(total())} online`}
          </button>
          <button
            disabled={loading || !detailsValid}
            onClick={() => handleOrder('counter')}
            style={{
              marginTop: 10, width: '100%', border: '1px solid var(--gb-line-2)', borderRadius: 15, padding: 15, background: '#fff', color: 'var(--gb-text)',
              fontSize: 15, fontWeight: 800, cursor: loading || !detailsValid ? 'not-allowed' : 'pointer', opacity: loading || !detailsValid ? 0.6 : 1,
            }}
          >
            Pay at counter
          </button>
        </div>
      </div>
    </div>
  );
}
