'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import type { GrabitAvailableSlot } from '@gradient365/types';

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  function dateStr(offsetDays: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', slug],
    queryFn: async () => {
      // Try today first, fall back to tomorrow if no slots remain
      const todayRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(0)}`);
      if (!todayRes.ok) throw new Error('Failed to load slots');
      const todayData = await todayRes.json() as { slots: GrabitAvailableSlot[] };
      if (todayData.slots.length > 0) return { slots: todayData.slots, label: null };

      const tomorrowRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(1)}`);
      if (!tomorrowRes.ok) return { slots: [], label: null };
      const tomorrowData = await tomorrowRes.json() as { slots: GrabitAvailableSlot[] };
      return { slots: tomorrowData.slots, label: 'Tomorrow' };
    },
    enabled: items.length > 0
  });

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 16px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ fontSize: '20px', marginBottom: '8px' }}>🛒</p>
        <p style={{ color: 'var(--g-muted)', marginBottom: '24px' }}>Your cart is empty</p>
        <Link href={`/${slug}`} style={{
          display: 'inline-block', background: 'var(--g-amber)', color: '#fff',
          padding: '12px 24px', borderRadius: '980px', fontWeight: 600
        }}>
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0 140px' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--g-border)', padding: '0 16px', height: '48px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link href={`/${slug}`} style={{ fontSize: '14px', color: 'var(--g-muted)' }}>←</Link>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>Your order</span>
      </nav>

      <div style={{ padding: '16px' }}>
        {/* Cart items */}
        <div style={{ background: 'var(--g-surface)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
          {items.map((item, idx) => (
            <div key={item.menu_item_id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
              borderBottom: idx < items.length - 1 ? '1px solid var(--g-border)' : 'none'
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--g-muted)' }}>₹{item.price} each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQty(item.menu_item_id, item.quantity - 1)} style={qtyBtn}>−</button>
                  <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.menu_item_id, item.quantity + 1)} style={qtyBtn}>+</button>
                </div>
                <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '14px 16px', borderTop: '1px solid var(--g-border)',
            fontWeight: 700, fontSize: '17px'
          }}>
            <span>Total</span>
            <span>₹{total()}</span>
          </div>
        </div>

        {/* Slot picker */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Pick a pickup slot
          {slotsData?.label && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--g-amber)', marginLeft: '8px' }}>
              · {slotsData.label}
            </span>
          )}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--g-muted)', margin: '4px 0 12px' }}>
          Slots are 5 minutes apart · Max {slotsData?.slots[0]?.max_count ?? 5} orders per slot
        </p>
        {slotsLoading && (
          <p style={{ color: 'var(--g-muted)', fontSize: '14px' }}>Loading slots…</p>
        )}
        {!slotsLoading && slotsData?.slots.length === 0 && (
          <p style={{ color: 'var(--g-muted)', fontSize: '14px' }}>
            No slots available. Try again tomorrow.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {slotsData?.slots.map(slot => {
            const full = slot.available_count === 0;
            const selected = selectedSlot === slot.slot_start;
            const minsFromNow = Math.round((new Date(slot.slot_start).getTime() - Date.now()) / 60000);
            // For today: show relative ("5 mins"). For tomorrow: show clock time ("8:00 AM")
            const label = slotsData?.label
              ? new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : minsFromNow < 60
                ? `${minsFromNow} mins`
                : `${Math.floor(minsFromNow / 60)}h ${minsFromNow % 60}m`;
            return (
              <button
                key={slot.slot_start}
                disabled={full}
                onClick={() => setSelectedSlot(slot.slot_start)}
                style={{
                  padding: '14px 8px', borderRadius: '12px', textAlign: 'center',
                  cursor: full ? 'not-allowed' : 'pointer',
                  background: selected ? 'var(--g-amber)' : 'var(--g-surface)',
                  color: selected ? '#fff' : full ? 'var(--g-muted)' : 'var(--g-text)',
                  border: selected ? '2px solid var(--g-amber)' : '1.5px solid var(--g-border)',
                  opacity: full ? 0.45 : 1,
                  fontFamily: 'inherit'
                }}
              >
                <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '11px', fontWeight: 500, color: selected ? 'rgba(255,255,255,0.8)' : 'var(--g-muted)' }}>
                  {full ? 'Full' : `${slot.available_count} left`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Proceed CTA */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: '432px', zIndex: 100
      }}>
        <button
          disabled={!selectedSlot}
          onClick={() => {
            sessionStorage.setItem('grabit_slot', selectedSlot!);
            router.push(`/${slug}/checkout`);
          }}
          style={{
            width: '100%', padding: '16px', background: selectedSlot ? 'var(--g-amber)' : 'var(--g-surface)',
            color: selectedSlot ? '#fff' : 'var(--g-muted)', border: 'none', borderRadius: '980px',
            fontSize: '16px', fontWeight: 700, cursor: selectedSlot ? 'pointer' : 'not-allowed',
            boxShadow: selectedSlot ? 'rgba(255,107,0,0.38) 0 6px 18px' : 'none'
          }}
        >
          {selectedSlot ? 'Choose payment →' : 'Pick a slot to continue'}
        </button>
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '50%',
  border: '1px solid var(--g-border)', background: 'white',
  fontSize: '16px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};
