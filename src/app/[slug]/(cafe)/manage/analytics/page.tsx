'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StaffChrome, Icon } from '@/components/ui/kit';
import type { GrabbitOrderWithItems } from '@gradient365/gradient-commons';

export default function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [cafeId, setCafeId] = useState<number | null>(null);
  const [orders, setOrders] = useState<GrabbitOrderWithItems[]>([]);
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
  const onlinePct = Math.round((onlineCount / Math.max(1, onlineCount + counterCount)) * 100);

  const topItems = useMemo(() => {
    const tally: Record<string, number> = {};
    active.forEach(o => (o.items ?? []).forEach(it => {
      tally[it.menu_item_name] = (tally[it.menu_item_name] ?? 0) + it.quantity;
    }));
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [active]);
  const topMax = topItems.length ? topItems[0][1] : 1;

  const kpis: { icon: (typeof Icon)[string]; label: string; value: string }[] = [
    { icon: Icon.receipt, label: 'Orders today', value: String(todayCount) },
    { icon: Icon.rupee, label: 'Revenue', value: `₹${todayRevenue.toFixed(0)}` },
    { icon: Icon.card, label: 'Online payments', value: String(onlineCount) },
    { icon: Icon.counter, label: 'At counter', value: String(counterCount) },
  ];

  return (
    <StaffChrome slug={slug} active="analytics" title="Analytics" sub="Today · live">
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</p>
        ) : (
          <>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
              {kpis.map(({ icon, label, value }) => (
                <div key={label} style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-card)', padding: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-tint)', display: 'grid', placeItems: 'center', color: 'var(--primary)', marginBottom: 14 }}>{icon({ size: 20 })}</div>
                  <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
                  <div className="t-caption" style={{ marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Payment split */}
              <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-card)', padding: 22 }}>
                <div className="t-headline-card" style={{ marginBottom: 20 }}>Payment split</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <Donut pct={onlinePct} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <LegRow c="var(--primary)" l="Pay online" v={`${onlineCount} · ${onlinePct}%`} />
                    <LegRow c="var(--surface-dim)" l="At counter" v={`${counterCount} · ${100 - onlinePct}%`} />
                  </div>
                </div>
              </div>

              {/* Top items */}
              <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-card)', padding: 22 }}>
                <div className="t-headline-card" style={{ marginBottom: 18 }}>Top selling items</div>
                {topItems.length === 0 ? (
                  <p className="t-caption">No orders yet today.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {topItems.map(([name, qty], i) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="tabular" style={{ width: 18, fontWeight: 800, color: 'var(--muted-2)' }}>{i + 1}</span>
                        <span className="t-label" style={{ width: 120, flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'var(--surface-container)', overflow: 'hidden' }}>
                          <div style={{ width: `${(qty / topMax) * 100}%`, height: '100%', borderRadius: 5, background: 'var(--primary)' }} />
                        </div>
                        <span className="tabular" style={{ width: 52, textAlign: 'right', fontWeight: 700 }}>{qty} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </StaffChrome>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="var(--surface-dim)" strokeWidth="14" />
      <circle cx="55" cy="55" r={r} fill="none" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 55 55)" />
      <text x="55" y="55" textAnchor="middle" dominantBaseline="central" className="tabular" style={{ fontSize: 22, fontWeight: 800, fill: 'var(--on-surface)' }}>{pct}%</text>
    </svg>
  );
}

function LegRow({ c, l, v }: { c: string; l: string; v: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: c }} />
      <div><div className="t-label" style={{ fontSize: 13.5 }}>{l}</div><div className="t-caption tabular">{v}</div></div>
    </div>
  );
}
