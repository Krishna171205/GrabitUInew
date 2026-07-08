'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { TopBar, Card, Button, Icon } from '@/components/ui/kit';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [pickupSlot, setPickupSlot] = useState<string | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const phoneValid = /^\d{10}$/.test(phone);
  const detailsValid = name.trim().length > 0 && phoneValid;

  // Read slot from sessionStorage
  useEffect(() => {
    const slot = sessionStorage.getItem('grabit_slot');
    if (!slot) {
      router.push(`/${slug}/cart`);
      return;
    }
    setPickupSlot(slot);
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
    if (!pickupSlot || !cafeId || !detailsValid) return;
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
          pickup_slot: pickupSlot,
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
        router.push(orderUrl);
      } else {
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
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
        <TopBar title="Checkout" onBack={() => router.push(`/${slug}/cart`)} />
        <div style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p className="t-caption">Nothing in your cart</p>
          <Link href={`/${slug}`}><Button>Back to menu</Button></Link>
        </div>
      </div>
    );
  }

  const formattedTime = pickupSlot
    ? new Date(pickupSlot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative', paddingBottom: 40 }}>
      <TopBar title="Checkout" onBack={() => router.push(`/${slug}/cart`)} />

      <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Pickup slot */}
        {pickupSlot && (
          <div>
            <div className="t-label" style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 13 }}>Pickup slot</div>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-tint)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>{Icon.clock({ size: 24 })}</div>
              <div style={{ flex: 1 }}>
                <div className="t-label tabular">{formattedTime}</div>
                <div className="t-caption" style={{ marginTop: 2 }}>Order ahead, walk past the queue</div>
              </div>
              <button onClick={() => router.push(`/${slug}/cart`)} style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {Icon.edit({ size: 16 })} Edit
              </button>
            </Card>
          </div>
        )}

        {/* Order summary */}
        <div>
          <div className="t-label" style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 13 }}>Order summary</div>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="t-body">{item.name} × {item.quantity}</span>
                <span className="tabular" style={{ fontWeight: 600, fontSize: 15 }}>{inr(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--hairline)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span className="tabular" style={{ fontWeight: 700, fontSize: 18 }}>{inr(total())}</span>
            </div>
          </Card>
        </div>

        {/* Your details */}
        <div>
          <div className="t-label" style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 13 }}>Your details</div>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              maxLength={80}
              style={{ border: '1px solid var(--hairline)', borderRadius: 10, padding: '12px 14px', fontSize: 15 }}
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit phone"
              inputMode="numeric"
              style={{ border: '1px solid var(--hairline)', borderRadius: 10, padding: '12px 14px', fontSize: 15 }}
            />
            {phone.length > 0 && !phoneValid && (
              <span style={{ color: 'var(--error)', fontSize: 12 }}>Enter a valid 10-digit phone number</span>
            )}
          </Card>
        </div>

        {/* Payment */}
        <div>
          <div className="t-label" style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 13 }}>Payment method</div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: 14, marginBottom: 16, padding: '12px 14px', background: 'var(--error-tint)', borderRadius: 'var(--r-md)' }}>{error}</div>
          )}

          <Button full disabled={loading || !detailsValid} onClick={() => handleOrder('online')}>
            {loading ? 'Processing...' : `Pay ${inr(total())} online`}
          </Button>
          <button
            disabled={loading || !detailsValid}
            onClick={() => handleOrder('counter')}
            style={{ marginTop: 10, background: 'transparent', border: '1px solid var(--hairline)', borderRadius: 12, padding: '14px', width: '100%', fontWeight: 700, cursor: detailsValid ? 'pointer' : 'not-allowed' }}
          >
            Pay at counter
          </button>
        </div>
      </div>
    </div>
  );
}
