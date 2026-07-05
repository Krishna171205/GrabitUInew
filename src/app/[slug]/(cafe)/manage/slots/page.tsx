'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCafeId } from '../../CafeProvider';
import { StaffChrome, Button, Icon } from '@/components/ui/kit';

interface SlotConfig {
  opening_time: string;
  closing_time: string;
  slot_duration_minutes: number;
  max_orders_per_slot: number;
  min_advance_minutes: number;
  cutoff_before_close_minutes: number;
}

const DEFAULTS: SlotConfig = {
  opening_time: '08:00',
  closing_time: '22:00',
  slot_duration_minutes: 15,
  max_orders_per_slot: 5,
  min_advance_minutes: 20,
  cutoff_before_close_minutes: 30,
};

export default function SlotConfigPage() {
  const { slug } = useParams<{ slug: string }>();
  const cafeId = useCafeId();

  const [config, setConfig] = useState<SlotConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cafeId) return;
    async function loadConfig() {
      try {
        const cfgRes = await fetch(`/api/proxy/grabit/slots/config/${cafeId}`);
        if (cfgRes.ok) {
          const cfg = await cfgRes.json();
          setConfig({
            opening_time: cfg.opening_time?.slice(0, 5) ?? DEFAULTS.opening_time,
            closing_time: cfg.closing_time?.slice(0, 5) ?? DEFAULTS.closing_time,
            slot_duration_minutes: cfg.slot_duration_minutes ?? DEFAULTS.slot_duration_minutes,
            max_orders_per_slot: cfg.max_orders_per_slot ?? DEFAULTS.max_orders_per_slot,
            min_advance_minutes: cfg.min_advance_minutes ?? DEFAULTS.min_advance_minutes,
            cutoff_before_close_minutes: cfg.cutoff_before_close_minutes ?? DEFAULTS.cutoff_before_close_minutes,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [cafeId]);

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!cafeId) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`/api/proxy/grabit/slots/config/${cafeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function step(key: keyof SlotConfig, delta: number, min: number, max: number) {
    setConfig(p => ({ ...p, [key]: Math.min(max, Math.max(min, (p[key] as number) + delta)) }));
  }

  const totalSlots = Math.round(
    ((parseInt(config.closing_time) - parseInt(config.opening_time)) * 60) / config.slot_duration_minutes
  );

  return (
    <StaffChrome
      slug={slug}
      active="slots"
      title="Slot configuration"
      sub={`${Number.isFinite(totalSlots) && totalSlots > 0 ? totalSlots : '-'} pickup windows/day · ${config.max_orders_per_slot} each`}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 40px' }}>
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <form onSubmit={saveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Operating hours */}
            <Panel title="Operating hours" icon={Icon.clock}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Field label="Start accepting orders" hint="Customers can book pickup slots from this time">
                  <input type="time" value={config.opening_time}
                    onChange={e => setConfig(p => ({ ...p, opening_time: e.target.value }))}
                    style={timeInputStyle} />
                </Field>
                <Field label="Stop accepting orders" hint="No new orders after this time">
                  <input type="time" value={config.closing_time}
                    onChange={e => setConfig(p => ({ ...p, closing_time: e.target.value }))}
                    style={timeInputStyle} />
                </Field>
              </div>
            </Panel>

            {/* Slot rules */}
            <Panel title="Slot rules" icon={Icon.slots}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <RuleRow label="Slot duration" desc="Length of each pickup window">
                  <Stepper value={config.slot_duration_minutes} unit="min"
                    onDec={() => step('slot_duration_minutes', -5, 5, 60)}
                    onInc={() => step('slot_duration_minutes', 5, 5, 60)} />
                </RuleRow>
                <RuleRow label="Max orders per slot" desc="How many orders can share one window">
                  <Stepper value={config.max_orders_per_slot} unit="orders"
                    onDec={() => step('max_orders_per_slot', -1, 1, 50)}
                    onInc={() => step('max_orders_per_slot', 1, 1, 50)} />
                </RuleRow>
                <RuleRow label="Minimum advance booking" desc="Earliest a customer can pick up from now">
                  <Stepper value={config.min_advance_minutes} unit="min"
                    onDec={() => step('min_advance_minutes', -5, 0, 120)}
                    onInc={() => step('min_advance_minutes', 5, 0, 120)} />
                </RuleRow>
                <RuleRow label="Stop bookings before close" desc={`No new orders within last ${config.cutoff_before_close_minutes} min of closing`}>
                  <Stepper value={config.cutoff_before_close_minutes} unit="min"
                    onDec={() => step('cutoff_before_close_minutes', -5, 0, 120)}
                    onInc={() => step('cutoff_before_close_minutes', 5, 0, 120)} />
                </RuleRow>
              </div>
            </Panel>

            {error && <p style={{ color: 'var(--error)', fontSize: 14 }}>{error}</p>}
            {saved && <p style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>Saved ✓</p>}

            <Button type="submit" disabled={saving} full size="lg">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        )}
      </div>
    </StaffChrome>
  );
}

function Panel({ title, icon, children }: { title: string; icon: (typeof Icon)[string]; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-card)', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
        <span style={{ color: 'var(--primary)' }}>{icon({ size: 20 })}</span>
        <span className="t-headline-card" style={{ fontSize: 16 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div className="t-label" style={{ fontSize: 14 }}>{label}</div>
      <div className="t-caption" style={{ margin: '3px 0 11px' }}>{hint}</div>
      {children}
    </div>
  );
}

function RuleRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <div className="t-label" style={{ fontSize: 14 }}>{label}</div>
        <div className="t-caption" style={{ marginTop: 3 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Stepper({ value, unit, onDec, onInc }: { value: number; unit: string; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <button type="button" onClick={onDec} style={stepBtn}>{Icon.minus({ size: 18 })}</button>
      <span className="tabular" style={{ minWidth: 52, textAlign: 'center', fontSize: 22, fontWeight: 800 }}>{value}</span>
      <button type="button" onClick={onInc} style={stepBtn}>{Icon.plus({ size: 18 })}</button>
      <span className="t-caption" style={{ minWidth: 44 }}>{unit}</span>
    </div>
  );
}

const timeInputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', fontSize: 22, fontWeight: 700,
  border: '1px solid var(--hairline-strong)', borderRadius: 'var(--r-sm)',
  background: 'var(--surface)', color: 'var(--on-surface)',
  outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box',
};

const stepBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 'var(--r-sm)',
  border: '1px solid var(--hairline-strong)', background: 'var(--surface-card)',
  color: 'var(--primary)', cursor: 'pointer',
  display: 'grid', placeItems: 'center',
};
