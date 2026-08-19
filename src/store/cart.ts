import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GrabbitCartItem } from '@gradient365/gradient-commons';

// A cart "line" is a menu item + its exact customization: the chosen variation, the add-on
// group options, and the cafe's own extras. Two lines with the same menu_item_id but
// different choices (Reg Meal vs Burger Only, with cheese vs without) must stay separate —
// this key is how addItem/removeItem/updateQty identify a line.
export function cartLineKey(
  item: Pick<GrabbitCartItem, 'menu_item_id' | 'addons' | 'variation' | 'options'>,
): string {
  const addonIds = (item.addons ?? []).map(a => a.id).sort((a, b) => a - b);
  const optionIds = (item.options ?? []).map(o => o.id).sort((a, b) => a - b);
  return `${item.menu_item_id}:${item.variation?.id ?? ''}:${addonIds.join(',')}:${optionIds.join(',')}`;
}

/**
 * A cart line, plus the cooking instruction for that dish. Notes are deliberately not
 * part of cartLineKey: adding the same dish again bumps the quantity and keeps the note,
 * rather than splitting the line in two.
 */
export type GrabbitCartLine = GrabbitCartItem & {
  notes?: string;
  /** Menu category, recorded at add time so the cart can offer the right quick notes. */
  category?: string;
};

interface CartState {
  cafeSlug: string | null;
  items: GrabbitCartLine[];
  addItem: (item: GrabbitCartLine, slug: string) => void;
  removeItem: (lineKey: string) => void;
  updateQty: (lineKey: string, quantity: number) => void;
  setLineNote: (lineKey: string, notes: string) => void;
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
      setLineNote: (lineKey, notes) =>
        set(state => ({
          items: state.items.map(i =>
            cartLineKey(i) === lineKey ? { ...i, notes: notes.trim() || undefined } : i
          )
        })),
      clearCart: () => set({ items: [], cafeSlug: null }),
      total: () =>
        get().items.reduce((sum, i) => {
          const addonsSum = (i.addons ?? []).reduce((s, a) => s + a.price, 0);
          const optionsSum = (i.options ?? []).reduce((s, o) => s + o.price, 0);
          // i.price is already the chosen variation's price when the item has variations.
          return sum + (i.price + addonsSum + optionsSum) * i.quantity;
        }, 0)
    }),
    { name: 'grabbit-cart' }
  )
);
