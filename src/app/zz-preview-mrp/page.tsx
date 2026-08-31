'use client';
import { useState } from 'react';
import { CustomizeSheet } from '@/components/gb/CustomizeSheet';
import type { GrabbitMenuItem } from '@/types/grabbit';
import { inr } from '@/components/gb/format';

const item: GrabbitMenuItem = {
  id: 1, cafe_id: 1, name: 'Burger Combo', description: 'Burger + Fries + Coke',
  price: 200, mrp_price: 250, category: 'food', image_url: null, is_available: true,
  subcategory_id: null, subcategory_name: null, sort_order: 0, is_veg: true,
};

export default function Preview() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textDecoration: 'line-through' }}>{inr(item.mrp_price!)}</div>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{inr(item.price)}</div>
      </div>
      <button onClick={() => setOpen(true)}>Open sheet</button>
      {open && (
        <CustomizeSheet
          item={item}
          variations={[]}
          groups={[]}
          addons={[]}
          items={[item]}
          cafeOpen={true}
          onClose={() => setOpen(false)}
          onAdd={() => setOpen(false)}
        />
      )}
    </div>
  );
}
