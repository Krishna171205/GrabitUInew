'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { MS } from '@/components/gb/kit';

// --- DATA & CONFIG ---

const FEATURES = [
  {
    id: 'queue',
    title: 'LIVE QUEUE & TICKETS',
    desc: "Watch orders flow straight from a customer's phone to your kitchen screen. Track prep times and notify customers instantly when their coffee is ready.",
  },
  {
    id: 'menu',
    title: 'SEAMLESS MENU SYNC',
    desc: 'Update your offerings in real-time. Mark items as sold out, adjust prices, or launch daily specials without calling support or printing new menus.',
  },
  {
    id: 'analytics',
    title: 'ANALYTICS & PAYMENTS',
    desc: 'Track your busiest hours, most popular items, and total revenue. All payments are securely processed and deposited directly to your bank account.',
  },
  {
    id: 'tables',
    title: 'TABLES & FLOOR',
    desc: 'See every table at a glance — vacant, occupied, or billed. Dine-in orders route straight to the right table, no walkie-talkies required.',
  },
  {
    id: 'payouts',
    title: 'PAYOUTS & SETTLEMENTS',
    desc: "Money lands in your account daily with a UTR you can match against your bank statement. No manual reconciliation, no chasing anyone for what you're owed.",
  },
  {
    id: 'inventory',
    title: 'INVENTORY TRACKING',
    desc: "Every sale deducts stock automatically. See what's running low before you run out, and know exactly what to reorder without a manual count.",
  },
];

const AUTOPLAY_INTERVAL = 3800; // 3.8 seconds per tab

// --- MOCK UI COMPONENTS FOR THE DASHBOARD ---

const KDS_COLUMNS = [
  {
    key: 'incoming',
    label: 'Incoming',
    accent: '#94A3B8',
    tickets: [
      { id: '287', type: 'Dine-in · T4', elapsed: '2m', elapsedTone: 'ok', items: [{ qty: 2, name: 'Iced Latte (Oat)' }, { qty: 1, name: 'Almond Croissant' }] },
      { id: '288', type: 'Takeaway', elapsed: '1m', elapsedTone: 'ok', items: [{ qty: 1, name: 'Cold Brew' }] },
    ],
  },
  {
    key: 'preparing',
    label: 'Preparing',
    accent: '#0055D4',
    tickets: [
      { id: '284', type: 'Delivery', elapsed: '11m', elapsedTone: 'warn', items: [{ qty: 1, name: 'Americano' }, { qty: 1, name: 'Espresso' }], note: 'Extra hot' },
      { id: '285', type: 'Dine-in · T2', elapsed: '4m', elapsedTone: 'ok', items: [{ qty: 3, name: 'Flat White' }] },
    ],
  },
  {
    key: 'ready',
    label: 'Ready',
    accent: '#10B981',
    tickets: [
      { id: '281', type: 'Takeaway', elapsed: '22m', elapsedTone: 'late', items: [{ qty: 1, name: 'Matcha Latte' }, { qty: 1, name: 'Choc Chip Cookie' }] },
    ],
  },
];

const elapsedStyles: Record<string, string> = {
  ok: 'text-gray-400',
  warn: 'text-amber-600',
  late: 'text-red-600',
};

const ticketActionLabel: Record<string, string> = { incoming: 'Start', preparing: 'Mark ready', ready: 'Hand over' };

