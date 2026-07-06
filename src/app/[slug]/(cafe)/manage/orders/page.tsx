'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCafeId } from '../../CafeProvider';
import { StaffChrome, Segmented, Chip, StatusPill } from '@/components/ui/kit';
import type { OrderStatus } from '@/components/ui/kit';
import type { GrabitOrderWithItems } from '@gradient365/gradient-commons';

const DATE_TABS = [
  { v: 'today',     l: 'Today' },
  { v: 'yesterday', l: 'Yesterday' },
  { v: 'week',      l: 'This Week' },
];

const STATUS_CHIPS = ['all', 'confirmed', 'prepping', 'ready', 'completed', 'cancelled'];

/** Map API status -> StatusPill variant. */
const PILL_STATUS: Record<string, OrderStatus> = {
  new_order: 'new',
  confirmed: 'confirmed',
  prepping:  'prepping',
  ready:     'ready',
  completed: 'done',
  cancelled: 'cancelled',
};

function getDateStr(filter: string): string {
  const d = new Date();
  if (filter === 'yesterday') d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export default function OrderHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const cafeId = useCafeId();

  const [orders, setOrders] = useState<GrabitOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!cafeId) return;
    async function fetchOrders() {
      setLoading(true);
      try {
        let url = `/api/proxy/grabit/orders/cafe/${cafeId}`;
        if (dateFilter === 'today' || dateFilter === 'yesterday') {
          url += `?date=${getDateStr(dateFilter)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        let fetched: GrabitOrderWithItems[] = data.orders ?? data;

        if (dateFilter === 'week') {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 7);
          fetched = fetched.filter(o => new Date(o.created_at) >= cutoff);
        }
        setOrders(fetched);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [cafeId, dateFilter]);

  const displayed = useMemo(
    () => statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter),
    [orders, statusFilter]
  );

  return (
    <StaffChrome slug={slug} active="history" title="Orders" sub={`${displayed.length} orders`}>
      <style>{`
        .gb-ord-table { display: none; }
        .gb-ord-cards { display: flex; }
        @media (min-width: 1024px) {
          .gb-ord-table { display: block; }
          .gb-ord-cards { display: none; }
        }
      `}</style>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <Segmented options={DATE_TABS} value={dateFilter} onChange={(v) => setDateFilter(v as typeof dateFilter)} />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }} className="noscroll">
          {STATUS_CHIPS.map(s => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} style={{ height: 32, fontSize: 13 }}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>Loading…</p>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 16px', color: 'var(--muted)', fontSize: 15 }}>
          No orders for this period
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {/* Desktop table */}
          <div className="gb-ord-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Order', 'Slot', 'Items', 'Phone', 'Total', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Total' ? 'right' : 'left', padding: '12px 10px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--hairline)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(order => {
                  const itemCount = order.items?.length ?? 0;
                  return (
                    <tr key={order.id}>
                      <td style={cellS}><span className="tabular t-label">#{order.id}</span></td>
                      <td style={cellS}><span className="tabular">{order.pickup_slot ? new Date(order.pickup_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
                      <td style={{ ...cellS, color: 'var(--muted)' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}{order.eta_minutes ? ` · ETA ${order.eta_minutes}m` : ''}</td>
                      <td style={{ ...cellS, color: 'var(--muted)' }} className="tabular">{order.customer_phone ?? '-'}</td>
                      <td style={{ ...cellS, textAlign: 'right' }}><span className="tabular" style={{ fontWeight: 700 }}>₹{Number(order.total_amount).toFixed(0)}</span></td>
                      <td style={cellS}><StatusPill status={PILL_STATUS[order.status] ?? 'pending'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="gb-ord-cards" style={{ flexDirection: 'column', gap: 8 }}>
            {displayed.map(order => {
              const itemCount = order.items?.length ?? 0;
              return (
                <div key={order.id} style={{
                  background: 'var(--surface-card)', borderRadius: 'var(--r-md)', padding: '14px 16px',
                  border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-card)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="tabular t-label" style={{ fontSize: 15, marginBottom: 3 }}>#{order.id}</p>
                    <p className="t-caption" style={{ marginBottom: 2 }}>
                      {order.pickup_slot ? new Date(order.pickup_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                    <p className="t-caption tabular">{order.customer_phone ?? '-'}{order.eta_minutes ? ` · ETA ${order.eta_minutes}m` : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusPill status={PILL_STATUS[order.status] ?? 'pending'} />
                    <p className="tabular" style={{ fontSize: 15, fontWeight: 700 }}>₹{Number(order.total_amount).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </StaffChrome>
  );
}

const cellS: React.CSSProperties = { padding: '12px 10px', borderBottom: '1px solid var(--hairline)', verticalAlign: 'middle' };
