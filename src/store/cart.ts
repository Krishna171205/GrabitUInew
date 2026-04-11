import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GrabitCartItem } from '@gradient365/types';

interface CartState {
  cafeSlug: string | null;
  items: GrabitCartItem[];
  addItem: (item: GrabitCartItem, slug: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQty: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cafeSlug: null,
      items: [],
      addItem: (item, slug) =>
        set(state => {
          // If adding from a different cafe, clear the cart first
          if (state.cafeSlug && state.cafeSlug !== slug) {
            return { cafeSlug: slug, items: [item] };
          }
          const existing = state.items.find(i => i.menu_item_id === item.menu_item_id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.menu_item_id === item.menu_item_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { cafeSlug: slug, items: [...state.items, item] };
        }),
      removeItem: id =>
        set(state => ({ items: state.items.filter(i => i.menu_item_id !== id) })),
      updateQty: (id, qty) =>
        set(state => ({
          items:
            qty <= 0
              ? state.items.filter(i => i.menu_item_id !== id)
              : state.items.map(i =>
                  i.menu_item_id === id ? { ...i, quantity: qty } : i
                )
        })),
      clearCart: () => set({ items: [], cafeSlug: null }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }),
    { name: 'grabit-cart' }
  )
);
