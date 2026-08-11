import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GrabbitCartItem } from '@gradient365/gradient-commons';

// A cart "line" is a menu item + its exact add-on selection. Two lines with the same
// menu_item_id but different add-ons (e.g. burger+cheese vs burger with nothing) must
// stay separate — this key is how addItem/removeItem/updateQty identify a line.
export function cartLineKey(item: Pick<GrabbitCartItem, 'menu_item_id' | 'addons'>): string {
  const addonIds = (item.addons ?? []).map(a => a.id).sort((a, b) => a - b);
  return `${item.menu_item_id}:${addonIds.join(',')}`;
}

interface CartState {
  cafeSlug: string | null;
  items: GrabbitCartItem[];
  addItem: (item: GrabbitCartItem, slug: string) => void;
  removeItem: (lineKey: string) => void;
  updateQty: (lineKey: string, quantity: number) => void;
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
          const key = cartLineKey(item);
          const existing = state.items.find(i => cartLineKey(i) === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                cartLineKey(i) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { cafeSlug: slug, items: [...state.items, item] };
        }),
      removeItem: lineKey =>
        set(state => ({ items: state.items.filter(i => cartLineKey(i) !== lineKey) })),
      updateQty: (lineKey, qty) =>
        set(state => ({
          items:
            qty <= 0
              ? state.items.filter(i => cartLineKey(i) !== lineKey)
              : state.items.map(i =>
                  cartLineKey(i) === lineKey ? { ...i, quantity: qty } : i
                )
        })),
      clearCart: () => set({ items: [], cafeSlug: null }),
      total: () =>
        get().items.reduce((sum, i) => {
          const addonsSum = (i.addons ?? []).reduce((s, a) => s + a.price, 0);
          return sum + (i.price + addonsSum) * i.quantity;
        }, 0)
    }),
    { name: 'grabbit-cart' }
  )
);
