export type GrabitOrderStatus = 'pending' | 'new_order' | 'confirmed' | 'prepping' | 'ready' | 'completed' | 'cancelled';
export type GrabitPaymentMethod = 'online' | 'counter';
export type GrabitPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type GrabitStaffRole = 'owner' | 'manager' | 'staff';
export type GrabitMenuCategory = 'drinks' | 'food' | 'specials' | 'desserts';
export type GrabitCafeStatus = 'open' | 'partial' | 'closed';

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
  image_url: string | null;
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
  prep_time_minutes?: number;
  is_veg?: boolean | null; // null/undefined = unknown; render no veg mark
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

export interface GrabitCafeStaff {
  id: number;
  cafe_id: number;
  phone: string;
  name: string | null;
  role: GrabitStaffRole;
  is_active: boolean;
  is_checked_in: boolean;
  checked_in_at: string | null;
}

export interface GrabitETABreakdown {
  base_minutes: number;
  staff_factor: number;
  load_buffer: number;
  final_eta: number;
  active_workers: number;
  active_orders: number;
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
  eta_minutes?: number | null;
  accepted_by_staff_id?: number | null;
  prep_time_minutes?: number | null;
  prep_ready_at?: string | null;
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
  is_veg?: boolean | null;
}

export interface GrabitAuthResponse {
  token: string;
  customer?: GrabitCustomer;
  staff?: {
    id: number;
    phone: string;
    role: GrabitStaffRole;
    cafe_id: number;
    name: string | null;
  };
}

// Wallet types
export type GrabitWalletTransactionType = 'recharge' | 'order_debit' | 'bonus_credit' | 'referral_bonus' | 'streak_bonus' | 'bonus_expired';
export type GrabitRechargeStatus = 'pending' | 'success' | 'failed';
export type GrabitSettlementStatus = 'pending' | 'settled';

export interface GrabitWallet {
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

export interface GrabitWalletTransaction {
  id: number;
  wallet_id: number;
  cafe_id: number;
  type: GrabitWalletTransactionType;
  amount_paise: number;
  balance_type: 'base' | 'bonus';
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface GrabitWalletRecharge {
  id: number;
  wallet_id: number;
  cafe_id: number;
  slab_amount_paise: number;
  bonus_amount_paise: number;
  bonus_expires_at: string;
  payment_status: GrabitRechargeStatus;
  cashfree_order_id: string | null;
  cashfree_payment_id: string | null;
  created_at: string;
  settled_at: string | null;
}

export interface GrabitReferral {
  id: number;
  referrer_customer_id: number;
  referred_customer_id: number | null;
  referral_code: string;
  status: 'pending' | 'completed';
  bonus_credited_at: string | null;
  created_at: string;
}

export interface GrabitCafeSettlement {
  id: number;
  cafe_id: number;
  order_id: number;
  amount_paise: number;
  status: GrabitSettlementStatus;
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

export interface GrabitPaymentsTrendDay {
  date: string;       // YYYY-MM-DD
  revenue: number;    // rupees (decimal)
}

export interface GrabitPaymentsTransaction {
  id: number;
  created_at: string; // ISO timestamp
  total_amount: number;
  payment_method: GrabitPaymentMethod;
}

export interface GrabitPaymentsSummary {
  total: number;           // rupees
  online: number;          // rupees
  counter: number;         // rupees
  online_count: number;
  counter_count: number;
  order_count: number;
  avg_order_value: number; // rupees
  settlement_date: string | null; // YYYY-MM-DD, null when online = 0
  daily_trend: GrabitPaymentsTrendDay[];
  transactions: GrabitPaymentsTransaction[];
}
