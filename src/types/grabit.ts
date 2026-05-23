// Vendored from @gradient365/gradient-commons — kept in sync with gradient-commons/src/grabit.ts
// Having this local copy lets Vercel build without needing the monorepo root.

export type GrabitOrderStatus =
  | 'pending'
  | 'new_order'
  | 'confirmed'
  | 'prepping'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type GrabitPaymentMethod  = 'online' | 'counter';
export type GrabitPaymentStatus  = 'pending' | 'paid' | 'failed' | 'refunded';
export type GrabitStaffRole      = 'owner' | 'manager' | 'staff';
export type GrabitMenuCategory   = 'drinks' | 'food' | 'specials' | 'desserts';

export interface GrabitCafe {
  id: number;
  slug: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
}

export interface GrabitMenuItem {
  id: number;
  cafe_id: number;
  name: string;
  description: string | null;
  price: number;
  category: GrabitMenuCategory;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface GrabitSlotConfig {
  slot_duration_minutes: number;
  max_orders_per_slot: number;
  min_advance_minutes: number;
  cutoff_before_close_minutes: number;
}

export interface GrabitCustomer {
  id: number;
  phone: string;
  name: string | null;
}

export interface GrabitOrder {
  id: number;
  cafe_id: number;
  customer_id: number;
  pickup_slot: string;
  status: GrabitOrderStatus;
  payment_method: GrabitPaymentMethod;
  payment_status: GrabitPaymentStatus;
  cashfree_order_id: string | null;
  cashfree_payment_session_id: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface GrabitOrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
}

export interface GrabitOrderWithItems extends GrabitOrder {
  items: GrabitOrderItem[];
  customer_phone: string;
  customer_name: string | null;
}

export interface GrabitAvailableSlot {
  slot_start: string;
  slot_end: string;
  available_count: number;
  max_count: number;
}

export interface GrabitCartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}
