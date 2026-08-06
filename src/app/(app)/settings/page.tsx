'use client';
import { useState } from 'react';
import { MS, TopBar, Eyebrow } from '@/components/gb/kit';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 44, height: 26, borderRadius: 999, position: 'relative', flex: 'none', border: 'none', cursor: 'pointer', background: on ? 'var(--gb-primary)' : '#DAD0C2', transition: 'background .2s' }}
      aria-pressed={on}
    >
      <span style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', left: on ? 21 : 3, transition: 'left .2s var(--ease-spring, ease)' }} />
    </button>
  );
}

const card = { background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden' } as const;
const row = (last?: boolean) => ({ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', borderBottom: last ? 'none' : '1px solid #F5EFE6' } as const);

function ToggleRow({ icon, title, sub, value, onChange, last }: { icon: string; title: string; sub?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={row(last)}>
      <MS name={icon} size={22} color="var(--gb-muted)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600 }}>{sub}</div>}
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

function NavRow({ icon, label, value, last }: { icon: string; label: string; value?: string; last?: boolean }) {
  return (
    <div style={row(last)}>
      <MS name={icon} size={22} color="var(--gb-muted)" />
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: 'var(--gb-muted-2)', fontWeight: 700 }}>{value}</span>}
      <MS name="chevron_right" size={20} color="var(--gb-icon)" />
    </div>
  );
}

export default function SettingsPage() {
  const [orderUpd, setOrderUpd] = useState(true);
  const [promos, setPromos] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <div className="gb-shell">
      <TopBar title="Settings" />
      <div style={{ padding: '6px 16px 30px' }}>
        <Eyebrow style={{ padding: '16px 4px 8px' }}>Notifications</Eyebrow>
        <div style={card}>
          <ToggleRow icon="notifications" title="Order updates" sub="Pickup & preparation alerts" value={orderUpd} onChange={setOrderUpd} />
          <ToggleRow icon="local_offer" title="Offers & promos" sub="Deals from cafés you love" value={promos} onChange={setPromos} />
          <ToggleRow icon="mail" title="Email newsletter" sub="Weekly picks & new cafés" value={newsletter} onChange={setNewsletter} last />
        </div>

        <Eyebrow style={{ padding: '20px 4px 8px' }}>Preferences</Eyebrow>
        <div style={card}>
          <NavRow icon="translate" label="Language" value="English" />
          <ToggleRow icon="dark_mode" title="Dark mode" value={dark} onChange={setDark} />
          <NavRow icon="location_on" label="Location" value="MG Road" last />
        </div>

        <Eyebrow style={{ padding: '20px 4px 8px' }}>Account</Eyebrow>
        <div style={card}>
          <NavRow icon="lock" label="Privacy & security" />
          <NavRow icon="description" label="Terms & policies" last />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gb-faint-2)', fontWeight: 600, marginTop: 22 }}>Grabbit · version 1.0.0</div>
      </div>
    </div>
  );
}
