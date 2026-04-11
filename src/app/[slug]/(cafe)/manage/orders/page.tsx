'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabitOrderWithItems } from '@gradient365/types';

const DATE_TABS: { key: 'today' | 'yesterday' | 'week'; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
];

const STATUS_CHIPS = ['all', 'confirmed', 'prepping', 'ready', 'completed', 'cancelled'];

function getDateStr(filter: string): string {
  const d = new Date();
  if (filter === 'yesterday') d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#e8f5e9', color: '#2e7d32' },
  prepping: { bg: '#fff8e1', color: '#f57f17' },
  ready: { bg: '#e3f2fd', color: '#1565c0' },
  completed: { bg: '#f3e5f5', color: '#6a1b9a' },
  cancelled: { bg: '#fce4ec', color: '#b71c1c' },
};

export default function OrderHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [orders, setOrders] = useState<GrabitOrderWithItems[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/proxy/grabit/auth/me');
        if (res.status === 401) {
          router.push(`/${slug}/manage/login`);
          return;
        }
        const data = await res.json();
        setCafeId(data.cafeId);
      } catch {
        router.push(`/${slug}/manage/login`);
      }
    }
    init();
  }, [slug, router]);

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
          fetched = fetched.filter(
            (o) => new Date(o.created_at) >= cutoff
          );
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

  const displayed =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--g-text)',
          marginBottom: '20px',
        }}
      >
        Order History
      </h1>

      {/* Date tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          borderBottom: '1.5px solid var(--g-border)',
        }}
      >
        {DATE_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDateFilter(key)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: dateFilter === key ? 'var(--g-amber)' : 'var(--g-muted)',
              borderBottom: dateFilter === key ? '2px solid var(--g-amber)' : '2px solid transparent',
              marginBottom: '-1.5px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '16px',
          scrollbarWidth: 'none',
        }}
      >
        {STATUS_CHIPS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              borderRadius: '999px',
              border: '1.5px solid',
              cursor: 'pointer',
              background: statusFilter === s ? 'var(--g-amber)' : '#fff',
              color: statusFilter === s ? '#fff' : 'var(--g-muted)',
              borderColor: statusFilter === s ? 'var(--g-amber)' : 'var(--g-border)',
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <p style={{ color: 'var(--g-muted)', fontSize: '14px' }}>Loading…</p>
      ) : displayed.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: 'var(--g-muted)',
            fontSize: '15px',
          }}
        >
          No orders for this period
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map((order) => {
            const statusStyle = STATUS_COLORS[order.status] ?? { bg: '#f5f5f7', color: '#555' };
            const itemCount = order.items?.length ?? 0;
            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid var(--g-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--g-text)',
                      margin: '0 0 4px',
                    }}
                  >
                    #{order.id}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--g-muted)', margin: '0 0 4px' }}>
                    {order.pickup_slot ? new Date(order.pickup_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--g-muted)', margin: 0 }}>
                    {order.customer_phone ?? '—'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      marginBottom: '6px',
                    }}
                  >
                    {order.status}
                  </span>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: 'var(--g-text)',
                      margin: 0,
                    }}
                  >
                    ₹{Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
