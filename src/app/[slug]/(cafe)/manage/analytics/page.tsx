'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabitOrderWithItems } from '@gradient365/gradient-commons';

export default function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [cafeId, setCafeId] = useState<number | null>(null);
  const [orders, setOrders] = useState<GrabitOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

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
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/proxy/grabit/orders/cafe/${cafeId}?date=${today}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrders(data.orders ?? data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [cafeId]);

  const active = orders.filter((o) => o.status !== 'cancelled');
  const todayRevenue = active.reduce((s, o) => s + Number(o.total_amount), 0);
  const todayCount = active.length;
  const onlineCount = active.filter((o) => o.payment_method === 'online').length;
  const counterCount = active.filter((o) => o.payment_method === 'counter').length;

  const stats: { label: string; value: string }[] = [
    { label: 'Orders Today', value: String(todayCount) },
    { label: 'Revenue Today', value: `₹${todayRevenue.toFixed(2)}` },
    { label: 'Online Payments', value: String(onlineCount) },
    { label: 'Counter Payments', value: String(counterCount) },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--g-text)',
          marginBottom: '24px',
        }}
      >
        Analytics — Today
      </h1>

      {loading ? (
        <p style={{ color: 'var(--g-muted)', fontSize: '14px' }}>Loading…</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}
        >
          {stats.map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid var(--g-border)',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--g-muted)',
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: 'var(--g-text)',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
