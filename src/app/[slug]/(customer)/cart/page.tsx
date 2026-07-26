'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import type { GrabitAvailableSlot } from '@gradient365/gradient-commons';
import { MS } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';

interface SlotsData { slots: GrabitAvailableSlot[]; label: string | null; }

function dateStr(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function Veg({ size = 14, veg }: { size?: number; veg?: boolean | null }) {
  if (veg == null) return null;
  const c = veg ? '#3E8E4E' : '#9E2A2B';
  return (
    <span style={{ width: size, height: size, border: `1.5px solid ${c}`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <span style={{ width: size * 0.43, height: size * 0.43, borderRadius: '50%', background: c }} />
    </span>
  );
}

function Stepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  const cell = { width: 30, height: 32, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #E7DCCC', borderRadius: 10, overflow: 'hidden' }}>
      <button style={cell} onClick={() => onChange(qty - 1)}><MS name="remove" size={18} /></button>
      <span style={{ minWidth: 18, textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{qty}</span>
      <button style={cell} onClick={() => onChange(qty + 1)}><MS name="add" size={18} /></button>
    </div>
  );
}

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, updateQty, total } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [dineInTable, setDineInTable] = useState<string | null>(null);
  useEffect(() => { setDineInTable(sessionStorage.getItem('grabit_table')); }, []);
  const canProceed = dineInTable ? true : !!selectedSlot;

  async function placeOrder() {
    if (dineInTable) sessionStorage.removeItem('grabit_slot');
    else sessionStorage.setItem('grabit_slot', selectedSlot!);
    setCheckingAuth(true);
    const loggedIn = await fetch('/api/proxy/grabit/auth/me').then((r) => r.ok).catch(() => false);
    setCheckingAuth(false);
    if (!loggedIn) { setShowLoginPrompt(true); return; }
    router.push(`/${slug}/checkout`);
  }

  useEffect(() => {
    if (items.length === 0 || dineInTable) return; // dine-in: no pickup slot
    setSlotsLoading(true);
    (async () => {
      try {
        const todayRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(0)}`);
        if (!todayRes.ok) throw new Error('slots fetch failed');
        const todayData = await todayRes.json() as { slots: GrabitAvailableSlot[] };
        if (todayData.slots.length > 0) { setSlotsData({ slots: todayData.slots, label: null }); return; }
        const tomorrowRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(1)}`);
        const tomorrowData = tomorrowRes.ok ? await tomorrowRes.json() as { slots: GrabitAvailableSlot[] } : { slots: [] };
        setSlotsData({ slots: tomorrowData.slots, label: 'Tomorrow' });
      } catch {
        setSlotsData({ slots: [], label: null });
      } finally { setSlotsLoading(false); }
    })();
  }, [slug, items.length, dineInTable]);

  const cafeName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Your order';
  const subtotal = total();
  const toPay = subtotal;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        <div style={{ background: '#fff', padding: 'calc(14px + env(safe-area-inset-top)) 18px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
          <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={22} color="var(--gb-ink)" /></button>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500 }}>Your order</div>
        </div>
        <div style={{ padding: '70px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center' }}><MS name="shopping_bag" size={42} color="var(--gb-primary)" /></div>
          <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500 }}>Your cart is empty</div>
          <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, maxWidth: 240 }}>Add a few things from the menu and pick a pickup slot.</div>
          <Link href={`/${slug}`} style={{ background: 'var(--gb-primary)', color: '#fff', borderRadius: 14, padding: '13px 22px', fontSize: 15, fontWeight: 800 }}>Browse the menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 140 }}>
      {/* header */}
      <div style={{ background: '#fff', padding: 'calc(14px + env(safe-area-inset-top)) 18px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gb-line)' }}>
        <button onClick={() => router.push(`/${slug}`)} aria-label="Back" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MS name="arrow_back" size={22} color="var(--gb-ink)" /></button>
        <div>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1 }}>Your order</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{cafeName} · {items.length} item{items.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* items */}
      <div style={{ padding: '8px 18px 4px' }}>
        {items.map(item => (
          <div key={item.menu_item_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--gb-line)' }}>
            <Veg veg={item.is_veg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{inr(item.price)}</div>
            </div>
            <Stepper qty={item.quantity} onChange={(v) => updateQty(item.menu_item_id, v)} />
            <div style={{ minWidth: 56, textAlign: 'right', fontSize: 14.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(item.price * item.quantity)}</div>
          </div>
        ))}
        <Link href={`/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14, color: 'var(--gb-primary)', fontSize: 13.5, fontWeight: 700 }}>
          <MS name="add" size={18} />Add more items
        </Link>
      </div>

      {dineInTable ? (
        /* dine-in: table service, no pickup slot */
        <div style={{ margin: '22px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MS name="restaurant" size={20} fill color="var(--gb-primary)" />
            <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500 }}>Dine-in · Table {dineInTable}</div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 28 }}>We&apos;ll bring your order to the table.</div>
        </div>
      ) : (
      /* pickup slot */
      <div style={{ margin: '22px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: '0 12px 26px -20px rgba(60,40,25,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="schedule" size={20} fill color="var(--gb-primary)" />
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500 }}>Pickup time</div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 3, marginLeft: 28 }}>
          It&apos;ll be fresh &amp; waiting, no waiting in line{slotsData?.label ? ` · ${slotsData.label}` : ''}
        </div>
        {slotsLoading && <p style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 12 }}>Loading slots…</p>}
        {!slotsLoading && slotsData?.slots.length === 0 && <p style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 12 }}>No slots available. Try again tomorrow.</p>}
        <div className="gb-scroll" style={{ display: 'flex', gap: 9, overflowX: 'auto', marginTop: 14 }}>
          {slotsData?.slots.map((slot, idx) => {
            const full = slot.available_count === 0;
            const sel = selectedSlot === slot.slot_start;
            const minsFromNow = Math.round((new Date(slot.slot_start).getTime() - Date.now()) / 60000);
            const time = new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const label = !slotsData?.label && idx === 0 && minsFromNow <= 20 ? `ASAP · ${Math.max(minsFromNow, 1)} min` : time;
            return (
              <button
                key={slot.slot_start}
                disabled={full}
                onClick={() => setSelectedSlot(slot.slot_start)}
                style={{
                  flex: 'none', border: `1.5px solid ${sel ? 'var(--gb-primary)' : full ? 'var(--gb-line-4)' : '#EEE4D6'}`,
                  background: sel ? 'var(--gb-primary-pale)' : '#fff', color: sel ? 'var(--gb-primary)' : full ? 'var(--gb-muted-2)' : '#5A4E42',
                  fontSize: 13, fontWeight: 700, padding: '11px 16px', borderRadius: 13, textAlign: 'center', lineHeight: 1.1,
                  cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.6 : 1,
                }}
              >
                {full ? `${label} · Full` : label}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* bill */}
      <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#6E6155', fontWeight: 600, padding: '5px 0' }}><span>Item total</span><span>{inr(subtotal)}</span></div>
        <div style={{ height: 1, background: 'var(--gb-line)', margin: '9px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--gb-text)' }}><span>To pay</span><span>{inr(toPay)}</span></div>
      </div>

      {/* pay bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', background: '#fff', borderTop: '1px solid #EEE4D6', padding: '14px 16px calc(26px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 24px -16px rgba(60,40,25,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, color: '#6E6155', fontSize: 12.5, fontWeight: 600 }}>
          <MS name="account_balance_wallet" size={19} color="var(--gb-primary)" />Paying with UPI · you@okbank
          <MS name="expand_more" size={18} color="#B0A392" style={{ marginLeft: 'auto' }} />
        </div>
        <button
          disabled={!canProceed || checkingAuth}
          onClick={placeOrder}
          style={{ width: '100%', border: 'none', background: 'var(--gb-primary)', color: '#fff', borderRadius: 15, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: canProceed && !checkingAuth ? 'pointer' : 'not-allowed', opacity: canProceed && !checkingAuth ? 1 : 0.6 }}
        >
          <span style={{ fontSize: 16, fontWeight: 800 }}>Pay {inr(toPay)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700 }}>{checkingAuth ? 'Checking…' : canProceed ? 'Place order' : 'Pick a slot'}<MS name="arrow_forward" size={20} /></span>
        </button>
      </div>

      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <MS name="lock" size={26} color="var(--gb-primary)" />
            </div>
            <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 14 }}>Log in to continue</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              Your order&apos;s saved, log in to place it.
            </div>
            <Link
              href={`/login?next=${encodeURIComponent(`/${slug}/checkout`)}`}
              style={{ display: 'block', marginTop: 18, background: 'var(--gb-primary)', color: '#fff', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 800 }}
            >
              Log in
            </Link>
            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', padding: 8 }}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
