'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCafeId } from '../../CafeProvider';
import type { GrabbitMenuItem, GrabbitMenuSubcategory } from '@gradient365/gradient-commons';
import { StaffChrome, Button, Toggle, Icon } from '@/components/ui/kit';

const CATEGORIES = ['drinks', 'food', 'specials', 'desserts'] as const;

export default function MenuManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const cafeId = useCafeId();

  const [items, setItems] = useState<GrabbitMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'drinks', subcategory_id: '', prep_time_minutes: '5' });
  const [subcategories, setSubcategories] = useState<GrabbitMenuSubcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [creatingSubcategory, setCreatingSubcategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadItems(cid: number) {
    fetch(`/api/proxy/grabit/menu/cafe/${cid}`)
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }

  function loadSubcategories(cid: number, category: string) {
    fetch(`/api/proxy/grabit/menu/${cid}/subcategories?category=${category}`)
      .then(r => r.json())
      .then(data => setSubcategories(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    if (!cafeId) return;
    loadItems(cafeId);
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    loadSubcategories(cafeId, newItem.category);
  }, [cafeId, newItem.category]);

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

  async function createSubcategory() {
    if (!cafeId || !newSubcategoryName.trim()) return;
    setCreatingSubcategory(true); setError('');
    try {
      const res = await fetch(`/api/proxy/grabit/menu/${cafeId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newItem.category, name: newSubcategoryName.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create subcategory'); }
      const created: GrabbitMenuSubcategory = await res.json();
      setSubcategories(prev => [...prev, created]);
      setNewItem(p => ({ ...p, subcategory_id: String(created.id) }));
      setNewSubcategoryName('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create subcategory');
    } finally {
      setCreatingSubcategory(false);
    }
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
          subcategory_id: newItem.subcategory_id ? parseInt(newItem.subcategory_id) : null,
          prep_time_minutes: parseInt(newItem.prep_time_minutes) || 5,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowAddForm(false);
      setNewItem({ name: '', description: '', price: '', category: 'drinks', subcategory_id: '', prep_time_minutes: '5' });
      loadItems(cafeId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add item');
    } finally {
      setSaving(false);
    }
  }

  const grouped = useMemo(
    () => CATEGORIES.reduce<Record<string, GrabbitMenuItem[]>>((acc, cat) => {
      acc[cat] = items.filter(i => i.category === cat);
      return acc;
    }, {} as Record<string, GrabbitMenuItem[]>),
    [items]
  );

  const liveCount = items.filter(i => i.is_available).length;

  return (
    <StaffChrome
      slug={slug}
      active="menumgmt"
      title="Menu"
      sub={`${liveCount} of ${items.length} items in stock`}
      right={
        <Button size="md" icon={Icon.plus({ size: 18 })} onClick={() => { setShowAddForm(v => !v); setError(''); }}>
          {showAddForm ? 'Cancel' : 'Add item'}
        </Button>
      }
    >
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 16 }}>
        {/* Add item form */}
        {showAddForm && (
          <form
            onSubmit={addItem}
            style={{
              background: 'var(--surface-card)', border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)',
              padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <p className="t-headline-card" style={{ fontSize: 16 }}>New item</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Name *</label>
              <input type="text" required value={newItem.name}
                onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} placeholder="e.g. Cappuccino" />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Price (₹) *</label>
                <input type="number" required min="0" step="0.01" value={newItem.price}
                  onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                  style={inputStyle} placeholder="0.00" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Category</label>
                <select value={newItem.category}
                  onChange={e => setNewItem(p => ({ ...p, category: e.target.value, subcategory_id: '' }))}
                  style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Description (optional)</label>
              <input type="text" value={newItem.description}
                onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                style={inputStyle} placeholder="Short description" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Subcategory</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newItem.subcategory_id}
                  onChange={e => setNewItem(p => ({ ...p, subcategory_id: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}>
                  <option value="">No subcategory</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input type="text" value={newSubcategoryName}
                  onChange={e => setNewSubcategoryName(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} placeholder="+ New subcategory name" />
                <Button type="button" size="sm" disabled={creatingSubcategory || !newSubcategoryName.trim()} onClick={createSubcategory}>
                  {creatingSubcategory ? 'Adding…' : 'Add'}
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Prep time (min)</label>
              <input type="number" min="1" max="120" value={newItem.prep_time_minutes}
                onChange={e => setNewItem(p => ({ ...p, prep_time_minutes: e.target.value }))}
                style={inputStyle} placeholder="5" />
            </div>

            {error && <p style={{ fontSize: 13, color: 'var(--error)', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit" disabled={saving} size="md">{saving ? 'Adding…' : 'Add'}</Button>
              <Button type="button" variant="secondary" size="md" onClick={() => { setShowAddForm(false); setError(''); }}>Cancel</Button>
            </div>
          </form>
        )}

        {loading && <p style={{ color: 'var(--muted)', fontSize: 15 }}>Loading…</p>}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {CATEGORIES.map(cat => {
              const catItems = grouped[cat];
              if (!catItems || catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span className="t-subtitle">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <span className="t-caption">{catItems.length} items</span>
                  </div>
                  <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                    {catItems.map((item, i) => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                        borderTop: i ? '1px solid var(--hairline)' : 'none',
                        opacity: item.is_available ? 1 : 0.62,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="t-label" style={{ fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p className="t-caption tabular" style={{ marginTop: 3 }}>
                            ₹{Number(item.price).toFixed(2)} · {item.prep_time_minutes ?? 5}m prep
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 76, flexShrink: 0 }}>
                          <Toggle on={item.is_available} onChange={() => toggleAvailability(item.id, item.is_available)} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: item.is_available ? 'var(--success)' : 'var(--muted)' }}>
                            {item.is_available ? 'In stock' : 'Sold out'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          aria-label="Delete item"
                          style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline-strong)', background: 'var(--surface-card)', color: 'var(--error)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                        >{Icon.trash({ size: 17 })}</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 15, textAlign: 'center', padding: '32px 0' }}>
                No menu items yet. Add your first item above.
              </p>
            )}
          </div>
        )}
      </div>
    </StaffChrome>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--muted)', fontWeight: 500 };

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 14,
  fontFamily: 'var(--font)',
  color: 'var(--on-surface)',
  background: 'var(--surface)',
  border: '1px solid var(--hairline-strong)',
  borderRadius: 'var(--r-sm)',
  outline: 'none',
  boxSizing: 'border-box',
};
