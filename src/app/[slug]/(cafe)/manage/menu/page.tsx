'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabitMenuItem } from '@gradient365/gradient-commons';
import { BottomTabs } from '../BottomTabs';

const CATEGORIES = ['drinks', 'food', 'specials', 'desserts'] as const;

export default function MenuManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [items, setItems] = useState<GrabitMenuItem[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'drinks', sort_order: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadItems(cid: number) {
    fetch(`/api/proxy/grabit/menu/cafe/${cid}`)
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }

  useEffect(() => {
    fetch('/api/proxy/grabit/auth/me')
      .then(r => {
        if (r.status === 401) { router.push(`/${slug}/manage/login`); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setCafeId(d.cafeId);
        loadItems(d.cafeId);
      });
  }, [slug, router]);

  async function toggleAvailability(itemId: number, currentValue: boolean) {
    await fetch(`/api/proxy/grabit/menu/item/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !currentValue }),
    });
    if (cafeId) loadItems(cafeId);
  }

  async function deleteItem(itemId: number) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/proxy/grabit/menu/item/${itemId}`, { method: 'DELETE' });
    if (cafeId) loadItems(cafeId);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!cafeId) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/proxy/grabit/menu/${cafeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description || null,
          price: parseFloat(newItem.price),
          category: newItem.category,
          sort_order: parseInt(newItem.sort_order) || 0,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowAddForm(false);
      setNewItem({ name: '', description: '', price: '', category: 'drinks', sort_order: '0' });
      loadItems(cafeId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add item');
    } finally {
      setSaving(false);
    }
  }

  const grouped = CATEGORIES.reduce<Record<string, GrabitMenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, GrabitMenuItem[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--g-surface)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--g-text)', color: '#fff', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0
      }}>
        <span style={{ fontSize: '17px', fontWeight: 700 }}>Menu</span>
        <button
          onClick={() => { setShowAddForm(v => !v); setError(''); }}
          style={{
            background: 'var(--g-amber)',
            color: '#fff',
            border: 'none',
            borderRadius: '980px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

      {/* Add item form */}
      {showAddForm && (
        <form
          onSubmit={addItem}
          style={{
            background: 'var(--g-amber-tint)',
            border: '1px solid var(--g-border)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--g-text)', margin: 0 }}>New Item</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--g-muted)', fontWeight: 500 }}>Name *</label>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
              style={inputStyle}
              placeholder="e.g. Cappuccino"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--g-muted)', fontWeight: 500 }}>Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                style={inputStyle}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--g-muted)', fontWeight: 500 }}>Category</label>
              <select
                value={newItem.category}
                onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                style={inputStyle}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--g-muted)', fontWeight: 500 }}>Description (optional)</label>
            <input
              type="text"
              value={newItem.description}
              onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
              style={inputStyle}
              placeholder="Short description"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--g-muted)', fontWeight: 500 }}>Sort Order</label>
            <input
              type="number"
              value={newItem.sort_order}
              onChange={e => setNewItem(p => ({ ...p, sort_order: e.target.value }))}
              style={inputStyle}
              placeholder="0"
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ff3b30', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? 'var(--g-muted)' : 'var(--g-amber)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setError(''); }}
              style={{
                background: 'var(--g-surface)',
                color: 'var(--g-text)',
                border: '1px solid var(--g-border)',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--g-muted)', fontSize: '15px' }}>Loading…</p>
      )}

      {/* Items grouped by category */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {CATEGORIES.map(cat => {
            const catItems = grouped[cat];
            if (!catItems || catItems.length === 0) return null;
            return (
              <div key={cat}>
                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--g-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#fff',
                        border: '1px solid var(--g-border)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        gap: '12px',
                      }}
                    >
                      {/* Left: name + price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--g-text)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--g-muted)', margin: 0 }}>₹{Number(item.price).toFixed(2)}</p>
                      </div>

                      {/* Right: toggle + delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          style={{
                            background: item.is_available ? '#34c759' : 'var(--g-surface)',
                            color: item.is_available ? '#fff' : 'var(--g-muted)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{
                            background: 'transparent',
                            color: '#ff3b30',
                            border: '1px solid rgba(255,59,48,0.2)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <p style={{ color: 'var(--g-muted)', fontSize: '15px', textAlign: 'center', padding: '32px 0' }}>
              No menu items yet. Add your first item above.
            </p>
          )}
        </div>
      )}
    </div>{/* end scrollable */}

      <BottomTabs slug={slug} active="menu" />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '14px',
  color: 'var(--g-text)',
  background: '#fff',
  border: '1px solid var(--g-border)',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
};

