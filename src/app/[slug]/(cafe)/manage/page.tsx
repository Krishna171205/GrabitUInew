'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCafeId } from '../CafeProvider';
import { StaffChrome, Button, Icon } from '@/components/ui/kit';
import type { GrabitOrderWithItems } from '@gradient365/gradient-commons';

/** Kanban columns mapped to real order statuses (completed/cancelled are filtered out). */
const COLS: { status: string; title: string; accent: string }[] = [
  { status: 'new_order', title: 'New',      accent: 'var(--info)' },
  { status: 'confirmed', title: 'Accepted', accent: 'var(--success)' },
  { status: 'prepping',  title: 'Prepping', accent: 'var(--tertiary)' },
  { status: 'ready',     title: 'Ready',    accent: 'var(--primary)' },
];

const STATUS_ACTIONS: Record<string, { label: string; next: string; variant: 'primary' | 'success' | 'dark' }> = {
  confirmed: { label: 'Start Prepping', next: 'prepping',  variant: 'primary' },
  prepping:  { label: 'Mark Ready',     next: 'ready',     variant: 'success' },
  ready:     { label: 'Hand Over',      next: 'completed', variant: 'dark' },
};

function minsUntil(isoSlot: string): number {
  return Math.round((new Date(isoSlot).getTime() - Date.now()) / 60000);
}

export default function ManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const cafeId = useCafeId();
  const [orders, setOrders] = useState<GrabitOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (cid: number) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const r = await fetch(`/api/proxy/grabit/orders/cafe/${cid}?date=${today}`);
      const data = await r.json();
      setOrders(Array.isArray(data)
        ? data.filter((o: GrabitOrderWithItems) => !['completed', 'cancelled'].includes(o.status))
        : []);
    } catch {
      // keep existing orders on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cafeId) return;
    loadOrders(cafeId);
  }, [cafeId, loadOrders]);

  useEffect(() => {
    if (!cafeId) return;
    // Live updates via polling the backend (RDS-backed), replacing Supabase Realtime.
    const poll = setInterval(() => { loadOrders(cafeId); }, 5000);
    return () => clearInterval(poll);
  }, [cafeId, loadOrders]);

  const updateStatus = useCallback(async (orderId: number, nextStatus: string, prepMins?: number) => {
    const body: Record<string, unknown> = { status: nextStatus };
    if (prepMins) body.prep_time_minutes = prepMins;
    await fetch(`/api/proxy/grabit/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (cafeId) await loadOrders(cafeId);
  }, [cafeId, loadOrders]);

  const newCount = orders.filter(o => o.status === 'new_order').length;

  return (
    <StaffChrome
      slug={slug}
      active="queue"
      title="Live Order Queue"
      sub={`${orders.length} active`}
      newCount={newCount}
      right={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 'var(--r-pill)', background: 'var(--success-tint)', color: 'var(--success)', fontSize: 13, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'blink 1.5s ease-in-out infinite' }} />
          Live
        </span>
      }
    >
      <style>{`
        .gb-queue-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 16px; }
        @media (min-width: 1024px) {
          .gb-queue-grid { grid-template-columns: repeat(4, 1fr); padding: 20px; align-items: start; }
        }
      `}</style>

      {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Loading…</p>}

      {!loading && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-tint)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>{Icon.check({ size: 28 })}</div>
          <p className="t-title" style={{ fontSize: 18 }}>All clear</p>
          <p className="t-caption" style={{ marginTop: 4 }}>No active orders right now</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="gb-queue-grid">
          {COLS.map(col => {
            const cards = orders.filter(o => o.status === col.status);
            return (
              <div key={col.status} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-low)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--hairline)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: col.accent }} />
                  <span className="t-label" style={{ fontSize: 14 }}>{col.title}</span>
                  <span className="tabular" style={{ marginLeft: 'auto', minWidth: 22, height: 22, padding: '0 6px', borderRadius: 11, background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: 12.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{cards.length}</span>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cards.length === 0 && <div className="t-caption" style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--muted-2)' }}>No orders</div>}
                  {cards.map(order => (
                    <QueueCard
                      key={order.id}
                      order={order}
                      onReject={() => updateStatus(order.id, 'cancelled')}
                      onAccept={() => updateStatus(order.id, 'confirmed')}
                      onAdvance={() => updateStatus(order.id, STATUS_ACTIONS[order.status].next)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StaffChrome>
  );
}

function QueueCard({
  order, onReject, onAccept, onAdvance,
}: {
  order: GrabitOrderWithItems;
  onReject: () => void;
  onAccept: () => void;
  onAdvance: () => void;
}) {
  const isNew = order.status === 'new_order';
  const mins = minsUntil(order.pickup_slot);
  const overdue = mins < 0;
  const dueText = overdue ? `Overdue ${Math.abs(mins)}m` : mins === 0 ? 'Due now' : `Due in ${mins}m`;

  const hasTimer = order.status === 'prepping' && order.prep_ready_at;
  const prepMinsLeft = hasTimer
    ? Math.max(0, Math.round((new Date(order.prep_ready_at!).getTime() - Date.now()) / 60000))
    : null;
  const etaMins = order.eta_minutes ?? null;
  const paid = order.payment_status === 'paid';
  const action = STATUS_ACTIONS[order.status];

  return (
    <div style={{
      background: 'var(--surface-card)', borderRadius: 'var(--r-md)',
      border: `1px solid ${isNew ? 'var(--info)' : 'var(--hairline)'}`,
      boxShadow: 'var(--shadow-card)', padding: 13,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="tabular t-label" style={{ fontSize: 15 }}>#{order.id}</span>
        <span className="tabular" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
          color: overdue ? 'var(--error)' : order.status === 'ready' ? 'var(--success)' : 'var(--on-surface-variant)',
          background: overdue ? 'var(--error-tint)' : 'var(--surface-container)', padding: '3px 8px', borderRadius: 'var(--r-pill)',
        }}>
          {Icon.clock({ size: 13 })} {dueText}
          {etaMins !== null && ` · ETA ${etaMins}m`}
          {prepMinsLeft !== null && ` · ${prepMinsLeft}m left`}
        </span>
      </div>

      {/* Customer */}
      <div className="t-caption" style={{ marginBottom: 9 }}>
        {order.customer_name ? `${order.customer_name} · ` : ''}{order.customer_phone}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 11, padding: '9px 10px', background: 'var(--surface-low)', borderRadius: 'var(--r-sm)' }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="tabular" style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--muted)', minWidth: 20 }}>{item.quantity}×</span>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.menu_item_name}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{
          padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap',
          background: paid ? 'var(--success-tint)' : 'var(--primary-tint)',
          color: paid ? 'var(--success)' : 'var(--primary)',
        }}>
          {paid ? 'Paid' : 'Unpaid'} · ₹{Number(order.total_amount).toFixed(0)}
        </span>

        {isNew && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
            <Button size="sm" variant="success" onClick={onAccept}>Accept</Button>
          </div>
        )}
        {!isNew && action && (
          <Button size="sm" variant={action.variant} onClick={onAdvance}>{action.label}</Button>
        )}
      </div>
    </div>
  );
}
