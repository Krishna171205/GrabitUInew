'use client';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import type { GrabitAvailableSlot } from '@gradient365/gradient-commons';
import { TopBar, Card, Photo, FoodMark, QtyStepper, Button, Icon } from '@/components/ui/kit';

interface SlotsData { slots: GrabitAvailableSlot[]; label: string | null; }

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/* Swipe-to-delete row (pointer drag reveals a delete action). */
function SwipeRow({ children, onDelete }: { children: ReactNode; onDelete: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const open = useRef(false);
  const onDown = (e: React.PointerEvent) => { start.current = e.clientX - (open.current ? -72 : 0); e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (start.current == null) return;
    setDx(Math.max(-84, Math.min(0, e.clientX - start.current)));
  };
  const onUp = () => {
    if (start.current == null) return;
    const o = dx < -42; open.current = o; setDx(o ? -72 : 0); start.current = null;
  };
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)' }}>
      <button onClick={onDelete} aria-label="Remove" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 72, border: 'none', background: 'var(--error)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
        {Icon.trash({ size: 22 })}
      </button>
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ transform: `translateX(${dx}px)`, transition: start.current == null ? 'transform .28s var(--ease-spring)' : 'none', touchAction: 'pan-y', background: 'var(--surface)' }}
      >
        {children}
      </div>
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

  function dateStr(offsetDays: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (items.length === 0) return;
    setSlotsLoading(true);
    (async () => {
      try {
        const todayRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(0)}`);
        if (!todayRes.ok) throw new Error('slots fetch failed');
        const todayData = await todayRes.json() as { slots: GrabitAvailableSlot[] };
        if (todayData.slots.length > 0) {
          setSlotsData({ slots: todayData.slots, label: null });
          return;
        }
        const tomorrowRes = await fetch(`/api/proxy/grabit/slots/${slug}?date=${dateStr(1)}`);
        const tomorrowData = tomorrowRes.ok
          ? await tomorrowRes.json() as { slots: GrabitAvailableSlot[] }
          : { slots: [] };
        setSlotsData({ slots: tomorrowData.slots, label: 'Tomorrow' });
      } catch {
        setSlotsData({ slots: [], label: null });
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [slug, items.length]);

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
        <TopBar title="Your order" onBack={() => router.push(`/${slug}`)} />
        <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface-container)', display: 'grid', placeItems: 'center', color: 'var(--muted-2)' }}>
            {Icon.bag({ size: 44, sw: 1.4 })}
          </div>
          <div>
            <div className="t-title">Your cart is empty</div>
            <div className="t-caption" style={{ marginTop: 6, maxWidth: 240 }}>Add a few things from the menu and pick a pickup slot.</div>
          </div>
          <Link href={`/${slug}`}><Button icon={Icon.menu({ size: 20 })}>Browse the menu</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative', paddingBottom: 188 }}>
      <TopBar title="Your order" onBack={() => router.push(`/${slug}`)} />

      <div style={{ padding: '6px 20px 0' }}>
        {/* Line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <SwipeRow key={item.menu_item_id} onDelete={() => updateQty(item.menu_item_id, 0)}>
              <Card style={{ display: 'flex', gap: 12, alignItems: 'center', boxShadow: 'none' }}>
                <Photo seed={item.menu_item_id} src={item.image_url || undefined} label={item.name} style={{ width: 56, height: 56, flex: 'none' }} radius="var(--r-md)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FoodMark veg size={13} /><span className="t-label">{item.name}</span></div>
                  <div className="t-price tabular" style={{ marginTop: 5, fontSize: 15 }}>{inr(item.price * item.quantity)}</div>
                </div>
                <QtyStepper value={item.quantity} onChange={(v) => updateQty(item.menu_item_id, v)} size="sm" />
              </Card>
            </SwipeRow>
          ))}
        </div>
        <div className="t-caption" style={{ textAlign: 'center', margin: '10px 0 18px' }}>Swipe a row left to remove</div>

        {/* Slot picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px', color: 'var(--primary)' }}>
          {Icon.clock({ size: 20 })}
          <span className="t-subtitle" style={{ color: 'var(--on-surface)' }}>Pickup slot</span>
          <span className="t-caption" style={{ marginLeft: 'auto' }}>
            5-min windows{slotsData?.label ? ` · ${slotsData.label}` : ''}
          </span>
        </div>
        {slotsLoading && <p className="t-caption">Loading slots…</p>}
        {!slotsLoading && slotsData?.slots.length === 0 && <p className="t-caption">No slots available. Try again tomorrow.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {slotsData?.slots.map(slot => {
            const full = slot.available_count === 0;
            const sel = selectedSlot === slot.slot_start;
            const minsFromNow = Math.round((new Date(slot.slot_start).getTime() - Date.now()) / 60000);
            const label = slotsData?.label
              ? new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : minsFromNow < 60 ? `${minsFromNow} mins` : `${Math.floor(minsFromNow / 60)}h ${minsFromNow % 60}m`;
            return (
              <button
                key={slot.slot_start}
                disabled={full}
                onClick={() => setSelectedSlot(slot.slot_start)}
                style={{
                  position: 'relative', padding: '11px 6px 9px', borderRadius: 'var(--r-md)', cursor: full ? 'not-allowed' : 'pointer',
                  border: `1px solid ${sel ? 'var(--primary)' : full ? 'var(--hairline)' : 'var(--hairline-strong)'}`,
                  background: sel ? 'var(--primary)' : full ? 'var(--surface-low)' : 'var(--surface-card)',
                  color: sel ? '#fff' : full ? 'var(--muted-2)' : 'var(--on-surface)', opacity: full ? 0.7 : 1,
                  animation: sel ? 'pop-in .26s var(--ease-spring)' : 'none', transition: 'border-color .15s, background .15s',
                }}
              >
                <div className="tabular" style={{ fontSize: 13.5, fontWeight: 700 }}>{label}</div>
                <div className="tabular" style={{ fontSize: 11, marginTop: 3, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.9)' : full ? 'var(--muted-2)' : slot.available_count <= 1 ? 'var(--warning)' : 'var(--success)' }}>
                  {full ? 'Full' : `${slot.available_count} left`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bill */}
        <div className="t-subtitle" style={{ margin: '24px 0 12px' }}>Bill summary</div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
            <span className="tabular" style={{ fontSize: 18, fontWeight: 700 }}>{inr(total())}</span>
          </div>
        </Card>
      </div>

      {/* Dock CTA */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', padding: '12px 20px 16px', background: 'linear-gradient(to top, var(--surface) 70%, transparent)' }}>
        <div style={{ marginBottom: 8 }}>
          {selectedSlot
            ? <div className="t-caption" style={{ textAlign: 'center', color: 'var(--on-surface)' }}>Pickup slot selected</div>
            : <div className="t-caption" style={{ textAlign: 'center', color: 'var(--warning)' }}>Pick a pickup slot to continue</div>}
        </div>
        <Button
          full
          disabled={!selectedSlot}
          onClick={() => { sessionStorage.setItem('grabit_slot', selectedSlot!); router.push(`/${slug}/checkout`); }}
          style={{ justifyContent: 'space-between' }}
        >
          <span className="tabular">{inr(total())}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Continue to Pay {Icon.chevR({ size: 18 })}</span>
        </Button>
      </div>
    </div>
  );
}