const LiveQueueView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
    <div className="flex items-center justify-between mb-4 sm:mb-8">
      <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317]">Kitchen Display</h3>
      <div className="bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[12px] font-bold flex items-center gap-1.5 sm:gap-2">
        <span className="relative flex w-1.5 h-1.5 sm:w-2 sm:h-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
        </span>
        Live
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 min-h-0">
      {KDS_COLUMNS.map((col) => (
        <div key={col.key} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden" style={{ borderTop: `3px solid ${col.accent}` }}>
          <div className="px-2.5 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-[8px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-500">{col.label}</span>
            <span className="text-[8px] sm:text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-1.5 sm:px-2 py-0.5">{col.tickets.length}</span>
          </div>
          <div className="flex-1 overflow-hidden p-1.5 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2.5">
            {col.tickets.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <span className="font-mono font-bold text-[9px] sm:text-[13px] text-[#111317]">#{t.id}</span>
                  <span className={`font-bold text-[8px] sm:text-[11px] ${elapsedStyles[t.elapsedTone]}`}>{t.elapsed}</span>
                </div>
                <div className="text-[7.5px] sm:text-[10.5px] font-semibold text-gray-400 mb-1 sm:mb-1.5">{t.type}</div>
                <div className="flex flex-col gap-0.5 mb-1.5 sm:mb-2">
                  {t.items.map((it, i) => (
                    <div key={i} className="text-[8px] sm:text-[12px] font-medium text-[#111317] truncate">
                      <span className="text-gray-400 font-bold">{it.qty}×</span> {it.name}
                    </div>
                  ))}
                </div>
                {t.note && (
                  <div className="text-[7px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 w-fit mb-1.5 sm:mb-2">✱ {t.note}</div>
                )}
                <button className="w-full text-[7.5px] sm:text-[11px] font-bold rounded-md sm:rounded-lg py-1 sm:py-1.5" style={{ background: `${col.accent}1A`, color: col.accent }}>
                  {ticketActionLabel[col.key]}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MENU_ITEMS = [
  { name: 'Iced Latte (Oat)', code: 'BEV-014', group: 'Beverages', veg: true, inStock: true, price: '₹260' },
  { name: 'Flat White', code: 'BEV-006', group: 'Beverages', veg: true, inStock: true, price: '₹220' },
  { name: 'Almond Croissant', code: 'BAK-021', group: 'Bakery', veg: true, inStock: false, price: '₹220' },
  { name: 'Matcha Latte', code: 'BEV-019', group: 'Beverages', veg: true, inStock: true, price: '₹320' },
  { name: 'Chicken Panini', code: 'MEA-004', group: 'Mains', veg: false, inStock: true, price: '₹350' },
];

const VegDot = ({ veg }: { veg: boolean }) => (
  <span
    className="inline-flex items-center justify-center w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border rounded-[2px] sm:rounded-[3px] shrink-0"
    style={{ borderColor: veg ? '#10B981' : '#DC2626' }}
  >
    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: veg ? '#10B981' : '#DC2626' }} />
  </span>
);

const MenuSyncView = () => {
  const activeCount = MENU_ITEMS.filter((i) => i.inStock).length;
  return (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
    <div className="flex items-center justify-between mb-3 sm:mb-5">
      <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317]">Menu</h3>
      <div className="bg-[#0055D4] text-white shadow-[0_4px_12px_rgba(0,85,212,0.2)] rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-[13px] font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-[#0044AA] transition-colors">
        <MS name="add" size={14} className="sm:!text-[16px]" /> Add Item
      </div>
    </div>

    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-5">
      <div className="bg-white border border-gray-200 rounded-full flex text-[8px] sm:text-[12px] font-bold overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <span className="px-2 sm:px-3.5 py-1 sm:py-1.5 bg-blue-50 text-[#0055D4]">All {MENU_ITEMS.length}</span>
        <span className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-gray-400">Active {activeCount}</span>
        <span className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-gray-400">Inactive {MENU_ITEMS.length - activeCount}</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <MS name="search" size={14} /> Search menu…
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col flex-1">
      <div className="grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100 text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
        <div className="col-span-5">Item</div>
        <div className="col-span-3 text-center">Availability</div>
        <div className="col-span-4 text-right">Price</div>
      </div>
      <div className="flex flex-col">
        {MENU_ITEMS.map((item, i) => (
          <div key={i} className={`grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-50 last:border-0 items-center text-[9px] sm:text-[14px] transition-colors ${!item.inStock ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
            <div className="col-span-5 flex items-start gap-1.5 sm:gap-2.5 truncate">
              <div className="mt-0.5 sm:mt-1"><VegDot veg={item.veg} /></div>
              <div className="flex flex-col gap-0 sm:gap-0.5 truncate">
                <span className={`font-bold truncate ${item.inStock ? 'text-[#111317]' : 'text-gray-400'}`}>{item.name}</span>
                <span className="text-[7.5px] sm:text-[12px] text-gray-400 font-medium truncate">{item.group} · {item.code}</span>
              </div>
            </div>
            <div className="col-span-3 flex justify-center">
              <div className={`w-6 sm:w-10 h-3.5 sm:h-5.5 rounded-full flex items-center p-[2px] transition-colors ${item.inStock ? 'bg-[#10B981]' : 'bg-gray-300'}`}>
                <div className={`w-2.5 sm:w-4.5 h-2.5 sm:h-4.5 rounded-full bg-white shadow-sm transition-transform ${item.inStock ? 'translate-x-[10px] sm:translate-x-[18px]' : 'translate-x-0'}`} />
              </div>
            </div>
            <div className="col-span-4 flex justify-end items-center gap-1 sm:gap-4">
              <span className="font-bold text-[#111317]">{item.price}</span>
              <div className="w-5 sm:w-8 h-5 sm:h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer">
                <MS name="edit" size={14} className="sm:!text-[16px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

const RECENT_ORDERS = [
  { id: '292', type: 'Dine-in', time: '4m ago', status: 'Preparing', tone: 'warn', amount: '₹680' },
  { id: '291', type: 'Takeaway', time: '12m ago', status: 'Ready', tone: 'ok', amount: '₹280' },
  { id: '289', type: 'Delivery', time: '38m ago', status: 'Served', tone: 'ok', amount: '₹840' },
  { id: '286', type: 'Dine-in', time: '1h ago', status: 'Cancelled', tone: 'bad', amount: '₹420' },
];

const statusPillTone: Record<string, string> = {
  ok: 'bg-green-50 text-green-700',
  warn: 'bg-amber-50 text-amber-700',
  bad: 'bg-red-50 text-red-700',
};

const AnalyticsView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317]">Dashboard</h3>
      <div className="bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-[13px] font-bold flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-50">
        Today <MS name="expand_more" size={14} className="text-gray-500 sm:!text-[16px]" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-5">
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Sales</div>
        <div className="text-[16px] sm:text-[26px] font-black text-[#111317] leading-none">₹14,250</div>
        <div className="text-[6.5px] sm:text-[11px] font-bold text-green-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2.5">
          <MS name="trending_up" size={11} className="sm:!text-[13px]" /> 12.4% vs yday
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Orders</div>
        <div className="text-[16px] sm:text-[26px] font-black text-[#111317] leading-none">64</div>
        <div className="text-[6.5px] sm:text-[11px] font-bold text-green-600 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2.5">
          <MS name="trending_up" size={11} className="sm:!text-[13px]" /> 8.2% vs yday
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Avg Ticket</div>
        <div className="text-[16px] sm:text-[26px] font-black text-[#111317] leading-none">₹223</div>
        <div className="text-[6.5px] sm:text-[11px] font-bold text-red-500 flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2.5">
          <MS name="trending_down" size={11} className="sm:!text-[13px]" /> 2.1% vs yday
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 min-h-0">
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-end relative overflow-hidden">
        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hourly Volume</div>
        <div className="flex items-end gap-1 sm:gap-2.5 h-16 sm:h-28 w-full mt-6 sm:mt-8">
          {[20, 35, 25, 40, 60, 85, 100, 75, 45, 30, 15].map((h, i) => (
            <div key={i} className="flex-1 h-full bg-blue-50 rounded-t-sm relative overflow-hidden">
              <div className="absolute bottom-0 w-full bg-[#0055D4] rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between w-full mt-1.5 sm:mt-2.5 text-[6px] sm:text-[9px] font-bold text-gray-300 uppercase">
          <span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100 text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Orders</div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {RECENT_ORDERS.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3.5 border-b border-gray-50 last:border-0">
              <div className="min-w-0">
                <div className="font-mono font-bold text-[8px] sm:text-[13px] text-[#111317]">#{o.id}</div>
                <div className="text-[7px] sm:text-[10.5px] text-gray-400 font-semibold">{o.type} · {o.time}</div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[6.5px] sm:text-[10px] font-bold whitespace-nowrap ${statusPillTone[o.tone]}`}>{o.status}</span>
                <span className="font-bold text-[8px] sm:text-[13px] text-[#111317]">{o.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TABLE_STATUS_META: Record<string, { label: string; color: string }> = {
  vacant: { label: 'Vacant', color: '#94A3B8' },
  occupied: { label: 'Occupied', color: '#0055D4' },
  billed: { label: 'Billed', color: '#F59E0B' },
  reserved: { label: 'Reserved', color: '#8B5CF6' },
};

const TABLES = [
  { id: 'T1', status: 'occupied', note: '4 guests · 12m' },
  { id: 'T2', status: 'occupied', note: '2 guests · 4m' },
  { id: 'T3', status: 'vacant', note: '' },
  { id: 'T4', status: 'billed', note: 'Awaiting payment' },
  { id: 'T5', status: 'vacant', note: '' },
  { id: 'T6', status: 'reserved', note: '7:30 PM · 2' },
  { id: 'T7', status: 'vacant', note: '' },
  { id: 'T8', status: 'occupied', note: '3 guests · 22m' },
];

const TablesView = () => {
  const occupied = TABLES.filter((t) => t.status === 'occupied' || t.status === 'billed').length;
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317]">Tables</h3>
        <div className="bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-[13px] font-bold text-gray-500">
          <span className="text-[#111317]">{occupied}</span>/{TABLES.length} occupied
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6 flex-wrap">
        {Object.values(TABLE_STATUS_META).map((m) => (
          <div key={m.label} className="flex items-center gap-1 sm:gap-1.5 text-[7px] sm:text-[11px] font-bold text-gray-500">
            <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full" style={{ background: m.color }} />
            {m.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 flex-1">
        {TABLES.map((t) => {
          const meta = TABLE_STATUS_META[t.status];
          return (
            <div
              key={t.id}
              className="bg-white border rounded-xl sm:rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center p-2 sm:p-4 gap-1 sm:gap-1.5"
              style={{ borderColor: t.status === 'vacant' ? '#E5E7EB' : meta.color, borderWidth: t.status === 'vacant' ? 1 : 2 }}
            >
              <span className="font-mono font-black text-[12px] sm:text-[20px] text-[#111317]">{t.id}</span>
              <span className="text-[7px] sm:text-[10.5px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
              {t.note && <span className="text-[6.5px] sm:text-[9.5px] text-gray-400 font-medium text-center">{t.note}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PAYOUTS = [
  { amount: '₹8,420.00', date: '29 Aug 2026', utr: '319284710562', tone: 'Paid' },
  { amount: '₹6,180.50', date: '28 Aug 2026', utr: '319201558873', tone: 'Paid' },
  { amount: '₹9,940.00', date: '27 Aug 2026', utr: null, tone: 'On the way' },
];

const payoutTone: Record<string, string> = {
  Paid: 'text-green-700 bg-green-50',
  Failed: 'text-red-700 bg-red-50',
  'On the way': 'text-blue-700 bg-blue-50',
};

const PayoutsView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
    <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317] mb-3 sm:mb-5">Payouts</h3>

    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-3 sm:mb-5">
      <div className="text-[7px] sm:text-[11px] font-bold text-[#0055D4] uppercase tracking-wider mb-0.5 sm:mb-1">Paid out so far</div>
      <div className="text-[18px] sm:text-[30px] font-black text-[#111317] leading-none">₹24,540.50</div>
    </div>

    <div className="flex flex-col gap-1.5 sm:gap-2.5 flex-1 overflow-hidden">
      {PAYOUTS.map((p, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-bold text-[11px] sm:text-[17px] text-[#111317]">{p.amount}</div>
            <div className="text-[7px] sm:text-[11px] text-gray-400 font-semibold mt-0.5">{p.date}{p.utr ? ` · UTR ${p.utr}` : ''}</div>
          </div>
          <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-full text-[6.5px] sm:text-[10.5px] font-bold whitespace-nowrap ${payoutTone[p.tone]}`}>{p.tone}</span>
        </div>
      ))}
    </div>
  </div>
);

const INVENTORY = [
  { name: 'Whole Milk', unit: '4.2 L', of: '10 L', level: 42, status: 'reorder' },
  { name: 'Coffee Beans (House Blend)', unit: '1.8 kg', of: '5 kg', level: 36, status: 'low' },
  { name: 'Oat Milk', unit: '6 L', of: '8 L', level: 75, status: 'ok' },
  { name: 'Croissant Dough', unit: '24 pcs', of: '40 pcs', level: 60, status: 'ok' },
  { name: 'Matcha Powder', unit: '180 g', of: '500 g', level: 36, status: 'low' },
];

const invStatusMeta: Record<string, { label: string; color: string }> = {
  ok: { label: 'In stock', color: '#10B981' },
  low: { label: 'Low', color: '#F59E0B' },
  reorder: { label: 'Reorder', color: '#DC2626' },
};

const InventoryView = () => {
  const reorderCount = INVENTORY.filter((i) => i.status === 'reorder').length;
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] p-4 sm:p-8">
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <h3 className="text-[16px] sm:text-[24px] font-bold text-[#111317]">Inventory</h3>
        {reorderCount > 0 && (
          <div className="bg-red-50 text-red-700 rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-[9px] sm:text-[13px] font-bold flex items-center gap-1 sm:gap-1.5">
            <MS name="warning" size={13} className="sm:!text-[15px]" /> {reorderCount} to reorder
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col flex-1">
        <div className="grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100 text-[7px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
          <div className="col-span-6">Ingredient</div>
          <div className="col-span-4">Stock level</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        <div className="flex flex-col">
          {INVENTORY.map((item, i) => {
            const meta = invStatusMeta[item.status];
            return (
              <div key={i} className="grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-50 last:border-0 items-center text-[9px] sm:text-[14px]">
                <div className="col-span-6 flex flex-col gap-0 sm:gap-0.5 truncate">
                  <span className="font-bold text-[#111317] truncate">{item.name}</span>
                  <span className="text-[7.5px] sm:text-[12px] text-gray-400 font-medium">{item.unit} of {item.of}</span>
                </div>
                <div className="col-span-4">
                  <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.level}%`, background: meta.color }} />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[7px] sm:text-[10.5px] font-bold whitespace-nowrap" style={{ color: meta.color }}>{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function PartnerPitch() {
  const [activeTab, setActiveTab] = useState(0);
  
  const prefersReducedMotion = useReducedMotion();

  // Autoplay Logic - runs continuously, resets timer when user clicks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % FEATURES.length);
    }, AUTOPLAY_INTERVAL);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // Parallax Logic - extremely subtle to feel grounded
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const frameX = useTransform(smoothX, [-1, 1], [-4, 4]);
  const frameY = useTransform(smoothY, [-1, 1], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  return (
    <section 
      id="partners" 
      className="py-24 md:py-32 bg-[#F9F8F5] relative overflow-hidden text-[#111317]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
    >
      {/* 
        Container is intentionally open on the right on large screens 
        to allow the dashboard to overflow and crop naturally.
      */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:pl-12 lg:pr-0 relative z-10 flex flex-col lg:flex-row items-center lg:items-center min-h-[720px] lg:min-h-[850px]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEFT COLUMN: EDITORIAL FEATURE SELECTOR
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full lg:w-[42%] flex flex-col z-20 py-12 lg:py-0 pr-0 lg:pr-12">
          
          <h2 
            className="text-[14vw] min-[380px]:text-[64px] sm:text-[76px] lg:text-[88px] xl:text-[96px] leading-[1.05] tracking-[0.02em] font-normal uppercase text-[#111317] mb-12 lg:mb-20"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            CAFÉ <br/>
            <span className="text-[#0055D4]">OPERATIONS</span>
          </h2>

          <div className="flex flex-col gap-6 lg:gap-8">
            {FEATURES.map((feature, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={feature.id}
                  onClick={() => handleTabClick(index)}
                  className="group flex flex-col text-left focus:outline-none relative py-2"
                >
                  <div className="flex items-center gap-5 mb-2">
                    {/* The number (01, 02) */}
                    <span className={`text-[18px] font-normal transition-colors duration-300 ${isActive ? 'text-[#111317]' : 'text-gray-300 group-hover:text-gray-400'}`} style={{ fontFamily: 'var(--font-anton)' }}>
                      0{index + 1}
                    </span>

                    {/* Progress Indicator */}
                    <div className={`relative w-12 h-[2px] overflow-hidden shrink-0 transition-colors duration-300 ${isActive ? 'bg-blue-100' : 'bg-transparent'}`}>
                      {isActive && (
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-[#0055D4]"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ 
                            duration: AUTOPLAY_INTERVAL / 1000, 
                            ease: "linear" 
                          }}
                        />
                      )}
                    </div>
                    
                    <h3 
                      className={`text-[20px] sm:text-[22px] lg:text-[24px] font-normal uppercase tracking-wide transition-all duration-300 ${
                        isActive ? 'text-[#111317] translate-x-1' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                      style={{ fontFamily: 'var(--font-anton)' }}
                    >
                      {feature.title}
                    </h3>
                  </div>

                  {/* Expandable Description */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isActive ? 'auto' : 0, 
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? 8 : 0
                    }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden pl-[84px]"
                  >
                    <p className="text-[16px] lg:text-[17px] text-[#4A4E58] font-medium leading-[1.6] max-w-[420px]">
                      {feature.desc}
                    </p>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RIGHT COLUMN: OVERSIZED REALISTIC PRODUCT STAGE
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        
        {/* Mobile: inline relative container. Desktop: absolute, bleeding off the right edge */}
        <div className="w-full lg:absolute lg:left-[45%] lg:top-1/2 lg:-translate-y-1/2 z-20 flex justify-center lg:justify-start pointer-events-none mt-8 lg:mt-0">
          
          {/* The Dashboard itself is explicitly oversized on desktop (w-[1100px]) */}
          <motion.div 
            style={{ 
              x: frameX, 
              y: frameY,
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.12), 0 10px 30px -10px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,1) inset'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[800px] lg:max-w-none lg:w-[1100px] aspect-[4/3] lg:aspect-auto lg:h-[720px] xl:h-[760px] bg-white rounded-[20px] lg:rounded-[24px] border border-black/[0.04] flex flex-col overflow-hidden"
          >
            {/* Subtle ambient grounding shadow */}
            <div className="absolute -inset-10 bg-black/[0.03] rounded-[40px] blur-3xl -z-10 translate-y-12" />

            {/* --- BROWSER / APP CHROME --- */}
            <div className="h-14 lg:h-16 border-b border-gray-100 flex items-center px-5 lg:px-6 bg-white gap-4 shrink-0">
              {/* Window Controls */}
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              
              {/* Cafe Identity */}
              <div className="flex-1 flex justify-center lg:justify-start lg:pl-6">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-[13px] font-bold text-[#111317]">Blue Tokai</span>
                  <span className="text-[12px] font-medium text-gray-400">Connaught Place</span>
                </div>
              </div>

              {/* Top Bar Actions */}
              <div className="hidden sm:flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md">
                  <MS name="search" size={16} />
                  <span className="text-[12px] font-medium mr-4">Search...</span>
                </div>
                <MS name="notifications" size={20} className="hover:text-gray-600 transition-colors" />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[12px] font-bold ml-2 border border-blue-200">BT</div>
              </div>
            </div>

            {/* --- APPLICATION BODY --- */}
            <div className="flex-1 flex bg-[#FAFAFA] relative overflow-hidden">
              
              {/* Sidebar */}
              <div className="w-[80px] bg-white border-r border-gray-100 flex-col items-center py-6 hidden sm:flex shrink-0">
                <div className="w-10 h-10 bg-[#111317] rounded-xl text-white flex items-center justify-center font-bold text-[16px] mb-8 shadow-md">
                  G
                </div>
                
                <div className="flex flex-col gap-6 items-center w-full">
                  {[
                    { id: 'home', icon: 'home' },
                    { id: 'queue', icon: 'receipt_long' },
                    { id: 'menu', icon: 'restaurant_menu' },
                    { id: 'analytics', icon: 'bar_chart' },
                    { id: 'tables', icon: 'table_bar' },
                    { id: 'payouts', icon: 'account_balance_wallet' },
                    { id: 'inventory', icon: 'inventory_2' },
                    { id: 'settings', icon: 'settings' }
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        (item.id === FEATURES[activeTab].id) 
                          ? 'bg-blue-50 text-[#0055D4]' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <MS name={item.icon} size={24} />
                      {item.id === FEATURES[activeTab].id && (
                        <div className="absolute left-[-16px] w-[5px] h-8 bg-[#0055D4] rounded-r-md shadow-[2px_0_8px_rgba(0,85,212,0.4)]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area (Crossfading Tabs) */}
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {activeTab === 0 && <LiveQueueView />}
                    {activeTab === 1 && <MenuSyncView />}
                    {activeTab === 2 && <AnalyticsView />}
                    {activeTab === 3 && <TablesView />}
                    {activeTab === 4 && <PayoutsView />}
                    {activeTab === 5 && <InventoryView />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Map/Secondary Panel (Far Right Edge - This gets cropped) */}
              <div className="w-[280px] bg-white border-l border-gray-100 hidden xl:flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-[14px] font-bold text-[#111317]">Order Map</h4>
                  <p className="text-[12px] text-gray-400 mt-1">Live delivery tracking</p>
                </div>
                <div className="flex-1 bg-[#F5F7FA] relative">
                  {/* Subtle map texture placeholder */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  {/* Fake map markers */}
                  <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-[#0055D4] rounded-full shadow-[0_0_0_4px_rgba(0,85,212,0.2)]" />
                  <div className="absolute top-[50%] left-[60%] w-3 h-3 bg-[#10B981] rounded-full shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
                  <div className="absolute top-[70%] left-[20%] w-3 h-3 bg-gray-400 rounded-full" />
                  
                  {/* Active delivery card */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Out for delivery</div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-[12px]">JD</div>
                      <div>
                        <div className="text-[13px] font-bold text-[#111317]">Order #4087</div>
                        <div className="text-[11px] text-gray-500">Arriving in 4 mins</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
