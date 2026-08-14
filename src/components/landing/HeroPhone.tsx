'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useState, useEffect } from 'react';

// App States
export type AppState = 'HOME' | 'CAFE' | 'PRODUCT' | 'CART' | 'CONFIRMATION' | 'READY' | 'EXPLORE' | 'ORDERS' | 'PROFILE';

export interface CafeItem {
  id: number;
  name: string;
  rating: number;
  dist: string;
  prep: string;
  tag: string;
  img: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  desc: string;
  img: string;
}

const CAFES: CafeItem[] = [
  { id: 1, name: 'Blue Tokai Coffee', rating: 4.8, dist: '0.8 km', prep: '7 min', tag: 'Specialty Espresso', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80' },
  { id: 2, name: 'Third Wave Coffee', rating: 4.7, dist: '1.2 km', prep: '9 min', tag: 'Handcrafted Brews', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80' },
  { id: 3, name: 'Subko Coffee Bar', rating: 4.9, dist: '1.8 km', prep: '6 min', tag: 'Artisan Bakery', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' },
];

const MENU: MenuItem[] = [
  { id: 1, name: 'Iced Cappuccino', category: 'Coffee', price: 180, desc: 'Bold espresso topped with cold foamed milk.', img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&q=80' },
  { id: 2, name: 'Butter Croissant', category: 'Pastry', price: 160, desc: 'Flaky, double-baked French butter croissant.', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80' },
  { id: 3, name: 'Nitro Cold Brew', category: 'Cold Brew', price: 220, desc: 'Velvety nitrogen-infused steep brew.', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
  { id: 4, name: 'Iced Matcha Latte', category: 'Matcha', price: 210, desc: 'Ceremonial Uji matcha with oat milk.', img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&q=80' },
];

const LOCATIONS = ['Delhi NCR', 'Connaught Place', 'Greater Kailash', 'Vasant Kunj', 'Khan Market'];
const CATEGORIES = ['All', '☕ Coffee', 'Cold Brew', 'Matcha', 'Pastry'];

const OFFERS = [
  { title: 'WEEKEND SPECIAL', offer: '20% OFF', sub: 'on your first order', code: 'GRAB20', bg: 'from-[#F09819] to-[#E65100]' },
  { title: 'MORNING TREAT', offer: 'FREE CROISSANT', sub: 'with any Nitro Cold Brew', code: 'BREWTREAT', bg: 'from-[#312E81] to-[#4F46E5]' },
  { title: 'GRABBIT REWARD', offer: '₹100 OFF', sub: 'on orders above ₹400', code: 'SAVEMORE', bg: 'from-[#065F46] to-[#10B981]' },
];

interface HeroPhoneProps {
  activeState?: AppState;
  onStateChange?: (state: AppState) => void;
}

export function HeroPhone({ activeState: externalState, onStateChange }: HeroPhoneProps) {
  const [internalState, setInternalState] = useState<AppState>('HOME');
  const activeState = externalState || internalState;

  const changeState = (newState: AppState) => {
    setInternalState(newState);
    if (onStateChange) onStateChange(newState);
  };

  // Interactive App State
  const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  
  // Cart & Product Detail State
  const [selectedCafe, setSelectedCafe] = useState<CafeItem>(CAFES[0]);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem>(MENU[0]);
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['Oat Milk']);
  const [cartItems, setCartItems] = useState<{ product: MenuItem; size: string; addons: string[] }>({
    product: MENU[0],
    size: 'Medium',
    addons: ['Oat Milk']
  });

  // Auto-advance offer carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync external state
  useEffect(() => {
    if (externalState) {
      setInternalState(externalState);
    }
  }, [externalState]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    setCartItems({ product: selectedProduct, size: selectedSize, addons: selectedAddons });
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      changeState('CART');
    }, 700);
  };

  const filteredCafes = CAFES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenu = MENU.filter(m => {
    const cat = selectedCategory.replace('☕ ', '');
    const matchesCategory = selectedCategory === 'All' || m.category === cat;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      className="relative mx-auto w-[320px] sm:w-[340px] lg:w-[350px] h-[550px] sm:h-[585px] lg:h-[610px] rounded-[48px] bg-[#120D0B] p-[10px] shadow-[0_24px_50px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.4)] border-[1px] border-white/15 ring-4 ring-[#261E1A] will-change-transform select-none"
    >
      {/* Dynamic Hardware Buttons */}
      <div className="absolute top-[110px] -left-[13px] w-[3px] h-[28px] bg-[#2A201C] rounded-l-md" />
      <div className="absolute top-[150px] -left-[13px] w-[3px] h-[45px] bg-[#2A201C] rounded-l-md" />
      <div className="absolute top-[205px] -left-[13px] w-[3px] h-[45px] bg-[#2A201C] rounded-l-md" />
      <div className="absolute top-[160px] -right-[13px] w-[3px] h-[60px] bg-[#2A201C] rounded-r-md" />

      {/* Screen Glare & Reflection Overlay */}
      <div className="absolute inset-0 rounded-[46px] pointer-events-none z-50 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-60" />

      {/* Internal Screen Container */}
      <div className="relative w-full h-full bg-[#FDFBF7] rounded-[38px] overflow-hidden flex flex-col justify-between text-[#1A1311] font-sans">
        
        {/* Dynamic Island & Status Bar */}
        <div className="relative pt-2.5 px-6 flex items-center justify-between z-30 shrink-0 bg-[#FDFBF7]">
          <span className="text-[12px] font-bold tracking-tight text-[#1A1311]">9:41</span>
          
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[94px] h-[24px] bg-[#1A1311] rounded-full flex items-center justify-between px-2.5 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A201C]" />
            <div className="w-2 h-2 rounded-full bg-[#10B981]/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-[#1A1311]">
            <MS name="signal_cellular_4_bar" size={13} />
            <MS name="wifi" size={13} />
            <MS name="battery_full" size={14} />
          </div>
        </div>

        {/* ========================================================= */}
        {/* APP SCREEN CONTENT SWITCHER WITH ANIMS */}
        {/* ========================================================= */}
        <div className="relative flex-1 overflow-y-auto no-scrollbar pt-2 px-3.5 pb-2">
          
          <AnimatePresence mode="wait">
            
            {/* ----------------------------------------------------- */}
            {/* 1. HOME SCREEN */}
            {/* ----------------------------------------------------- */}
            {activeState === 'HOME' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 pb-4"
              >
                {/* Header Greeting & Location Selector */}
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <div className="text-[11px] font-medium text-[#8A7A6B]">Good morning 👋</div>
                    <button 
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="flex items-center gap-1 text-[13.5px] font-extrabold text-[#1A1311] hover:text-[#F09819] transition-colors"
                    >
                      <MS name="location_on" size={14} className="text-[#F09819]" />
                      <span>{selectedLocation}</span>
                      <MS name="keyboard_arrow_down" size={15} />
                    </button>
                  </div>

                  {/* Notification Button */}
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setHasUnreadNotif(false);
                    }}
                    className="relative w-8.5 h-8.5 rounded-full bg-white border border-[#EBE4D8] shadow-xs flex items-center justify-center text-[#1A1311] hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <MS name="notifications" size={17} />
                    {hasUnreadNotif && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F09819] animate-pulse" />
                    )}
                  </button>
                </div>

                {/* SEARCH BAR WITH EXPANDABLE SUGGESTIONS */}
                <div className="relative">
                  <div className={`flex items-center gap-2 bg-white border ${isSearchFocused ? 'border-[#F09819] ring-2 ring-[#F09819]/20' : 'border-[#EBE4D8]'} rounded-xl px-3 py-2 shadow-2xs transition-all`}>
                    <MS name="search" size={16} className="text-[#8A7A6B]" />
                    <input 
                      type="text"
                      placeholder="Search cafés, coffee, snacks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      className="w-full text-[12px] bg-transparent outline-none text-[#1A1311] placeholder:text-[#8A7A6B]"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')}>
                        <MS name="close" size={14} className="text-[#8A7A6B]" />
                      </button>
                    )}
                  </div>

                  {/* Search Suggestions Dropdown */}
                  {isSearchFocused && !searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EBE4D8] rounded-xl p-2.5 shadow-md z-40 text-left">
                      <div className="text-[9px] font-bold text-[#8A7A6B] uppercase mb-1.5 tracking-wider">Popular Nearby</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['☕ Cappuccino', '☕ Cold Brew', '🥐 Croissant', '🍵 Matcha'].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(item.replace(/^[^\s]+\s/, ''))}
                            className="text-[10px] font-bold bg-[#FDFBF7] border border-[#EBE4D8] hover:bg-[#F09819] hover:text-white px-2 py-1 rounded-md transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* OFFER BANNER CAROUSEL */}
                <div 
                  onClick={() => setOfferIndex((offerIndex + 1) % OFFERS.length)}
                  className={`relative w-full rounded-2xl p-3.5 text-white bg-gradient-to-r ${OFFERS[offerIndex].bg} shadow-sm overflow-hidden cursor-pointer active:scale-98 transition-all`}
                >
                  <div className="relative z-10">
                    <span className="text-[9px] font-extrabold tracking-[0.14em] uppercase bg-black/25 px-2 py-0.5 rounded-full">
                      {OFFERS[offerIndex].title}
                    </span>
                    <div className="text-[20px] font-black leading-tight mt-1">
                      {OFFERS[offerIndex].offer}
                    </div>
                    <div className="text-[11px] font-medium text-white/90 mb-2">
                      {OFFERS[offerIndex].sub}
                    </div>
                    <div className="inline-flex items-center gap-1 bg-white text-[#1A1311] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                      Use code {OFFERS[offerIndex].code}
                    </div>
                  </div>

                  {/* Offer Decoration Graphic */}
                  <div className="absolute -right-3 -bottom-3 w-24 h-24 rounded-full bg-white/10 blur-xs pointer-events-none" />
                  
                  {/* Pagination Dots */}
                  <div className="absolute bottom-2 right-3 flex gap-1 z-10">
                    {OFFERS.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === offerIndex ? 'bg-white w-3' : 'bg-white/40'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* CATEGORIES HORIZONTAL FILTER */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-extrabold text-[#1A1311]">Categories</span>
                    <span className="text-[10px] font-bold text-[#F09819]">See all</span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                          selectedCategory === cat 
                            ? 'bg-[#F09819] text-white shadow-xs' 
                            : 'bg-white border border-[#EBE4D8] text-[#1A1311] hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NEARBY CAFÉS SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-extrabold text-[#1A1311]">Cafés near you</span>
                    <span className="text-[10px] font-bold text-[#F09819]">4 nearby</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {filteredCafes.map((cafe) => (
                      <motion.div
                        key={cafe.id}
                        whileHover={{ y: -2, scale: 1.01 }}
                        onClick={() => {
                          setSelectedCafe(cafe);
                          changeState('CAFE');
                        }}
                        className="flex items-center gap-2.5 bg-white border border-[#EBE4D8] rounded-2xl p-2 shadow-2xs cursor-pointer hover:border-[#F09819]/50 transition-all"
                      >
                        <img src={cafe.img} alt={cafe.name} className="w-13 h-13 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-[#1A1311] truncate">{cafe.name}</span>
                            <button onClick={(e) => toggleFavorite(cafe.id, e)}>
                              <MS 
                                name={favorites.includes(cafe.id) ? "favorite" : "favorite_border"} 
                                size={14} 
                                className={favorites.includes(cafe.id) ? "text-[#F09819]" : "text-[#8A7A6B]"} 
                              />
                            </button>
                          </div>
                          <div className="text-[10px] text-[#8A7A6B] flex items-center gap-1 mt-0.5">
                            <span className="text-[#F09819] font-bold">★ {cafe.rating}</span>
                            <span>•</span>
                            <span>{cafe.dist}</span>
                          </div>
                          <div className="inline-flex items-center gap-1 text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded-full mt-1">
                            <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
                            Ready in {cafe.prep}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 2. CAFÉ DETAIL SCREEN */}
            {/* ----------------------------------------------------- */}
            {activeState === 'CAFE' && (
              <motion.div
                key="cafe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 pb-4 text-left"
              >
                {/* Back bar */}
                <button 
                  onClick={() => changeState('HOME')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F09819] hover:underline"
                >
                  <MS name="arrow_back" size={14} /> Back to Cafés
                </button>

                {/* Cafe Hero Header */}
                <div className="relative rounded-2xl overflow-hidden h-28 border border-[#EBE4D8]">
                  <img src={selectedCafe.img} alt={selectedCafe.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                    <div className="text-[15px] font-extrabold leading-tight">{selectedCafe.name}</div>
                    <div className="text-[10px] text-white/80 flex items-center gap-2 mt-0.5">
                      <span className="text-[#F09819] font-bold">★ {selectedCafe.rating}</span>
                      <span>•</span>
                      <span>{selectedCafe.dist}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Ready in {selectedCafe.prep}</span>
                    </div>
                  </div>
                </div>

                {/* Popular Menu Items */}
                <div className="text-[12px] font-extrabold text-[#1A1311] mt-1">Popular Menu</div>
                
                <div className="flex flex-col gap-2">
                  {filteredMenu.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSelectedProduct(item);
                        changeState('PRODUCT');
                      }}
                      className="flex items-center justify-between bg-white border border-[#EBE4D8] rounded-xl p-2.5 shadow-2xs hover:border-[#F09819] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="text-[11.5px] font-bold text-[#1A1311]">{item.name}</div>
                          <div className="text-[10px] text-[#8A7A6B] truncate max-w-[130px]">{item.desc}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-black text-[#1A1311]">₹{item.price}</div>
                        <span className="text-[9px] font-bold text-[#F09819] bg-[#F09819]/10 px-1.5 py-0.5 rounded-full">
                          + Add
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 3. PRODUCT CUSTOMIZATION SCREEN */}
            {/* ----------------------------------------------------- */}
            {activeState === 'PRODUCT' && (
              <motion.div
                key="product"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 pb-4 text-left"
              >
                <button 
                  onClick={() => changeState('CAFE')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F09819]"
                >
                  <MS name="arrow_back" size={14} /> Back to menu
                </button>

                <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-32 rounded-2xl object-cover border border-[#EBE4D8]" />

                <div>
                  <div className="text-[16px] font-black text-[#1A1311]">{selectedProduct.name}</div>
                  <div className="text-[11px] text-[#8A7A6B] leading-tight mt-0.5">{selectedProduct.desc}</div>
                  <div className="text-[15px] font-black text-[#F09819] mt-1">₹{selectedProduct.price}</div>
                </div>

                {/* Size Selection */}
                <div>
                  <div className="text-[10px] font-bold text-[#8A7A6B] uppercase mb-1">Select Size</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Small', 'Medium', 'Large'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                          selectedSize === s ? 'bg-[#F09819] text-white border-[#F09819]' : 'bg-white border-[#EBE4D8] text-[#1A1311]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <div className="text-[10px] font-bold text-[#8A7A6B] uppercase mb-1">Custom Milk / Extra</div>
                  {['Oat Milk (+₹30)', 'Extra Shot (+₹40)'].map(addon => (
                    <label key={addon} className="flex items-center justify-between text-[11px] font-bold py-1 text-[#1A1311] cursor-pointer">
                      <span>{addon}</span>
                      <input 
                        type="checkbox" 
                        defaultChecked={addon.includes('Oat')} 
                        className="accent-[#F09819]" 
                      />
                    </label>
                  ))}
                </div>

                {/* Add to order button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#1A1311] hover:bg-[#F09819] text-white py-2.5 rounded-xl font-bold text-[12.5px] transition-colors shadow-xs active:scale-95 flex items-center justify-center gap-1.5 mt-1"
                >
                  <span>Add to order</span> • <span>₹{selectedProduct.price + (selectedSize === 'Large' ? 30 : 0)}</span>
                </button>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 4. CART & SUMMARY */}
            {/* ----------------------------------------------------- */}
            {activeState === 'CART' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-3 text-left pb-4"
              >
                <div className="text-[14px] font-extrabold text-[#1A1311]">Your Order Summary</div>
                
                <div className="bg-white border border-[#EBE4D8] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <img src={cartItems.product.img} className="w-9 h-9 rounded-lg object-cover" alt="item" />
                      <div>
                        <div className="text-[11.5px] font-bold text-[#1A1311]">{cartItems.product.name}</div>
                        <div className="text-[9.5px] text-[#8A7A6B]">{cartItems.size} • Oat Milk</div>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[#1A1311]">₹{cartItems.product.price}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#8A7A6B]">
                    <span>Subtotal</span>
                    <span>₹{cartItems.product.price}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A7A6B]">
                    <span>Convenience Fee (Zero Wait)</span>
                    <span className="text-[#10B981] font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-[12.5px] font-black text-[#1A1311] border-t border-gray-100 pt-1.5">
                    <span>Total</span>
                    <span>₹{cartItems.product.price}</span>
                  </div>
                </div>

                <div className="bg-[#FFF3DC] border border-[#FFE7B0] rounded-xl p-2.5 flex items-center gap-2 text-[10.5px] text-[#8A7A6B]">
                  <MS name="schedule" size={16} className="text-[#F09819]" />
                  <span>Estimated pickup ready in <strong>7 mins</strong></span>
                </div>

                <button
                  onClick={() => changeState('CONFIRMATION')}
                  className="w-full bg-[#1A1311] hover:bg-[#F09819] text-white py-2.5 rounded-xl font-bold text-[12.5px] transition-colors shadow-xs active:scale-95 flex items-center justify-center gap-1"
                >
                  Order ahead →
                </button>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 5. CONFIRMATION SCREEN */}
            {/* ----------------------------------------------------- */}
            {activeState === 'CONFIRMATION' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center gap-3 py-6"
              >
                <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                  <MS name="check_circle" size={32} />
                </div>

                <div>
                  <div className="text-[10px] font-bold tracking-[0.14em] text-[#10B981] uppercase">ORDER CONFIRMED</div>
                  <div className="text-[16px] font-black text-[#1A1311] mt-0.5">Blue Tokai Coffee</div>
                  <div className="text-[11px] text-[#8A7A6B]">Order #GRB2408</div>
                </div>

                <div className="bg-white border border-[#EBE4D8] rounded-2xl p-4 w-full shadow-2xs">
                  <div className="text-[10px] font-bold text-[#8A7A6B] uppercase">Estimated Pickup In</div>
                  <div className="text-[32px] font-black text-[#F09819] leading-none my-1">07 MIN</div>
                  <div className="text-[10.5px] text-[#8A7A6B]">We'll have it ready when you arrive.</div>
                </div>

                <button
                  onClick={() => changeState('READY')}
                  className="w-full bg-[#F09819] text-white py-2.5 rounded-xl font-bold text-[12px] shadow-xs active:scale-95"
                >
                  View Order Status →
                </button>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 6. ORDER READY SCREEN (SYNCS WITH FLOATING CARD) */}
            {/* ----------------------------------------------------- */}
            {activeState === 'READY' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center gap-3 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#F09819] text-white flex items-center justify-center animate-bounce shadow-md">
                  <MS name="local_cafe" size={24} />
                </div>

                <div>
                  <span className="text-[9px] font-bold tracking-[0.16em] uppercase bg-[#10B981]/15 text-[#10B981] px-2.5 py-0.5 rounded-full">
                    ● ORDER READY
                  </span>
                  <div className="text-[17px] font-black text-[#1A1311] mt-1.5">Pick Up Now</div>
                  <div className="text-[11px] text-[#8A7A6B]">Counter #2 • Blue Tokai</div>
                </div>

                <div className="bg-white border border-[#EBE4D8] rounded-2xl p-3.5 w-full shadow-2xs text-left">
                  <div className="text-[10px] font-bold text-[#8A7A6B] uppercase mb-1">Your Items</div>
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[#1A1311]">
                    <span>1x Iced Cappuccino (Medium)</span>
                    <span>Ready</span>
                  </div>
                  <div className="text-[10px] text-[#8A7A6B] mt-0.5">Barista KDS Alerted • Zero Wait</div>
                </div>

                <button
                  onClick={() => changeState('HOME')}
                  className="w-full bg-[#1A1311] text-white py-2 rounded-xl font-bold text-[11.5px]"
                >
                  Done • Back to Home
                </button>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 7. EXPLORE TAB */}
            {/* ----------------------------------------------------- */}
            {activeState === 'EXPLORE' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 text-left pb-4"
              >
                <div className="text-[14px] font-extrabold text-[#1A1311]">Explore Cafés Near You</div>
                
                <div className="grid grid-cols-2 gap-2">
                  {CAFES.concat([{ id: 4, name: 'Roastery Coffee', rating: 4.9, dist: '2.1 km', prep: '8 min', tag: 'Cold Brews', img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80' }]).map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedCafe(c);
                        changeState('CAFE');
                      }}
                      className="bg-white border border-[#EBE4D8] rounded-xl p-2 text-left cursor-pointer hover:border-[#F09819]"
                    >
                      <img src={c.img} className="w-full h-16 rounded-lg object-cover mb-1.5" alt="cafe" />
                      <div className="text-[11px] font-bold text-[#1A1311] truncate">{c.name}</div>
                      <div className="text-[9px] text-[#8A7A6B]">★ {c.rating} • {c.dist}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 8. ORDERS TAB */}
            {/* ----------------------------------------------------- */}
            {activeState === 'ORDERS' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 text-left pb-4"
              >
                <div className="text-[14px] font-extrabold text-[#1A1311]">Active & Past Orders</div>
                
                <div 
                  onClick={() => changeState('READY')}
                  className="bg-[#FFF3DC] border border-[#F09819] rounded-2xl p-3 cursor-pointer shadow-2xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#F09819] uppercase">Active Order</span>
                    <span className="text-[10px] font-bold text-[#10B981]">● Ready Now</span>
                  </div>
                  <div className="text-[13px] font-black text-[#1A1311]">Blue Tokai Coffee</div>
                  <div className="text-[10px] text-[#8A7A6B]">Order #GRB2408 • Counter #2</div>
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------- */}
            {/* 9. PROFILE TAB */}
            {/* ----------------------------------------------------- */}
            {activeState === 'PROFILE' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 text-left pb-4"
              >
                <div className="text-[14px] font-extrabold text-[#1A1311]">Your Profile</div>
                
                <div className="bg-white border border-[#EBE4D8] rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F09819] text-white font-bold flex items-center justify-center">
                    JD
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#1A1311]">John Doe</div>
                    <div className="text-[10px] text-[#8A7A6B]">john@grabbit.com • 340 pts</div>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE4D8] rounded-xl p-2.5 flex flex-col gap-2 text-[11px] font-bold text-[#1A1311]">
                  <div className="flex items-center justify-between cursor-pointer">
                    <span>Saved Cafés</span>
                    <span>1</span>
                  </div>
                  <div className="flex items-center justify-between cursor-pointer">
                    <span>Payment Methods</span>
                    <span>UPI</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Location Picker Sheet Dropdown */}
          {showLocationPicker && (
            <div className="absolute inset-x-2 top-12 bg-white border border-[#EBE4D8] rounded-2xl p-3 shadow-lg z-50 text-left">
              <div className="text-[10px] font-bold text-[#8A7A6B] uppercase mb-1.5">Select Location</div>
              <div className="flex flex-col gap-1">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className={`flex items-center justify-between text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors ${
                      selectedLocation === loc ? 'bg-[#FFF3DC] text-[#F09819]' : 'hover:bg-gray-50 text-[#1A1311]'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <MS name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute inset-x-2 top-12 bg-white border border-[#EBE4D8] rounded-2xl p-3 shadow-lg z-50 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[#8A7A6B] uppercase">Notifications</span>
                <button onClick={() => setShowNotifications(false)}>
                  <MS name="close" size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 text-[10.5px]">
                <div className="p-1.5 rounded bg-gray-50 font-medium">● Your Blue Tokai order is ready!</div>
                <div className="p-1.5 rounded bg-gray-50 font-medium">● New café nearby: Subko Coffee Bar</div>
                <div className="p-1.5 rounded bg-gray-50 font-medium">● You earned 100 Grabbit points</div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {addedToast && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#1A1311] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1">
              <MS name="check" size={13} className="text-[#10B981]" /> Added to order!
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION TABS */}
        {/* ========================================================= */}
        <div className="h-12 border-t border-[#EBE4D8] bg-white px-4 flex items-center justify-between shrink-0 rounded-b-[38px] z-30">
          <button 
            onClick={() => changeState('HOME')}
            className={`flex flex-col items-center text-[9px] font-bold transition-colors ${
              ['HOME', 'CAFE', 'PRODUCT'].includes(activeState) ? 'text-[#F09819]' : 'text-[#8A7A6B]'
            }`}
          >
            <MS name="home" size={18} />
            <span>Home</span>
          </button>

          <button 
            onClick={() => changeState('EXPLORE')}
            className={`flex flex-col items-center text-[9px] font-bold transition-colors ${
              activeState === 'EXPLORE' ? 'text-[#F09819]' : 'text-[#8A7A6B]'
            }`}
          >
            <MS name="explore" size={18} />
            <span>Explore</span>
          </button>

          <button 
            onClick={() => changeState('CART')}
            className={`relative flex flex-col items-center text-[9px] font-bold transition-colors ${
              ['CART', 'CONFIRMATION', 'READY', 'ORDERS'].includes(activeState) ? 'text-[#F09819]' : 'text-[#8A7A6B]'
            }`}
          >
            <MS name="shopping_bag" size={18} />
            <span>Orders</span>
          </button>

          <button 
            onClick={() => changeState('PROFILE')}
            className={`flex flex-col items-center text-[9px] font-bold transition-colors ${
              activeState === 'PROFILE' ? 'text-[#F09819]' : 'text-[#8A7A6B]'
            }`}
          >
            <MS name="person" size={18} />
            <span>Profile</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
