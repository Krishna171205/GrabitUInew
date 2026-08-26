'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { MS, NavSpacer } from '@/components/gb/kit';
import { GeneratedAvatar } from '@/components/gb/GeneratedAvatar';
import { isRealOrder } from '@/components/gb/orders';
import { StreakCard } from '@/components/gb/StreakCard';
import type { RealCafe } from '@/components/gb/cards';
import type { StreakView } from '@/types/grabbit';

interface Me { customerId: number; name: string | null; email: string | null; phone: string; avatar_url: string | null; }
interface OrderView { status: string; payment_method: string; payment_status: string; total_amount: number; created_at: string; }


/**
 * Index of the local calendar week (Monday to Sunday) a timestamp falls in.
 * The old version bucketed on floor(epoch / 7 days), which is a Thursday-to-Wednesday
 * UTC window, so "this week" rarely matched the week the customer is living in.
 */
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
  const [primaryCafe, setPrimaryCafe] = useState<RealCafe | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [streak, setStreak] = useState<StreakView | null>(null);
  const [favouritesCount, setFavouritesCount] = useState<number | null>(null);
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
      if (meData?.customerId) {
        // Everything saved, across every cafe. The old per-cafe call only ever
        // counted the first cafe in the list.
        fetch('/api/proxy/grabit/favorites/mine')
          .then((r) => (r.ok ? r.json() : { items: [], cafes: [] }))
          .then((favs: { items: unknown[]; cafes: unknown[] }) =>
            setFavouritesCount((favs.items?.length ?? 0) + (favs.cafes?.length ?? 0)))
          .catch(() => setFavouritesCount(0));
      }
      if (meData?.customerId) {
        fetch('/api/proxy/grabit/orders/mine')
          .then((r) => (r.ok ? r.json() : []))
          .then((orders: OrderView[]) => {
            // Same rule as the Orders tab: an abandoned or failed online checkout is
            // not an order. Counting those kept the streak alive without any order.
            setOrdersCount(orders.filter(isRealOrder).length);
          })
          .catch(() => setOrdersCount(0));
        // Derived server-side over the whole history, in the cafe's timezone: the browser
        // saw only the last 50 orders and judged the week by the device clock.
        fetch('/api/proxy/grabit/streak/mine')
          .then((r) => (r.ok ? r.json() : null))
          .then((v: StreakView | null) => setStreak(v))
          .catch(() => setStreak(null));
      }
    });
  }, []);

  // One retry on a network-level failure (fetch throwing rather than a clean
  // HTTP error) — the direct-to-S3 PUT is a single flaky connection with no
  // server-side fallback, and a transient blip there shouldn't fail the upload.
  async function putWithRetry(url: string, file: File) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      } catch (e) {
        if (attempt > 0) throw e;
      }
    }
  }

  /**
   * Shrink the picked photo before uploading. A phone camera JPEG is several MB
   * and this renders at 44-66px, so the full-resolution original is wasted
   * upload time on mobile and wasted storage forever. Re-encoding through a
   * canvas also normalises HEIC (which iOS hands over) to JPEG.
   * Returns the original file if the browser cannot decode it.
   */
  async function downscaleImage(file: File, maxDim = 512, quality = 0.85): Promise<File> {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      return file;
    }
    try {
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
      if (!blob) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    } finally {
      bitmap.close();
    }
  }

  async function uploadAvatar(original: File) {
    setUploadingAvatar(true); setAvatarError('');
    try {
      if (!original.type.startsWith('image/')) throw new Error('Not an image');
      const file = await downscaleImage(original);

      const presignRes = await fetch(`/api/proxy/grabit/auth/avatar/presign?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, { method: 'POST' });
      if (!presignRes.ok) throw new Error('Could not start upload');
      const { uploadUrl, publicUrl } = await presignRes.json();

      const putRes = await putWithRetry(uploadUrl, file);
      if (!putRes.ok) throw new Error('Upload failed');

      const saveRes = await fetch('/api/proxy/grabit/auth/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });
      if (!saveRes.ok) throw new Error('Could not save photo');
      setMe((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (e) {
      // The user gets a generic message (the raw error can carry the S3 bucket
      // hostname), but the real one has to reach us or the failure is invisible:
      // a browser fetch to S3 that 403s reports only "Load failed", because S3
      // omits CORS headers on error responses.
      console.error('avatar upload failed', e);
      Sentry.captureException(e, { tags: { feature: 'avatar-upload' } });
      setAvatarError('Could not upload photo. Please try again.');
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
    <div className="gb-shell gb-shell-read gb-profile">
      {/* Who you are, and the streak that depends on you coming back: on a laptop
          these become the left column, so the espresso panel anchors the page
          instead of being a band across the top of a phone-width strip. */}
      <div className="gb-profile-side">
      {/* header */}
      <div style={{ background: 'var(--gb-hero)', paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 58, color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 'calc(26px + env(safe-area-inset-top))', right: 22, display: 'flex', gap: 10 }}>
          <Link href="/notifications" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="notifications" size={20} /></Link>
          <Link href="/settings" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="settings" size={20} /></Link>
        </div>
        <div className="gb-id-row" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ position: 'relative', width: 66, height: 66, flex: 'none' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, background: 'rgba(255,255,255,.16)' }}>
              {me?.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={me.avatar_url} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <GeneratedAvatar seed={me?.name?.trim() || me?.phone || initial} size={66} />}
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

      <div className="gb-streak-slot" style={{ margin: '-30px 0 0', position: 'relative', zIndex: 2 }}>
        <StreakCard streak={streak} slug={primaryCafe?.slug} />
      </div>
      </div>

      <div className="gb-profile-main">
      {/* stats */}
      <div style={{ margin: '14px 16px 0', position: 'relative', zIndex: 1, background: '#fff', borderRadius: 20, border: '1px solid var(--gb-line-2)', boxShadow: 'var(--gb-shadow-pop)', display: 'flex', padding: '16px 4px' }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--gb-line)' }}><Stat value={ordersCount === null ? '—' : String(ordersCount)} label="Orders" color="var(--gb-text)" /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Stat value={favouritesCount === null ? '—' : String(favouritesCount)} label="Favourites" color="#C1502E" /></div>
      </div>

      {/* wallet — top-up not live yet */}
      {primaryCafe && (
        <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F4EBDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <MS name="account_balance_wallet" size={23} fill color="var(--gb-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>Grabbit Credits</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600 }}>Pay from your balance, soon</div>
          </div>
          {/* Wallet top-up is not live yet, so no Add money entry point. */}
          <span style={{ border: '1.5px solid var(--gb-line-2)', color: 'var(--gb-muted-2)', fontSize: 12.5, fontWeight: 800, padding: '9px 14px', borderRadius: 11 }}>Coming soon</span>
        </div>
      )}

      {/* menu list */}
      <div style={{ margin: '20px 16px 16px', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden' }}>
        <MenuRow icon="receipt_long" label="Your orders" href="/orders" />
        <MenuRow icon="favorite" label="Favourites" href="/favourites" />
        <MenuRow icon="local_offer" label="Offers" href="/offers" />
        <MenuRow icon="help" label="Help & support" href="/support" last />
      </div>

      <button onClick={logout} style={{ width: 'calc(100% - 32px)', margin: '4px 16px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--gb-danger)', fontSize: 14, fontWeight: 800 }}>
        <MS name="logout" size={19} />Log out
      </button>
      </div>

      <NavSpacer />
    </div>
  );
}
