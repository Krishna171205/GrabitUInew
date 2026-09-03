'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { GrabbitCafe, GrabbitMenuItem, GrabbitMenuCategory, GrabbitMenuAddon, GrabbitMenuVariation, GrabbitMenuOptionGroup } from '@gradient365/gradient-commons';
import { useCart, cartLineKey } from '@/store/cart';
import { MS, Veg } from '@/components/gb/kit';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { inr, fmtTime12, todayHours, type DayHours } from '@/components/gb/format';
import { ph } from '@/components/gb/data';
import type { GrabbitOffer } from '@/components/gb/offers';
import { CustomizeSheet, type CustomizeSelection } from '@/components/gb/CustomizeSheet';
import { directionsUrl, distanceLabel } from '@/components/gb/maps';
import { getSavedCoords } from '@/components/gb/location';
import { menuImageSrc } from '@/lib/menu-image';

const CATEGORIES: GrabbitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts', 'addons'];
const CATEGORY_LABELS: Record<GrabbitMenuCategory, string> = {
  drinks: 'Drinks', food: 'Food', specials: 'Specials', desserts: 'Desserts', addons: 'Add-ons',
};

interface TopItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
  total_ordered: number;
}

interface FavItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
}

interface Props {
  slug: string;
  cafe: GrabbitCafe;
  items: GrabbitMenuItem[];
  addons: GrabbitMenuAddon[];
  variations: GrabbitMenuVariation[];
  optionGroups: GrabbitMenuOptionGroup[];
  customerName?: string | null;
  topItems?: TopItem[];
  favorites?: FavItem[];
  offers?: GrabbitOffer[];
  isLoggedIn?: boolean;
  table?: string | null;
  initialQuery?: string | null;
  initialAcceptingOrders?: boolean;
}

