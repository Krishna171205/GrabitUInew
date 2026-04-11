'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomTabs } from '../BottomTabs';

export default function SlotConfigPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [cafeId, setCafeId] = useState<number | null>(null);
  const [config, setConfig] = useState({
    opening_time: '08:00',
    closing_time: '22:00',
    cutoff_before_close_minutes: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/proxy/grabit/auth/me');
        if (res.status === 401) { router.push(`/${slug}/manage/login`); return; }
        const data = await res.json();
        setCafeId(data.cafeId);

        // Fetch current config
        const cfgRes = await fetch(`/api/proxy/grabit/slots/config/${data.cafeId}`);
        if (cfgRes.ok) {
          const cfg = await cfgRes.json();
          setConfig({
            opening_time: cfg.opening_time?.slice(0, 5) ?? '08:00',
            closing_time: cfg.closing_time?.slice(0, 5) ?? '22:00',
            cutoff_before_close_minutes: cfg.cutoff_before_close_minutes ?? 30,
          });
        }
      } catch {
        router.push(`/${slug}/manage/login`);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug, router]);

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!cafeId) return;
    setSaving(true);
    setError('');
    setSaved(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--g-surface)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--g-text)', color: '#fff', height: '52px',
        display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0
      }}>
        <span style={{ fontSize: '17px', fontWeight: 700 }}>Order Hours</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 40px' }}>
        {loading ? (
          <p style={{ color: 'var(--g-muted)' }}>Loading…</p>
        ) : (
          <form onSubmit={saveConfig}>
            {/* Start accepting orders */}
            <ConfigCard
              label="Start accepting orders"
              hint="Customers can start placing orders from this time"
            >
              <input
                type="time"
                value={config.opening_time}
                onChange={e => setConfig(p => ({ ...p, opening_time: e.target.value }))}
                style={timeInputStyle}
              />
            </ConfigCard>

            {/* Stop accepting orders */}
            <ConfigCard
              label="Stop accepting orders"
              hint="No new orders can be placed after this time"
            >
              <input
                type="time"
                value={config.closing_time}
                onChange={e => setConfig(p => ({ ...p, closing_time: e.target.value }))}
                style={timeInputStyle}
              />
            </ConfigCard>

            {/* Cutoff buffer */}
            <ConfigCard
              label="Stop bookings before close"
              hint={`No new orders within the last ${config.cutoff_before_close_minutes} minutes of closing`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="button" onClick={() => setConfig(p => ({ ...p, cutoff_before_close_minutes: Math.max(0, p.cutoff_before_close_minutes - 5) }))} style={stepBtn}>−</button>
                <span style={{ fontSize: '28px', fontWeight: 800, minWidth: '48px', textAlign: 'center' }}>
                  {config.cutoff_before_close_minutes}
                </span>
                <button type="button" onClick={() => setConfig(p => ({ ...p, cutoff_before_close_minutes: Math.min(120, p.cutoff_before_close_minutes + 5) }))} style={stepBtn}>+</button>
                <span style={{ fontSize: '14px', color: 'var(--g-muted)', fontWeight: 500 }}>minutes</span>
              </div>
            </ConfigCard>

            {error && <p style={{ color: '#d93025', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
            {saved && <p style={{ color: '#1a8a3c', fontSize: '14px', marginBottom: '12px' }}>Saved ✓</p>}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: '14px',
                background: saving ? 'rgba(255,107,0,0.6)' : 'var(--g-amber)',
                color: '#fff', fontSize: '16px', fontWeight: 700,
                border: 'none', borderRadius: '999px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      <BottomTabs slug={slug} active="slots" />
    </div>
  );
}

function ConfigCard({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 16px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '12px' }}>
        {label}
      </p>
      {children}
      <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginTop: '8px' }}>{hint}</p>
    </div>
  );
}

const timeInputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', fontSize: '22px', fontWeight: 700,
  border: '1.5px solid var(--g-border)', borderRadius: '10px',
  background: 'var(--g-surface)', color: 'var(--g-text)',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

const stepBtn: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%',
  border: '1.5px solid var(--g-border)', background: 'var(--g-surface)',
  fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

