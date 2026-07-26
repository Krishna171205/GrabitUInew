'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MS, NavSpacer } from '@/components/gb/kit';
import { formatPaise } from '@/lib/utils';
import type { RealCafe } from '@/components/gb/cards';

interface Me { customerId: number; name: string | null; email: string | null; phone: string; avatar_url: string | null; }
interface Wallet { base_balance_paise: number; }

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
  const [me, setMe] = useState<Me | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [primaryCafe, setPrimaryCafe] = useState<RealCafe | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/grabit/auth/me').then((r) => (r.ok ? r.json() : null)),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([meData, cafes]: [Me | null, RealCafe[]]) => {
      if (meData) { setMe(meData); setName(meData.name ?? ''); setEmail(meData.email ?? ''); }
      const cafe = cafes[0];
      setPrimaryCafe(cafe);
      if (meData?.customerId && cafe) {
        fetch(`/api/proxy/grabit/wallet/${meData.customerId}?cafeId=${cafe.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((wd) => { if (wd?.wallet) setWallet(wd.wallet); })
          .catch(() => {});
      }
    });
  }, []);

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true); setAvatarError('');
    try {
      const presignRes = await fetch(`/api/proxy/grabit/auth/avatar/presign?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, { method: 'POST' });
      if (!presignRes.ok) throw new Error('Could not start upload');
      const { uploadUrl, publicUrl } = await presignRes.json();

      const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putRes.ok) throw new Error('Upload failed');

      const saveRes = await fetch('/api/proxy/grabit/auth/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });
      if (!saveRes.ok) throw new Error('Could not save photo');
      setMe((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setUploadingAvatar(false);
    }
  }

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    router.push('/home');
    router.refresh();
  };

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !isValidEmail(email)) return;
    setSaving(true);
    try {
      await fetch('/api/proxy/grabit/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      setMe((prev) => (prev ? { ...prev, name: name.trim(), email: email.trim() } : prev));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const displayName = me?.name?.trim() || 'Set your name';
  const initial = (me?.name?.trim()?.[0] || me?.phone?.slice(-1) || '?').toUpperCase();

  return (
    <div className="gb-shell">
      {/* header */}
      <div style={{ background: 'var(--gb-hero)', paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 58, color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 'calc(26px + env(safe-area-inset-top))', right: 22, display: 'flex', gap: 10 }}>
          <Link href="/notifications" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="notifications" size={20} /></Link>
          <Link href="/settings" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="settings" size={20} /></Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ position: 'relative', width: 66, height: 66, flex: 'none' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, background: 'rgba(255,255,255,.16)' }}>
              {me?.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={me.avatar_url} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : initial}
            </div>
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile picture"
              style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploadingAvatar ? 'wait' : 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}
            >
              <MS name={uploadingAvatar ? 'hourglass_empty' : 'photo_camera'} size={14} color="var(--gb-primary)" />
            </button>
            <input
              ref={fileInput} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }}
            />
          </div>
          <div>
            <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.05 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', fontWeight: 500, marginTop: 3 }}>{me ? `+91 ${me.phone}` : ''}</div>
            <button onClick={() => setEditing((v) => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 7, background: 'rgba(255,255,255,.16)', padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, border: 'none', color: '#fff', cursor: 'pointer' }}>
              <MS name="edit" size={15} />Edit profile
            </button>
          </div>
        </div>
        {avatarError && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: '#FFD9CF' }}>{avatarError}</div>}
      </div>

      {/* edit profile form */}
      {editing && (
        <form onSubmit={saveProfile} style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 16 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted-2)', display: 'block', marginBottom: 6 }}>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--gb-line-2)', borderRadius: 12, fontSize: 14.5, fontWeight: 500, marginBottom: 12, boxSizing: 'border-box' }} />
          <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted-2)', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--gb-line-2)', borderRadius: 12, fontSize: 14.5, fontWeight: 500, marginBottom: 14, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving || !name.trim() || !isValidEmail(email)} style={{ flex: 1, background: 'var(--gb-ink)', color: '#fff', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, background: '#fff', border: '1.5px solid var(--gb-line-2)', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

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

      {/* wallet — real balance for the customer's one live cafe */}
      {primaryCafe && (
        <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F4EBDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <MS name="account_balance_wallet" size={23} fill color="var(--gb-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>Grabit Credits</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600 }}>Balance {wallet ? formatPaise(wallet.base_balance_paise) : '₹0'}</div>
          </div>
          <Link href={`/${primaryCafe.slug}/wallet`} style={{ border: '1.5px solid #E7DCCC', color: 'var(--gb-primary)', fontSize: 13, fontWeight: 800, padding: '9px 14px', borderRadius: 11 }}>Add money</Link>
        </div>
      )}

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
