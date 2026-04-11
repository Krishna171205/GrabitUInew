'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomTabs } from './BottomTabs';
import { supabase } from '@/lib/supabase';
import type { GrabitOrderWithItems } from '@gradient365/types';

const STATUS_LABELS: Record<string, string> = {
  new_order: 'New',
  confirmed: 'Accepted',
  prepping:  'Prepping',
  ready:     'Ready ★',
  completed: 'Done',
  cancelled: 'Cancelled',
};

const STATUS_ACTIONS: Record<string, { label: string; next: string }> = {
  confirmed: { label: 'Start Prepping', next: 'prepping' },
  prepping:  { label: 'Mark Ready',     next: 'ready' },
  ready:     { label: 'Hand Over ✓',    next: 'completed' },
};

const BADGE_STYLE: Record<string, { background: string; color: string }> = {
  new_order: { background: '#e8f4fd', color: '#0071e3' },
  confirmed: { background: '#e3f9e5', color: '#1a7f37' },
  prepping:  { background: '#fff3e0', color: '#e65100' },
  ready:     { background: 'var(--g-amber)', color: '#fff' },
  completed: { background: 'var(--g-surface)', color: 'var(--g-muted)' },
  cancelled: { background: 'rgba(255,59,48,0.08)', color: '#ff3b30' },
};

const PREP_TIMES = [5, 10, 15, 20, 25, 30];

function minsUntil(isoSlot: string): number {
  return Math.round((new Date(isoSlot).getTime() - Date.now()) / 60000);
}

interface AcceptState {
  orderId: number;
  pickupMins: number;
  selectedPrepMins: number | null;
}

