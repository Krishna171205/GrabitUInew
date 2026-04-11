'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromCart, setFromCart] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('required') === '1') setFromCart(true);

    fetch('/api/proxy/grabit/auth/me')
      .then(r => { if (r.status === 401) { router.replace(`/${slug}/login`); throw new Error('unauth'); } return r.json(); })
      .then(d => {
        setName(d.name ?? '');
        setEmail(d.email ?? '');
        setPhone(d.phone ?? '');
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`).then(r => r.json());
      })
      .then(menuData => {
        const cid = menuData?.cafe?.id;
        if (cid) {
          return fetch(`/api/proxy/grabit/orders/top-items?cafeId=${cid}`).then(r => r.json()).then(setTopItems);
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
      // If redirected here from cart, go back to cart
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: 'var(--g-muted)' }}>Loading…</p>
    </div>
  );

  const initials = name ? name.trim()[0].toUpperCase() : phone.slice(-2);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--g-white)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 20px', borderBottom: '1px solid var(--g-border)',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <Link href={`/${slug}`} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g-amber)', textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em' }}>My Profile</span>
      </div>

      {/* Avatar hero */}
      <div style={{ background: 'var(--g-amber-tint)', padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--g-amber)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 800, flexShrink: 0
        }}>{initials}</div>
        <div>
          <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em' }}>{name || 'Set your name'}</p>
          <p style={{ fontSize: '13px', color: 'var(--g-muted)', marginTop: '2px' }}>+91 {phone}</p>
        </div>
      </div>

      {/* Required banner */}
      {fromCart && (
        <div style={{ background: 'var(--g-amber)', color: '#fff', padding: '12px 20px', fontSize: '13px', fontWeight: 600 }}>
          Complete your profile to continue with your order
        </div>
      )}

      {/* Profile form */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--g-border)' }}>
        <form onSubmit={saveProfile}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '10px' }}>
            Your Name <span style={{ color: '#ff3b30' }}>*</span>
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            required
            style={{
              width: '100%', padding: '14px 16px', background: 'var(--g-surface)',
              border: '2px solid var(--g-border)', borderRadius: '12px',
              fontFamily: 'inherit', fontSize: '15px', fontWeight: 500,
              outline: 'none', color: 'var(--g-text)', marginBottom: '16px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '10px' }}>
            Email <span style={{ color: '#ff3b30' }}>*</span>
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: '100%', padding: '14px 16px', background: 'var(--g-surface)',
              border: `2px solid ${email && !isValidEmail(email) ? '#ff3b30' : 'var(--g-border)'}`,
              borderRadius: '12px', fontFamily: 'inherit', fontSize: '15px', fontWeight: 500,
              outline: 'none', color: 'var(--g-text)', marginBottom: email && !isValidEmail(email) ? '4px' : '16px',
              boxSizing: 'border-box'
            }}
          />
          {email && !isValidEmail(email) && (
            <p style={{ fontSize: '12px', color: '#ff3b30', marginBottom: '16px' }}>
              Enter a valid email address
            </p>
          )}
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '10px' }}>
            Phone Number
          </p>
          <div style={{
            padding: '14px 16px', background: 'var(--g-surface)', borderRadius: '12px',
            fontSize: '15px', fontWeight: 500, color: 'var(--g-muted)', marginBottom: '16px'
          }}>+91 {phone}</div>

          <button
            type="submit"
            disabled={saving || !name.trim() || !isValidEmail(email)}
            style={{
              width: '100%', padding: '14px', background: 'var(--g-amber)', color: '#fff',
              border: 'none', borderRadius: '980px', fontFamily: 'inherit',
              fontSize: '15px', fontWeight: 700,
              cursor: (saving || !name.trim() || !isValidEmail(email)) ? 'not-allowed' : 'pointer',
              opacity: (saving || !name.trim() || !isValidEmail(email)) ? 0.6 : 1
            }}
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : fromCart ? 'Save & continue to cart' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Top orders */}
      {topItems.length > 0 && (
        <div style={{ padding: '20px', borderBottom: '1px solid var(--g-border)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '12px' }}>
            Top Orders at {slug}
          </p>
          {topItems.map((item, i) => (
            <div key={item.menu_item_id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 0', borderBottom: '1px solid var(--g-border)'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--g-amber-tint)', color: 'var(--g-amber)',
                fontSize: '12px', fontWeight: 800, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{i + 1}</div>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>{item.menu_item_name}</span>
              <span style={{ fontSize: '12px', color: 'var(--g-muted)' }}>{item.total_ordered}×</span>
              <button
                onClick={() => addItem({ menu_item_id: item.menu_item_id, name: item.menu_item_name, price: item.price, quantity: 1, image_url: item.image_url }, slug)}
                style={{
                  padding: '6px 14px', background: 'var(--g-amber-pale)', color: 'var(--g-amber)',
                  border: 'none', borderRadius: '980px', fontFamily: 'inherit',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                }}>+ Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '20px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '14px', background: 'none',
            border: '2px solid var(--g-red)', color: 'var(--g-red)',
            borderRadius: '980px', fontFamily: 'inherit', fontSize: '14px',
            fontWeight: 700, cursor: 'pointer'
          }}>Log out</button>
      </div>
    </div>
  );
}
