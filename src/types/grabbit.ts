export type GrabbitOrderStatus = 'pending' | 'new_order' | 'confirmed' | 'prepping' | 'ready' | 'completed' | 'cancelled';
export type GrabbitPaymentMethod = 'online' | 'counter';
export type GrabbitPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type GrabbitStaffRole = 'owner' | 'manager' | 'staff';
export type GrabbitMenuCategory = 'drinks' | 'food' | 'specials' | 'desserts' | 'addons';
export type GrabbitCafeStatus = 'open' | 'partial' | 'closed';

export interface GrabbitCafe {
  id: number;
  slug: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  image_url: string | null;
}

export interface GrabbitMenuItem {
  id: number;
  cafe_id: number;
  name: string;
  description: string | null;
  price: number;
  category: GrabbitMenuCategory;
  image_url: string | null;
  is_available: boolean;
  subcategory_id: number | null;
  subcategory_name: string | null;
  sort_order: number;
  prep_time_minutes?: number;
  is_veg?: boolean | null; // null/undefined = unknown; render no veg mark
  is_bestseller?: boolean;
}

export interface GrabbitMenuSubcategory {
  id: number;
  cafe_id: number;
  category: GrabbitMenuCategory;
  name: string;
  sort_order: number;
}

export interface GrabbitMenuAddon {
  id: number;
  subcategory_id: number;
  cafe_id: number;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export interface GrabbitSlotConfig {
  slot_duration_minutes: number;
  max_orders_per_slot: number;
  min_advance_minutes: number;
  cutoff_before_close_minutes: number;
}

export interface GrabbitCustomer {
  id: number;
  phone: string;
  name: string | null;
}

export interface GrabbitCafeStaff {
  id: number;
  cafe_id: number;
  phone: string;
  name: string | null;
  role: GrabbitStaffRole;
  is_active: boolean;
  is_checked_in: boolean;
  checked_in_at: string | null;
}

export interface GrabbitETABreakdown {
  base_minutes: number;
  staff_factor: number;
  load_buffer: number;
  final_eta: number;
  active_workers: number;
  active_orders: number;
}

export interface GrabbitOrder {
  id: number;
  cafe_id: number;
  customer_id: number;
  pickup_slot: string;
  status: GrabbitOrderStatus;
  payment_method: GrabbitPaymentMethod;
  payment_status: GrabbitPaymentStatus;
  cashfree_order_id: string | null;
  cashfree_payment_session_id: string | null;
  total_amount: number;
  eta_minutes?: number | null;
  accepted_by_staff_id?: number | null;
  prep_time_minutes?: number | null;
  prep_ready_at?: string | null;
  notes?: string | null; // optional customer cooking instructions
  suggested_prep_minutes?: number | null; // chef-time estimate, staff accept from it
  created_at: string;
  updated_at: string;
  cafe_gstin?: string | null; // null = not GST-registered, not missing data
  cafe_fssai_number?: string | null;
}

export interface GrabbitOrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  addons?: { id: number; name: string; price: number }[];
  addons_total?: number;
}

export interface GrabbitOrderWithItems extends GrabbitOrder {
  items: GrabbitOrderItem[];
  customer_phone: string;
  customer_name: string | null;
}

export interface GrabbitAvailableSlot {
  slot_start: string;
  slot_end: string;
  available_count: number;
  max_count: number;
}

export interface GrabbitCartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  is_veg?: boolean | null;
  addons?: { id: number; name: string; price: number }[];
}

export interface GrabbitAuthResponse {
  token: string;
  customer?: GrabbitCustomer;
  staff?: {
    id: number;
    phone: string;
    role: GrabbitStaffRole;
    cafe_id: number;
    name: string | null;
  };
}

// Wallet types
export type GrabbitWalletTransactionType = 'recharge' | 'order_debit' | 'bonus_credit' | 'referral_bonus' | 'streak_bonus' | 'bonus_expired';
export type GrabbitRechargeStatus = 'pending' | 'success' | 'failed';
export type GrabbitSettlementStatus = 'pending' | 'settled';

export interface GrabbitWallet {
  id: number;
  customer_id: number;
  cafe_id: number;
  base_balance_paise: number;
  bonus_balance_paise: number;
  auto_recharge_enabled: boolean;
  auto_recharge_threshold_paise: number;
  auto_recharge_slab_amount_paise: number;
  recharge_streak_months: number;
  last_recharge_month: string | null;
  referral_code: string;
  created_at: string;
  updated_at: string;
}

export interface GrabbitWalletTransaction {
  id: number;
  wallet_id: number;
  cafe_id: number;
  type: GrabbitWalletTransactionType;
  amount_paise: number;
  balance_type: 'base' | 'bonus';
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface GrabbitWalletRecharge {
  id: number;
  wallet_id: number;
  cafe_id: number;
  slab_amount_paise: number;
  bonus_amount_paise: number;
  bonus_expires_at: string;
  payment_status: GrabbitRechargeStatus;
  cashfree_order_id: string | null;
  cashfree_payment_id: string | null;
  created_at: string;
  settled_at: string | null;
}

export interface GrabbitReferral {
  id: number;
  referrer_customer_id: number;
  referred_customer_id: number | null;
  referral_code: string;
  status: 'pending' | 'completed';
  bonus_credited_at: string | null;
  created_at: string;
}

export interface GrabbitCafeSettlement {
  id: number;
  cafe_id: number;
  order_id: number;
  amount_paise: number;
  status: GrabbitSettlementStatus;
  due_at: string;
  settled_at: string | null;
  created_at: string;
}

export const WALLET_SLABS = [
  { amountPaise: 50000, bonusPaise: 5000, expiryDays: 30 },
  { amountPaise: 100000, bonusPaise: 12000, expiryDays: 45 },
  { amountPaise: 200000, bonusPaise: 28000, expiryDays: 60 },
] as const;

export const WALLET_BONUS_MIN_ORDER_PAISE = 50000; // Rs 500
export const WALLET_STREAK_MILESTONE = 3;
export const WALLET_STREAK_BONUS_PAISE = 10000; // Rs 100
export const WALLET_REFERRAL_BONUS_PAISE = 5000; // Rs 50

export interface GrabbitPaymentsTrendDay {
  date: string;       // YYYY-MM-DD
  revenue: number;    // rupees (decimal)
}

export interface GrabbitPaymentsTransaction {
  id: number;
  created_at: string; // ISO timestamp
  total_amount: number;
  payment_method: GrabbitPaymentMethod;
}

export interface GrabbitPaymentsSummary {
  total: number;           // rupees
  online: number;          // rupees
  counter: number;         // rupees
  online_count: number;
  counter_count: number;
  order_count: number;
  avg_order_value: number; // rupees
  settlement_date: string | null; // YYYY-MM-DD, null when online = 0
  daily_trend: GrabbitPaymentsTrendDay[];
  transactions: GrabbitPaymentsTransaction[];
}