export default function ManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [orders, setOrders] = useState<GrabitOrderWithItems[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptState, setAcceptState] = useState<AcceptState | null>(null);
  const [accepting, setAccepting] = useState(false);

  function loadOrders(cid: number) {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/proxy/grabit/orders/cafe/${cid}?date=${today}`)
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data)
          ? data.filter(o => !['completed', 'cancelled'].includes(o.status))
          : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetch('/api/proxy/grabit/auth/me')
      .then(r => {
        if (r.status === 401) { router.replace(`/${slug}/manage/login`); throw new Error('unauth'); }
        return r.json();
      })
      .then(d => { setCafeId(d.cafeId); loadOrders(d.cafeId); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!cafeId) return;
    const channel = supabase
      .channel(`cafe-orders-${cafeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grabit_orders', filter: `cafe_id=eq.${cafeId}` },
        () => { loadOrders(cafeId); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId]);

  async function updateStatus(orderId: number, nextStatus: string, prepMins?: number) {
    const body: Record<string, unknown> = { status: nextStatus };
    if (prepMins) body.prep_time_minutes = prepMins;
    await fetch(`/api/proxy/grabit/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (cafeId) loadOrders(cafeId);
  }

  async function confirmAccept() {
    if (!acceptState) return;
    setAccepting(true);
    const { orderId, selectedPrepMins } = acceptState;
    // If timer set → go straight to prepping; if no timer → confirmed
    const nextStatus = selectedPrepMins ? 'prepping' : 'confirmed';
    await updateStatus(orderId, nextStatus, selectedPrepMins ?? undefined);
    setAcceptState(null);
    setAccepting(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--g-surface)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--g-text)', color: '#fff', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0
      }}>
        <span style={{ fontSize: '17px', fontWeight: 700 }}>
          <span style={{
            display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
            background: '#34c759', marginRight: '8px',
            animation: 'blink 1.5s ease-in-out infinite'
          }} />
          Live Queue
        </span>
        <span style={{
          background: 'var(--g-amber)', color: '#fff',
          borderRadius: '980px', padding: '4px 12px',
          fontSize: '12px', fontWeight: 700
        }}>{orders.length} active</span>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }`}</style>

      {/* Order list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 8px' }}>
        {loading && <p style={{ textAlign: 'center', color: 'var(--g-muted)', padding: '40px 0' }}>Loading…</p>}
        {!loading && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>✅</p>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>All clear</p>
            <p style={{ fontSize: '13px', color: 'var(--g-muted)', marginTop: '4px' }}>No active orders right now</p>
          </div>
        )}
        {orders.map(order => {
          const isNew   = order.status === 'new_order';
          const isReady = order.status === 'ready';
          const mins    = minsUntil(order.pickup_slot);
          const badgeStyle = BADGE_STYLE[order.status] ?? BADGE_STYLE.confirmed;

          // Prep timer countdown (if prepping with timer set)
          const hasTimer = order.status === 'prepping' && (order as GrabitOrderWithItems & { prep_ready_at?: string }).prep_ready_at;
          const prepMinsLeft = hasTimer
            ? Math.max(0, Math.round((new Date((order as GrabitOrderWithItems & { prep_ready_at?: string }).prep_ready_at!).getTime() - Date.now()) / 60000))
            : null;

          return (
            <div key={order.id} style={{
              background: 'var(--g-white)', borderRadius: '18px', padding: '16px',
              marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: `2px solid ${isNew ? '#0071e3' : isReady ? 'var(--g-amber)' : 'transparent'}`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em' }}>#{order.id}</p>
                  <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginTop: '2px' }}>
                    {mins > 0 ? `Expected in ${mins} min${mins !== 1 ? 's' : ''}` : mins === 0 ? 'Expected now' : `${Math.abs(mins)} mins overdue`}
                    {prepMinsLeft !== null && ` · prep: ${prepMinsLeft}m left`}
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '980px', fontSize: '11px', fontWeight: 700,
                  background: badgeStyle.background, color: badgeStyle.color
                }}>{STATUS_LABELS[order.status] ?? order.status}</span>
              </div>

              {/* Customer */}
              <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginBottom: '8px' }}>
                {order.customer_name ? `${order.customer_name} · ` : ''}{order.customer_phone}
              </p>

              {/* Items */}
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <p key={idx} style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.6 }}>
                    {item.menu_item_name} × {item.quantity}
                  </p>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '5px 10px', borderRadius: '980px', fontSize: '11px', fontWeight: 700,
                  background: order.payment_status === 'paid' ? '#e3f9e5' : 'var(--g-amber-pale)',
                  color: order.payment_status === 'paid' ? '#1a7f37' : 'var(--g-amber)'
                }}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'} · ₹{Number(order.total_amount).toFixed(0)}
                </span>

                {/* Accept / Reject for new_order */}
                {isNew && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => updateStatus(order.id, 'cancelled')} style={{
                      padding: '9px 14px', border: 'none', borderRadius: '980px',
                      fontFamily: 'inherit', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: 'rgba(255,59,48,0.08)', color: '#ff3b30'
                    }}>Reject</button>
                    <button onClick={() => setAcceptState({ orderId: order.id, pickupMins: Math.max(0, mins), selectedPrepMins: null })} style={{
                      padding: '9px 16px', border: 'none', borderRadius: '980px',
                      fontFamily: 'inherit', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: '#34c759', color: '#fff',
                      boxShadow: '0 4px 12px rgba(52,199,89,0.3)'
                    }}>Accept ✓</button>
                  </div>
                )}

                {/* Progression buttons */}
                {!isNew && STATUS_ACTIONS[order.status] && (
                  <button onClick={() => updateStatus(order.id, STATUS_ACTIONS[order.status].next)} style={{
                    padding: '9px 18px', border: 'none', borderRadius: '980px',
                    fontFamily: 'inherit', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    background: isReady ? 'var(--g-surface)' : 'var(--g-amber)',
                    color: isReady ? 'var(--g-text)' : '#fff',
                    boxShadow: isReady ? 'none' : '0 4px 12px rgba(255,107,0,0.28)'
                  }}>{STATUS_ACTIONS[order.status].label}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept modal with prep timer */}
      {acceptState && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setAcceptState(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px 36px',
              width: '100%', maxWidth: '480px'
            }}
          >
            <div style={{ width: '36px', height: '4px', background: 'var(--g-border)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <p style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
              Accept Order #{acceptState.orderId}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--g-muted)', marginBottom: '20px' }}>
              Expected in {acceptState.pickupMins} mins · Set prep time or accept as-is
            </p>

            {/* Prep time grid */}
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '10px' }}>
              How long to prepare?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {PREP_TIMES.map(m => (
                <button
                  key={m}
                  onClick={() => setAcceptState(s => s ? { ...s, selectedPrepMins: s.selectedPrepMins === m ? null : m } : null)}
                  style={{
                    padding: '14px 8px', border: 'none', borderRadius: '12px',
                    fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    background: acceptState.selectedPrepMins === m ? 'var(--g-amber)' : 'var(--g-surface)',
                    color: acceptState.selectedPrepMins === m ? '#fff' : 'var(--g-text)',
                    outline: acceptState.selectedPrepMins === m ? 'none' : '1.5px solid var(--g-border)'
                  }}
                >
                  {m} min
                </button>
              ))}
            </div>

            <button
              onClick={confirmAccept}
              disabled={accepting}
              style={{
                width: '100%', padding: '16px', border: 'none', borderRadius: '980px',
                fontFamily: 'inherit', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                background: 'var(--g-amber)', color: '#fff',
                boxShadow: '0 6px 18px rgba(255,107,0,0.3)',
                opacity: accepting ? 0.6 : 1
              }}
            >
              {accepting ? 'Accepting…' :
                acceptState.selectedPrepMins
                  ? `Accept · prep timer ${acceptState.selectedPrepMins} mins`
                  : 'Accept without timer'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <BottomTabs slug={slug} active="queue" />
    </div>
  );
}

