'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [pickupSlot, setPickupSlot] = useState<string | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read slot from sessionStorage
  useEffect(() => {
    const slot = sessionStorage.getItem('grabit_slot');
    if (!slot) {
      router.push(`/${slug}/cart`);
      return;
    }
    setPickupSlot(slot);
  }, [slug, router]);

  // Fetch cafe_id
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`)
      .then(r => r.json())
      .then(d => setCafeId(d.cafe?.id ?? null))
      .catch(() => setCafeId(null));
  }, [slug]);

  async function handleOrder(paymentMethod: 'online' | 'counter') {
    if (!pickupSlot || !cafeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_id: cafeId,
          pickup_slot: pickupSlot,
          payment_method: paymentMethod,
          items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (paymentMethod === 'counter') {
        clearCart();
        sessionStorage.removeItem('grabit_slot');
        router.push(`/${slug}/order/${data.order_id}`);
      } else {
        // Online payment — load Cashfree SDK dynamically
        await new Promise<void>((resolve, reject) => {
          if (document.getElementById('cashfree-sdk')) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.id = 'cashfree-sdk';
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.head.appendChild(script);
        });
        // @ts-ignore
        Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
        }).checkout({
          paymentSessionId: data.cashfree.payment_session_id,
          returnUrl: `${window.location.origin}/${slug}/order/${data.order_id}`
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 16px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ color: 'var(--g-muted)', marginBottom: '24px' }}>Nothing in your cart</p>
        <Link
          href={`/${slug}`}
          style={{
            display: 'inline-block',
            background: 'var(--g-amber)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '980px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Back to menu
        </Link>
      </div>
    );
  }

  const formattedTime = pickupSlot
    ? new Date(pickupSlot).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : '';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <Link href={`/${slug}/cart`} style={{ fontSize: '14px', color: 'var(--g-muted)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em' }}>Checkout</span>
      </nav>

      {/* Pickup time */}
      {pickupSlot && (
        <div style={{
          background: 'var(--g-amber-tint)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>🕐</span>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginBottom: '2px' }}>Pickup slot</p>
            <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--g-amber)' }}>{formattedTime}</p>
          </div>
        </div>
      )}

      {/* Order summary */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--g-muted)', marginBottom: '10px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        Order summary
      </h2>
      <div style={{
        background: 'var(--g-surface)',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        {items.map((item, idx) => (
          <div
            key={item.menu_item_id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: idx < items.length - 1 ? '12px' : '0',
              marginBottom: idx < items.length - 1 ? '12px' : '0',
              borderBottom: idx < items.length - 1 ? '1px solid var(--g-border)' : 'none'
            }}
          >
            <span style={{ fontSize: '15px', color: 'var(--g-text)' }}>
              {item.name} × {item.quantity}
            </span>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>
              ₹{(item.price * item.quantity).toFixed(0)}
            </span>
          </div>
        ))}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '14px',
          marginTop: '14px',
          borderTop: '1px solid var(--g-border)'
        }}>
          <span style={{ fontWeight: 700, fontSize: '17px' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '17px' }}>₹{total()}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '14px',
          marginBottom: '16px',
          padding: '12px 14px',
          background: '#fef2f2',
          borderRadius: '10px'
        }}>
          {error}
        </p>
      )}

      {/* Payment buttons */}
      <button
        disabled={loading}
        onClick={() => handleOrder('online')}
        style={{
          background: 'var(--g-amber)',
          color: '#fff',
          border: 'none',
          borderRadius: '980px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'Processing…' : `Pay ₹${total()} online`}
      </button>

    </div>
  );
}
