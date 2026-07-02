'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MS, NavSpacer, Eyebrow, inr } from '@/components/gb/kit';
import { ACTIVE_ORDER, PAST_ORDERS, ph, type GbPastOrder } from '@/components/gb/data';

function PastRow({ o }: { o: GbPastOrder }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13, marginBottom: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph(o.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{o.cafe}</div>
        <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{o.item} · {inr(o.price)}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--gb-green)' }}>
          <MS name="check_circle" size={14} fill />Picked up · {o.when}
        </div>
      </div>
      <div style={{ border: '1.5px solid #E7DCCC', color: 'var(--gb-primary)', fontSize: 12.5, fontWeight: 800, padding: '9px 13px', borderRadius: 11, flex: 'none' }}>Reorder</div>
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const pill = (active: boolean) => ({
    border: `1px solid ${active ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`,
    background: active ? 'var(--gb-ink)' : '#fff', color: active ? '#fff' : '#5A4E42',
    fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  });

  return (
    <>
      <div style={{ paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 20, paddingRight: 20, paddingBottom: 6 }}>
        <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.01em' }}>Your orders</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 4px' }}>
        <button style={pill(tab === 'active')} onClick={() => setTab('active')}>Active</button>
        <button style={pill(tab === 'past')} onClick={() => setTab('past')}>Past</button>
      </div>

      {tab === 'active' ? (
        <>
          <div style={{ padding: '14px 16px 0' }}>
            <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--gb-shadow-pop)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gb-green-tint)', padding: '11px 16px', borderBottom: '1px solid #E4EEDF' }}>
                <MS name="restaurant" size={18} fill color="var(--gb-green)" />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#2E6B32' }}>{ACTIVE_ORDER.status}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: 'var(--gb-green)', letterSpacing: '.08em' }}>{ACTIVE_ORDER.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, overflow: 'hidden', flex: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph(ACTIVE_ORDER.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--gb-text)' }}>{ACTIVE_ORDER.cafe}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 1 }}>{ACTIVE_ORDER.items} · {inr(ACTIVE_ORDER.total)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px' }}>
                <Link href={`/${ACTIVE_ORDER.slug}`} style={{ flex: 1, textAlign: 'center', background: 'var(--gb-primary)', color: '#fff', fontSize: 13.5, fontWeight: 800, padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <MS name="timeline" size={18} />Track order
                </Link>
                <button style={{ flex: 1, border: '1.5px solid #E7DCCC', color: 'var(--gb-ink)', fontSize: 13.5, fontWeight: 800, padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', cursor: 'pointer' }}>
                  <MS name="qr_code_2" size={18} color="var(--gb-primary)" />Pickup code
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 16px 0' }}>
            <Eyebrow style={{ padding: '0 4px 8px' }}>Earlier</Eyebrow>
            {PAST_ORDERS.map((o) => <PastRow key={o.cafe + o.item} o={o} />)}
          </div>
        </>
      ) : (
        <div style={{ padding: '18px 16px 0' }}>
          {PAST_ORDERS.map((o) => <PastRow key={o.cafe + o.item} o={o} />)}
        </div>
      )}
      <NavSpacer />
    </>
  );
}