export default function MenuClient({ slug, cafe, items, addons, variations = [], optionGroups = [], customerName, topItems = [], favorites = [], offers = [], isLoggedIn = false, table = null, initialQuery = null, initialAcceptingOrders }: Props) {
  const router = useRouter();

  const [favIds, setFavIds] = useState<Set<number>>(new Set(favorites.map(f => f.menu_item_id)));
  const [acceptingOrders, setAcceptingOrders] = useState(initialAcceptingOrders !== false);
  const [activeCat, setActiveCat] = useState<GrabbitMenuCategory | 'all'>('all');
  const [query, setQuery] = useState(initialQuery ?? '');
  const [customizeItem, setCustomizeItem] = useState<GrabbitMenuItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  
  const { addItem, updateQty, clearCart, items: heldItems, total, cafeSlug: cartCafe } = useCart();
  
  const cartIsThisCafe = cartCafe === null || cartCafe === slug;
  const cartItems = cartIsThisCafe ? heldItems : [];
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = () => (cartIsThisCafe ? total() : 0);

  const plainLineKey = (id: number) => cartLineKey({ menu_item_id: id, addons: undefined });
  const qtyOf = (id: number) => cartItems.find(i => cartLineKey(i) === plainLineKey(id))?.quantity ?? 0;

  useEffect(() => {
    if (initialAcceptingOrders !== undefined) return;
    fetch(`/api/proxy/grabit/cafes/${slug}/status`)
      .then(res => res.ok ? res.json() : null)
      .then(d => { if (d) setAcceptingOrders(d.acceptingOrders !== false); })
      .catch(() => {});
  }, [slug, initialAcceptingOrders]);

  function guardedAdd(id: number, fn: () => void) {
    if (!acceptingOrders) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 500);
      return;
    }
    fn();
  }

  const itemById = new Map(items.map(i => [i.id, i]));
  const liveTopItems = topItems.filter(t => itemById.get(t.menu_item_id)?.is_available).slice(0, 6);

  const addonsBySubcategory = new Map<number, GrabbitMenuAddon[]>();
  for (const a of addons) {
    if (!a.is_available) continue;
    const list = addonsBySubcategory.get(a.subcategory_id) ?? [];
    list.push(a);
    addonsBySubcategory.set(a.subcategory_id, list);
  }
  const addonsFor = (item: GrabbitMenuItem) => item.subcategory_id ? (addonsBySubcategory.get(item.subcategory_id) ?? []) : [];
  
  const variationsByItem = new Map<number, GrabbitMenuVariation[]>();
  variations.forEach(v => { const list = variationsByItem.get(v.menu_item_id) ?? []; list.push(v); variationsByItem.set(v.menu_item_id, list); });
  const groupsByItem = new Map<number, GrabbitMenuOptionGroup[]>();
  optionGroups.forEach(g => { const list = groupsByItem.get(g.menu_item_id) ?? []; list.push(g); groupsByItem.set(g.menu_item_id, list); });
  const variationsFor = (item: GrabbitMenuItem) => variationsByItem.get(item.id) ?? [];
  const groupsFor = (item: GrabbitMenuItem) => groupsByItem.get(item.id) ?? [];

  function handleAddClick(item: GrabbitMenuItem) {
    const customizable = variationsFor(item).length > 0 || groupsFor(item).length > 0 || addonsFor(item).length > 0;
    if (!customizable) {
      addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url, is_veg: item.is_veg, category: item.category }, slug);
      return;
    }
    setCustomizeItem(item);
  }

  function confirmCustomization(item: GrabbitMenuItem, selection: CustomizeSelection) {
    guardedAdd(item.id, () => {
      addItem({
        menu_item_id: item.id,
        name: item.name,
        price: selection.variation ? selection.variation.price : item.price,
        quantity: selection.quantity,
        image_url: item.image_url,
        is_veg: item.is_veg,
        category: item.category,
        addons: selection.addons,
        variation: selection.variation ? { id: selection.variation.id, name: selection.variation.name } : undefined,
        options: selection.options,
      }, slug);
      setCustomizeItem(null);
    });
  }

  const q = query.trim().toLowerCase();
  const available = items.filter(i => i.is_available && (!q || i.name.toLowerCase().includes(q) || i.subcategory_name?.toLowerCase().includes(q)));
  const categoriesPresent = CATEGORIES.filter(c => available.some(i => i.category === c));

  const sections = useMemo(() => {
    const filtered = available.filter(i => activeCat === 'all' || i.category === activeCat);
    const order: string[] = [];
    const byKey = new Map<string, GrabbitMenuItem[]>();
    for (const item of filtered) {
      const key = item.subcategory_name || CATEGORY_LABELS[item.category];
      if (!byKey.has(key)) { byKey.set(key, []); order.push(key); }
      byKey.get(key)!.push(item);
    }
    return order.map(key => ({ key, items: byKey.get(key)! }));
  }, [available, activeCat]);

  const cover = (cafe as { cover_url?: string | null }).cover_url || cafe.image_url || ph('photo-1495474472287-4d71bcdd2085', 900, 560);
  
  const weekly = (cafe as { hours?: DayHours[] | null }).hours ?? null;
  const today = todayHours(weekly);
  const hours = today ? `${fmtTime12(today.opens)} – ${fmtTime12(today.closes)}` : cafe.opening_time && cafe.closing_time ? `${fmtTime12(cafe.opening_time)} – ${fmtTime12(cafe.closing_time)}` : 'Hours vary';

  const mapCafe = { name: cafe.name, address: cafe.address, city: cafe.city, ...(cafe as { latitude?: number | string | null; longitude?: number | string | null }) };
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { setMyCoords(getSavedCoords()); }, []);
  const myDistance = distanceLabel(mapCafe, myCoords);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('gb-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <LandingNav />
    <div className="gb-wide bg-[#FAFAF9] min-h-screen text-slate-900 font-sans pt-24 sm:pt-32 pb-32 selection:bg-blue-100 relative">
      
      {/* ========================================================= */}
      {/* 1. EDITORIAL CAFE HERO (FROSTED BANNER STYLE)             */}
      {/* ========================================================= */}
      <div className="relative flex flex-col items-center justify-center text-center mb-8 sm:mb-12 w-full max-w-[1340px] mx-auto min-h-[220px] sm:min-h-[280px]">
        
        {/* Banner Behind Heading */}
        <div className="absolute inset-0 z-0 mx-0 sm:mx-4 lg:mx-8 rounded-none sm:rounded-[32px] overflow-hidden shadow-sm">
          <Image 
            src={cover} 
            alt={`${cafe.name} cover`}
            fill 
            className="object-cover"
            priority
          />
          {/* Frosted glass overlay for high text contrast */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 sm:top-8 left-4 sm:left-10 lg:left-16 z-30">
          <button 
            onClick={() => router.push('/cafes')}
            className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-sm flex items-center justify-center text-[#020617] hover:bg-white transition-all hover:scale-[1.03] active:scale-[0.97]"
            aria-label="Back to cafes"
          >
            <MS name="arrow_back" size={22} />
          </button>
        </div>

        {/* Hero Title */}
        <div className="relative inline-flex flex-col items-center z-30 pt-4 sm:pt-0 px-4">
          <h1 
            className="text-[44px] sm:text-[76px] lg:text-[92px] font-normal tracking-normal leading-[0.9] uppercase text-[#0055D4] drop-shadow-sm flex flex-wrap justify-center"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            {cafe.name}
          </h1>

          {/* Cursive Annotation */}
          <motion.div 
            className="absolute -bottom-8 sm:-bottom-10 right-4 sm:-right-8 text-[#0F172A] -rotate-[5deg] pointer-events-none select-none"
            style={{ fontFamily: 'var(--font-caveat)', fontSize: 'clamp(20px, 3.6vw, 26px)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            order ahead &middot; skip the queue
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CAFÉ STATUS RAIL & SKIP THE QUEUE BANNER               */}
      {/* ========================================================= */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Status Rail (Desktop 3-col, Mobile flex-wrap) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 pb-6 border-b border-slate-200/60 mb-6">
          
          {/* OPEN NOW */}
          <div className="flex flex-col border-l-[3px] border-[#0055D4] pl-3">
            <div className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${acceptingOrders ? 'bg-[#0055D4] animate-pulse' : 'bg-rose-500'}`} />
              {acceptingOrders ? 'OPEN NOW' : 'CLOSED'}
            </div>
            <div className="text-[11.5px] font-medium text-slate-500">Today &middot; {hours}</div>
          </div>

          {/* ORDER AHEAD */}
          <div className="flex flex-col sm:border-l border-slate-200 sm:pl-6">
            <div className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 uppercase tracking-wider mb-0.5">
              ORDER AHEAD
            </div>
            <div className="text-[11.5px] font-medium text-slate-500">Ready in 5–8 min</div>
          </div>

          {/* DIRECTIONS */}
          <a href={directionsUrl(mapCafe)} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:border-l border-slate-200 sm:pl-6 group hover:cursor-pointer">
            <div className="text-[13px] sm:text-[14px] font-extrabold text-[#0055D4] uppercase tracking-wider mb-0.5 group-hover:underline flex items-center gap-1">
              DIRECTIONS <MS name="north_east" size={14} />
            </div>
            <div className="text-[11.5px] font-medium text-slate-500 truncate">{cafe.address ?? cafe.city ?? 'Campus'}</div>
          </a>
        </div>

        {/* Skip the Queue Product Banner */}
        <div className="w-full bg-[#EFF6FF] rounded-[16px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#DBEAFE]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="text-[#0055D4] shrink-0 mt-0.5 sm:mt-0"><MS name="schedule" size={22} /></div>
            <div>
              <div className="text-[14px] font-extrabold text-slate-900 tracking-tight">SKIP THE QUEUE</div>
              <div className="text-[12px] font-medium text-slate-600 mt-0.5">Order now &middot; choose your pickup slot &middot; walk straight to the counter.</div>
            </div>
          </div>
          {!isLoggedIn && (
            <Link href={`/login?next=/${slug}`} className="shrink-0 text-[#0055D4] text-[13px] font-extrabold hover:underline flex items-center gap-1 uppercase tracking-wide">
              LOGIN <MS name="arrow_forward" size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. THREE-COLUMN DESKTOP WORKSPACE                         */}
      {/* ========================================================= */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        
        {/* --- LEFT COLUMN: CATEGORIES --- */}
        <aside className="hidden lg:flex w-[200px] shrink-0 sticky top-12 flex-col gap-6">
          <div>
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-4 ml-4">Menu</h2>
            <nav className="flex flex-col gap-0.5">
              <button 
                onClick={() => setActiveCat('all')}
                className={`flex items-center justify-between px-4 py-2.5 text-[14.5px] transition-all relative ${activeCat === 'all' ? 'text-[#0055D4] font-extrabold bg-[#F8FAFC]/50' : 'text-slate-600 font-bold hover:text-slate-900'}`}
              >
                {activeCat === 'all' && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0055D4] rounded-r-full" />}
                <span className="uppercase tracking-wide text-[12.5px]">All Items</span>
                <span className={`text-[11px] font-bold ${activeCat === 'all' ? 'text-[#0055D4]/60' : 'text-slate-400'}`}>{available.length}</span>
              </button>
              
              {categoriesPresent.map(c => (
                <button 
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[14.5px] transition-all relative ${activeCat === c ? 'text-[#0055D4] font-extrabold bg-[#F8FAFC]/50' : 'text-slate-600 font-bold hover:text-slate-900'}`}
                >
                  {activeCat === c && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0055D4] rounded-r-full" />}
                  <span className="uppercase tracking-wide text-[12.5px]">
                    {CATEGORY_LABELS[c]}
                  </span>
                  <span className={`text-[11px] font-bold ${activeCat === c ? 'text-[#0055D4]/60' : 'text-slate-400'}`}>
                    {available.filter(i => i.category === c).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* --- MOBILE CATEGORY RAIL --- */}
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar border-b border-slate-200 sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-md pt-2 mb-4 -mt-2">
          <div className="flex items-center px-4 gap-6">
            <button onClick={() => setActiveCat('all')} className={`shrink-0 py-3 text-[13px] font-extrabold uppercase tracking-wide transition-all relative ${activeCat === 'all' ? 'text-[#0055D4]' : 'text-slate-500'}`}>
              All
              {activeCat === 'all' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0055D4] rounded-t-full" />}
            </button>
            {categoriesPresent.map(c => (
              <button key={c} onClick={() => setActiveCat(c)} className={`shrink-0 py-3 text-[13px] font-extrabold uppercase tracking-wide transition-all relative ${activeCat === c ? 'text-[#0055D4]' : 'text-slate-500'}`}>
                {CATEGORY_LABELS[c]}
                {activeCat === c && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0055D4] rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* --- CENTER COLUMN: SEARCH, POPULAR, MENU --- */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-8 pb-10">
          
          {/* Search Bar */}
          <div className="relative group w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0055D4] transition-colors">
              <MS name="search" size={20} />
            </div>
            <input 
              id="gb-search-input"
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coffee, croissants..."
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-[14px] py-3.5 pl-11 pr-11 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#0055D4]/20 focus:border-[#0055D4] transition-all text-[14.5px] font-medium placeholder:text-slate-400"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                <MS name="close" size={18} />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-400">/</kbd>
              </div>
            )}
          </div>

          {/* Menu Sections */}
          <div className="flex flex-col gap-12">
            {sections.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium text-[15px]">
                Nothing for that craving yet.
              </div>
            )}
            {sections.map(({ key, items: catItems }) => (
              <section key={key} className="scroll-mt-24">
                <div className="mb-6 border-b border-slate-200/60 pb-3 flex items-baseline justify-between">
                  <h3 className="text-[24px] sm:text-[28px] font-normal text-[#020617] uppercase tracking-wide" style={{ fontFamily: 'var(--font-anton)' }}>
                    {key}
                  </h3>
                  <div className="text-[14px] font-bold text-slate-400">{catItems.length} ITEMS</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
                  {catItems.map(item => {
                    const qty = qtyOf(item.id);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => setCustomizeItem(item)}
                        className="bg-white hover:bg-slate-50/50 transition-colors duration-300 rounded-[16px] p-2 flex flex-col h-full cursor-pointer group"
                      >
                        <div className="h-[180px] w-full relative bg-slate-100 rounded-[12px] overflow-hidden mb-3">
                          <Image src={menuImageSrc(item.image_url)} alt={item.name} fill sizes="(max-width: 640px) 100vw, 300px" style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-700" />
                          {item.is_veg && <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded p-0.5 shadow-sm"><Veg veg={true} /></div>}
                        </div>
                        <div className="px-1 flex flex-col flex-1">
                          <div className="flex justify-between items-start gap-4 mb-1">
                            <h4 className="text-[16px] sm:text-[17px] font-bold text-[#020617] leading-tight">{item.name}</h4>
                          </div>
                          {item.description && <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-3">{item.description}</p>}
                          {!item.description && <div className="mb-2" />}
                          
                          <div className="mt-auto flex items-center justify-between" onClick={e => e.stopPropagation()}>
                            <span className="text-[15px] sm:text-[16px] font-extrabold text-[#020617] tracking-tight">{inr(item.price)}</span>
                            
                            <AnimatePresence mode="wait">
                              {qty > 0 ? (
                                <motion.div 
                                  key="stepper"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center bg-[#EFF6FF] border border-[#0055D4]/20 rounded-lg overflow-hidden shadow-sm"
                                >
                                  <button onClick={() => updateQty(plainLineKey(item.id), qty - 1)} className="w-8 h-8 flex items-center justify-center text-[#0055D4] hover:bg-[#0055D4]/10 transition-colors active:scale-90">
                                    <MS name="remove" size={16} />
                                  </button>
                                  <span className="w-6 text-center text-[14px] font-bold text-[#0055D4]">{qty}</span>
                                  <button onClick={() => guardedAdd(item.id, () => updateQty(plainLineKey(item.id), qty + 1))} className={`w-8 h-8 flex items-center justify-center text-[#0055D4] hover:bg-[#0055D4]/10 transition-colors active:scale-90 ${shakeId === item.id ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                                    <MS name="add" size={16} />
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="add"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  onClick={() => guardedAdd(item.id, () => handleAddClick(item))}
                                  className={`flex items-center gap-1 px-4 py-2 bg-white border border-[#0055D4]/30 hover:bg-[#0055D4] text-[#0055D4] hover:text-white text-[13.5px] font-bold rounded-lg shadow-sm transition-all active:scale-95 ${shakeId === item.id ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                                >
                                  <MS name="add" size={16} /> Add
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>

        {/* --- RIGHT COLUMN: ORDER TICKET / CART --- */}
        <aside className="hidden lg:flex w-[320px] shrink-0 sticky top-12 flex-col">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MS name="local_mall" size={20} color="#0F172A" />
                <h3 className="text-[17px] font-extrabold text-slate-800 tracking-tight uppercase">Your Order</h3>
              </div>
              {cartCount > 0 && (
                <button onClick={() => setShowClearConfirm(true)} className="text-[12px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider">Clear</button>
              )}
            </div>

            {cartCount === 0 ? (
              <div className="px-6 py-10 text-center flex flex-col items-center justify-center">
                <div className="text-[14px] font-bold text-slate-800 mb-0.5">Your next coffee belongs here.</div>
                <div className="text-[13px] font-medium text-slate-500">Add an item to get started.</div>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-2">
                  {cartItems.map(line => {
                    const key = cartLineKey(line);
                    const extras = [...(line.variation ? [line.variation.name] : []), ...(line.options ?? []).map(o => o.name), ...(line.addons ?? []).map(a => a.name)];
                    const unit = line.price + (line.addons ?? []).reduce((s, a) => s + a.price, 0) + (line.options ?? []).reduce((s, o) => s + o.price, 0);
                    return (
                      <div key={key} className="p-4 bg-white hover:bg-slate-50 rounded-xl transition-colors mb-1 group">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[14.5px] font-bold text-slate-800 leading-snug">{line.name}</div>
                            {extras.length > 0 && <div className="text-[12px] font-medium text-slate-500 mt-1 line-clamp-2">{extras.join(' · ')}</div>}
                            <div className="text-[14px] font-bold text-slate-900 mt-2">{inr(unit * line.quantity)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <button onClick={() => updateQty(key, line.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><MS name="remove" size={16} /></button>
                            <span className="w-6 text-center text-[13.5px] font-bold text-slate-800">{line.quantity}</span>
                            <button onClick={() => guardedAdd(line.menu_item_id, () => updateQty(key, line.quantity + 1))} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><MS name="add" size={16} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[14px] font-bold text-slate-500">Subtotal</span>
                    <span className="text-[18px] font-extrabold text-slate-900">{inr(cartTotal())}</span>
                  </div>
                  <Link href={`/${slug}/cart`} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0055D4] text-white text-[14px] font-extrabold uppercase tracking-wide transition-all shadow-sm hover:shadow-md hover:bg-[#0040A1] active:scale-[0.98]">
                    Pick a pickup slot <MS name="arrow_forward" size={18} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </aside>

      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY CART BOTTOM BAR                             */}
      {/* ========================================================= */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-white/0 pointer-events-none pb-[calc(16px+env(safe-area-inset-bottom))]">
          <Link href={`/${slug}/cart`} className="pointer-events-auto w-full h-[60px] bg-[#0055D4] text-white rounded-[16px] px-5 flex items-center justify-between shadow-[0_8px_24px_rgba(0,85,212,0.25)] active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-bold">{cartCount} ITEM{cartCount !== 1 ? 'S' : ''}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="text-[14px] font-bold">{inr(cartTotal())}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[14px] font-extrabold uppercase tracking-wide">
              View Order <MS name="arrow_forward" size={18} />
            </div>
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS & OVERLAYS                                         */}
      {/* ========================================================= */}
      
      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-[24px] p-6 w-full max-w-[340px] shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-[20px] font-bold text-slate-900 mb-2">Clear cart?</h3>
            <p className="text-[14.5px] text-slate-500 font-medium mb-6">Your {cartCount} item{cartCount > 1 ? 's' : ''} will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => { clearCart(); setShowClearConfirm(false); }} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors">Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Sheet */}
      {customizeItem && (
        <CustomizeSheet
          item={customizeItem}
          variations={variationsFor(customizeItem)}
          groups={groupsFor(customizeItem)}
          addons={addonsFor(customizeItem)}
          items={items}
          cafeOpen={acceptingOrders}
          onClose={() => setCustomizeItem(null)}
          onAdd={selection => confirmCustomization(customizeItem, selection)}
        />
      )}

    </div>
    <LandingFooter />
    </>
  );
}
