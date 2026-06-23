'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/store/cart';
import { formatPaise } from '@/lib/utils';
import type { GrabitWallet } from '@gradient365/gradient-commons';
import { TopBar, Card, Button, Icon } from '@/components/ui/kit';

interface TopItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
  total_ordered: number;
}

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [cafeName, setCafeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromCart, setFromCart] = useState(false);
  const [wallet, setWallet] = useState<GrabitWallet | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('required') === '1') setFromCart(true);

    Promise.all([
      fetch('/api/proxy/grabit/auth/me'),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`)
    ])
      .then(([meRes, menuRes]) => {
        if (meRes.status === 401) { router.replace(`/${slug}/login`); throw new Error('unauth'); }
        return Promise.all([meRes.json(), menuRes.json()]);
      })
      .then(([meData, menuData]) => {
        setName(meData.name ?? '');
        setEmail(meData.email ?? '');
        setPhone(meData.phone ?? '');
        const cid = menuData?.cafe?.id;
        setCafeName(menuData?.cafe?.name ?? '');
        if (cid) {
          sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(cid));
          const topItemsPromise = fetch(`/api/proxy/grabit/orders/top-items?cafeId=${cid}`).then(r => r.json()).then(setTopItems);
          if (meData.id) {
            fetch(`/api/proxy/grabit/wallet/${meData.id}?cafeId=${cid}`)
              .then(r => r.ok ? r.json() : null)
              .then(wd => { if (wd?.wallet) setWallet(wd.wallet); })
              .catch(() => {});
          }
          return topItemsPromise;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/proxy/grabit/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (fromCart) router.replace(`/${slug}/cart`);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace(`/${slug}/login`);
  }

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)' }}>
      <p style={{ color: 'var(--muted)' }}>Loading…</p>
    </div>
  );

  const initials = name ? name.trim()[0].toUpperCase() : phone.slice(-2);
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, display: 'block' };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: 'var(--surface-card)',
    border: '1.5px solid var(--hairline-strong)', borderRadius: 'var(--r-md)',
    fontFamily: 'var(--font)', fontSize: 15, fontWeight: 500, outline: 'none', color: 'var(--on-surface)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
      <TopBar title="My Profile" onBack={() => router.push(`/${slug}`)} />

      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px 18px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800, flex: 'none' }}>{initials}</div>
        <div>
          <div className="t-title" style={{ fontSize: 20 }}>{name || 'Set your name'}</div>
          <div className="t-caption tabular" style={{ marginTop: 2 }}>+91 {phone}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Wallet widget */}
        {wallet !== null && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card style={{ background: 'var(--inverse-surface)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Wallet</div>
                <div className="tabular" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{formatPaise(wallet.base_balance_paise)}</div>
              </div>
              <Link href={`/${slug}/wallet`}><Button size="sm">Top Up</Button></Link>
            </Card>
          </motion.div>
        )}

        {/* Required banner */}
        {fromCart && (
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600 }}>
            Complete your profile to continue with your order
          </div>
        )}

        {/* Profile form */}
        <form onSubmit={saveProfile}>
          <label style={labelStyle}>Your name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required style={{ ...inputStyle, marginBottom: 16 }} />
          <label style={labelStyle}>Email *</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
            style={{ ...inputStyle, border: `1.5px solid ${email && !isValidEmail(email) ? 'var(--error)' : 'var(--hairline-strong)'}`, marginBottom: email && !isValidEmail(email) ? 4 : 16 }}
          />
          {email && !isValidEmail(email) && <p style={{ fontSize: 12, color: 'var(--error)', marginBottom: 16 }}>Enter a valid email address</p>}
          <label style={labelStyle}>Phone number</label>
          <div className="tabular" style={{ padding: '14px 16px', background: 'var(--surface-low)', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 500, color: 'var(--muted)', marginBottom: 16 }}>+91 {phone}</div>
          <Button type="submit" full disabled={saving || !name.trim() || !isValidEmail(email)}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : fromCart ? 'Save & continue to cart' : 'Save Profile'}
          </Button>
        </form>

        {/* Top orders */}
        {topItems.length > 0 && (
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div className="t-label" style={{ color: 'var(--muted)', padding: '14px 16px 4px', fontSize: 13 }}>Top orders at {cafeName || slug}</div>
            {topItems.map((item, i) => (
              <div key={item.menu_item_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--hairline)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', fontSize: 12, fontWeight: 800, flex: 'none', display: 'grid', placeItems: 'center' }}>{i + 1}</div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.menu_item_name}</span>
                <span className="t-caption tabular">{item.total_ordered}×</span>
                <Button size="sm" variant="tinted" onClick={() => addItem({ menu_item_id: item.menu_item_id, name: item.menu_item_name, price: item.price, quantity: 1, image_url: item.image_url }, slug)}>+ Add</Button>
              </div>
            ))}
          </Card>
        )}

        {/* Logout */}
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 24 }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--error)' }}>
            {Icon.logout({ size: 20 })}<span className="t-label" style={{ color: 'var(--error)' }}>Log out</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
