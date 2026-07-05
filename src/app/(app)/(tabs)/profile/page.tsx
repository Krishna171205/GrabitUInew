'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { MS, NavSpacer } from '@/components/gb/kit';
import { USER, ph } from '@/components/gb/data';

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--gb-muted-2)', fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MenuRow({ icon, label, href, badge, last }: { icon: string; label: string; href?: string; badge?: string; last?: boolean }) {
  const inner: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderBottom: last ? 'none' : '1px solid #F5EFE6' }}>
      <MS name={icon} size={22} color="var(--gb-muted)" />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{label}</span>
      {badge && <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--gb-primary)', background: 'var(--gb-primary-soft)', padding: '3px 8px', borderRadius: 999 }}>{badge}</span>}
      <MS name="chevron_right" size={20} color="var(--gb-icon)" />
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function ProfilePage() {
  const router = useRouter();
  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    router.push('/home');
    router.refresh();
  };

  return (
    <div className="gb-shell">
      {/* header */}
      <div style={{ background: 'var(--gb-hero)', paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 58, color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 'calc(26px + env(safe-area-inset-top))', right: 22, display: 'flex', gap: 10 }}>
          <Link href="/notifications" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="notifications" size={20} /></Link>
          <Link href="/settings" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="settings" size={20} /></Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ width: 66, height: 66, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.4)', flex: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ph(USER.avatar)} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.05 }}>{USER.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', fontWeight: 500, marginTop: 3 }}>{USER.phone}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 7, background: 'rgba(255,255,255,.16)', padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
              <MS name="edit" size={15} />Edit profile
            </div>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 2, background: '#fff', borderRadius: 20, border: '1px solid var(--gb-line-2)', boxShadow: 'var(--gb-shadow-pop)', display: 'flex', padding: '16px 4px' }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--gb-line)' }}><Stat value="24" label="Orders" color="var(--gb-text)" /></div>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--gb-line)' }}><Stat value="3.5h" label="Time saved" color="var(--gb-green)" /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Stat value="8" label="Favourites" color="#C1502E" /></div>
      </div>

      {/* gold membership */}
      <div style={{ margin: '16px 16px 0', borderRadius: 20, padding: 18, background: 'linear-gradient(120deg,#2A1B10 0%,#8A5A00 55%,#FFB100 130%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MS name="workspace_premium" size={19} fill color="#F2D48A" />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2D48A' }}>Grabit Gold</span>
        </div>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 8, lineHeight: 1.25, maxWidth: 250 }}>Priority pickup & member-only prices</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.34)', color: '#F2D48A', fontSize: 12.5, fontWeight: 800, padding: '9px 15px', borderRadius: 11, letterSpacing: '.03em' }}>
          <MS name="schedule" size={16} />Coming soon
        </div>
      </div>

      {/* wallet */}
      <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F4EBDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <MS name="account_balance_wallet" size={23} fill color="var(--gb-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>Grabit Credits</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600 }}>Balance ₹150</div>
        </div>
        <div style={{ border: '1.5px solid #E7DCCC', color: 'var(--gb-primary)', fontSize: 13, fontWeight: 800, padding: '9px 14px', borderRadius: 11 }}>Add money</div>
      </div>

      {/* menu list */}
      <div style={{ margin: '20px 16px 16px', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden' }}>
        <MenuRow icon="receipt_long" label="Your orders" href="/orders" />
        <MenuRow icon="favorite" label="Favourites" />
        <MenuRow icon="local_offer" label="Offers & rewards" badge="3 new" />
        <MenuRow icon="help" label="Help & support" href="/support" last />
      </div>

      <button onClick={logout} style={{ width: 'calc(100% - 32px)', margin: '4px 16px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--gb-danger)', fontSize: 14, fontWeight: 800 }}>
        <MS name="logout" size={19} />Log out
      </button>
      <NavSpacer />
    </div>
  );
}
