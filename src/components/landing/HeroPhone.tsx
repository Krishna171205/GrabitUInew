'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useState, useEffect } from 'react';

export type AppState = 'HOME' | 'EXPLORE' | 'CAFE' | 'PRODUCT' | 'CART' | 'CONFIRMATION' | 'READY' | 'PROFILE';

interface HeroPhoneProps {
  activeState?: AppState;
  activeEnergyCard?: string | null;
  onStateChange?: (state: AppState) => void;
}

const promoThemes: Record<string, { tag: string; title: string; code: string; color: string; gradient: string; img: string }> = {
  cafes: {
    tag: 'Weekend Special',
    title: '20% OFF',
    code: 'Use code GRAB20',
    color: '#D46C20',
    gradient: 'from-[#D46C20] via-[#D46C20]/80 to-transparent',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'
  },
  ready: {
    tag: 'Express Pickup',
    title: 'ZERO WAIT',
    code: 'Pre-order ahead',
    color: '#050B14',
    gradient: 'from-[#050B14] via-[#050B14]/80 to-transparent',
    img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop'
  },
  time: {
    tag: 'Happy Hour',
    title: 'BUY 1 GET 1',
    code: 'Use code BOGO50',
    color: '#0040A1',
    gradient: 'from-[#0040A1] via-[#0040A1]/80 to-transparent',
    img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=600&auto=format&fit=crop'
  },
  rated: {
    tag: 'Top Rated',
    title: '4.9★ CAFÉS',
    code: 'Explore Delhi',
    color: '#3E2C22',
    gradient: 'from-[#3E2C22] via-[#3E2C22]/80 to-transparent',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop'
  }
};

export function HeroPhone({ activeState = 'CAFE', activeEnergyCard = 'cafes', onStateChange }: HeroPhoneProps) {
  const [internalState, setInternalState] = useState<AppState>('CAFE');
  const [favorite, setFavorite] = useState(false);
  
  // Active promo theme based on current energy transition
  const currentPromoKey = (activeEnergyCard && promoThemes[activeEnergyCard]) ? activeEnergyCard : 'cafes';
  const promo = promoThemes[currentPromoKey];
  
  // Interactive App Sub-States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState(true); // GRAB20 enabled by default
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Automated Simulation Tap indicator ('item1' | 'item2' | 'viewCart' | 'pay' | null)
  const [simulatedTap, setSimulatedTap] = useState<'item1' | 'item2' | 'viewCart' | 'pay' | null>(null);
  const [isManual, setIsManual] = useState(false);

  const state = onStateChange ? activeState : internalState;
  const setState = (newState: AppState) => {
    if (onStateChange) onStateChange(newState);
    else setInternalState(newState);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Automated Continuous Ordering Cycle (Add 2 items -> Cart -> Pay -> Confirmation -> Ready -> Loop)
  useEffect(() => {
    if (isManual) {
      const resumeTimer = setTimeout(() => setIsManual(false), 7000);
      return () => clearTimeout(resumeTimer);
    }

    const timers: NodeJS.Timeout[] = [];

    const runStoryCycle = () => {
      // 0.0s: Start on Cafe Menu with empty cart
      setState('CAFE');
      setCartCount(0);
      setSimulatedTap(null);

      // 1.0s: Tap & Add 1st item (Vietnamese Iced Coffee)
      timers.push(setTimeout(() => {
        setSimulatedTap('item1');
        setCartCount(1);
        showToast('Added Vietnamese Iced Coffee!');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 1000));

      // 2.6s: Tap & Add 2nd item (Almond Croissant)
      timers.push(setTimeout(() => {
        setSimulatedTap('item2');
        setCartCount(2);
        showToast('Added Almond Croissant!');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 2600));

      // 4.2s: Tap View Cart button
      timers.push(setTimeout(() => {
        setSimulatedTap('viewCart');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 4200));

      // 4.8s: Transition to Cart Screen
      timers.push(setTimeout(() => {
        setState('CART');
      }, 4800));

      // 7.0s: Tap Pay & Order button
      timers.push(setTimeout(() => {
        setSimulatedTap('pay');
        showToast('Processing UPI payment...');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 7000));

      // 7.8s: Transition to Brewing / Preparing Screen
      timers.push(setTimeout(() => {
        setState('CONFIRMATION');
      }, 7800));

      // 10.8s: Transition to Order Ready for Pickup Screen
      timers.push(setTimeout(() => {
        setState('READY');
      }, 10800));
    };

    runStoryCycle();
    const interval = setInterval(runStoryCycle, 14800);

    return () => {
      clearInterval(interval);
      timers.forEach(t => clearTimeout(t));
    };
  }, [isManual]);

  const handleUserInteraction = () => {
    setIsManual(true);
  };

  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Gurgaon', 'South Delhi'];

  return (
    <div className="relative mx-auto w-[310px] h-[640px] shrink-0 z-20 pointer-events-auto">
      
      {/* ------------------------------------- */}
      {/* PHYSICAL HARDWARE (DEEP ESPRESSO) */}
      {/* ------------------------------------- */}
      
      {/* Outer Case & Two-Layer Shadow */}
      <div className="absolute inset-0 bg-[#140F0D] rounded-[48px] shadow-[0_30px_60px_rgba(20,10,5,0.25),0_8px_16px_rgba(20,10,5,0.4)] overflow-visible">
        
        {/* Subtle Warm Highlight Rim */}
        <div className="absolute inset-[-1px] rounded-[49px] bg-gradient-to-br from-[#64748B]/40 via-transparent to-[#140F0D] opacity-80 pointer-events-none" />
        
        {/* Physical Side Buttons */}
        <div className="absolute -left-[3px] top-[120px] w-[3px] h-[32px] bg-[#2A2422] rounded-l-sm shadow-sm" />
        <div className="absolute -left-[3px] top-[165px] w-[3px] h-[32px] bg-[#2A2422] rounded-l-sm shadow-sm" />
        <div className="absolute -right-[3px] top-[140px] w-[3px] h-[48px] bg-[#2A2422] rounded-r-sm shadow-sm" />

        {/* Screen Area (Inner Bezel & Display) */}
        <div className="absolute inset-[6px] bg-black rounded-[42px] overflow-hidden">
          
          {/* Subtle Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-50 mix-blend-overlay" />
          <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none z-50 opacity-20 blur-sm" />

          {/* Dynamic Island Notch */}
          <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[95px] h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-2.5 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.05)]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#111] border border-white/5" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#050505] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
          </div>

          {/* Inner Display (App UI) */}
          <div className="absolute inset-0 bg-[#F8FAFC] text-[#0F172A] overflow-hidden flex flex-col font-sans">
            
            {/* iOS Status Bar */}
            <div className="h-[46px] w-full flex items-center justify-between px-7 shrink-0 pt-[10px] text-[12px] font-bold tracking-tight z-40 bg-[#F8FAFC]">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-80">
                <MS name="signal_cellular_4_bar" size={13} />
                <MS name="wifi" size={13} />
                <div className="w-[20px] h-[11px] border border-black rounded-[4px] p-[1px] relative">
                  <div className="bg-black w-full h-full rounded-[2px]" />
                  <div className="absolute -right-[3px] top-[2.5px] w-[2px] h-[4px] bg-black rounded-r-sm" />
                </div>
              </div>
            </div>

            {/* Interactive Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute top-[50px] left-4 right-4 bg-[#0F172A] text-white text-[11px] font-bold py-2 px-3 rounded-full shadow-lg z-50 flex items-center gap-2 justify-center"
                >
                  <MS name="check_circle" size={14} className="text-[#0055D4]" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* City Picker Modal */}
            <AnimatePresence>
              {showCityPicker && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 z-50 flex items-end"
                  onClick={() => setShowCityPicker(false)}
                >
                  <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="w-full bg-[#F8FAFC] rounded-t-[28px] p-5 border-t border-[#E2E8F0] shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[14px] font-black">Select Your City</h4>
                      <div onClick={() => setShowCityPicker(false)} className="cursor-pointer p-1">
                        <MS name="close" size={18} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {cities.map((city) => (
                        <div 
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityPicker(false);
                            showToast(`Switched to ${city}`);
                          }}
                          className={`p-3 rounded-xl border text-[13px] font-bold flex justify-between items-center cursor-pointer transition-colors ${selectedCity === city ? 'bg-[#0055D4]/10 border-[#0055D4] text-[#0055D4]' : 'bg-white border-[#E2E8F0]'}`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && <MS name="check" size={16} />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notifications Popover */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-[55px] right-4 w-[240px] bg-white border border-[#E2E8F0] rounded-[20px] p-4 shadow-xl z-50"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[12px] font-black">Notifications</span>
                    <span onClick={() => setNotificationsOpen(false)} className="text-[10px] font-bold text-[#0055D4] cursor-pointer">Close</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-[#F1F5F9] border border-[#0055D4]/20 flex gap-2">
                      <MS name="stars" size={16} className="text-[#0055D4] shrink-0" />
                      <div className="text-[10px]">
                        <p className="font-bold text-[#0F172A]">₹50 Off Next Order</p>
                        <p className="text-[#64748B]">Valid for Blue Tokai Coffee</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 flex gap-2">
                      <MS name="local_shipping" size={16} className="text-[#64748B] shrink-0" />
                      <div className="text-[10px]">
                        <p className="font-bold text-[#0F172A]">Order Delivered</p>
                        <p className="text-[#64748B]">Blue Tokai • 2 hrs ago</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SCREEN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden noscroll pb-24 relative">
              <AnimatePresence mode="wait">
                
                {/* 1. HOME SCREEN */}
                {state === 'HOME' && (
                  <motion.div 
                    key="home"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col w-full h-full"
                  >
                    {/* Header */}
                    <div className="px-6 pt-2 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-[0.1em] mb-0.5">Good morning 👋</p>
                          <div 
                            onClick={() => setShowCityPicker(true)}
                            className="flex items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                          >
                            <span className="text-[15px] font-black">{selectedCity}</span>
                            <MS name="expand_more" size={16} className="text-[#64748B]" />
                          </div>
                        </div>
                        <div 
                          onClick={() => setNotificationsOpen(!notificationsOpen)}
                          className="w-10 h-10 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] relative cursor-pointer active:scale-95 transition-transform bg-white shadow-xs"
                        >
                          <MS name="notifications" size={20} />
                          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#0055D4] rounded-full border-[1.5px] border-white" />
                        </div>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="px-6 mb-5">
                      <div 
                        onClick={() => setState('EXPLORE')}
                        className="w-full bg-white border border-[#E2E8F0] rounded-[20px] h-[48px] flex items-center px-4 shadow-[0_2px_8px_rgba(15, 23, 42,0.03)] cursor-pointer active:scale-[0.98] transition-transform group"
                      >
                        <MS name="search" size={20} className="text-[#64748B] group-hover:text-[#0055D4] transition-colors" />
                        <span className="text-[14px] text-[#64748B] ml-3 font-medium">Search cafés, coffee...</span>
                        <div className="ml-auto w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-sm">
                          <MS name="tune" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Premium Promotional Banner (Dynamic Synced Theme & Image) */}
                    <div className="px-6 mb-6">
                      <motion.div 
                        key={currentPromoKey}
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setState('CAFE')}
                        className="w-full h-[105px] rounded-[20px] overflow-hidden relative shadow-sm cursor-pointer active:scale-[0.98] transition-all duration-500 flex items-center pl-5"
                        style={{ backgroundColor: promo.color }}
                      >
                        <div className="relative z-20 text-white">
                          <motion.p 
                            key={`tag-${currentPromoKey}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[8px] font-extrabold uppercase tracking-widest bg-white/20 inline-block px-1.5 py-0.5 rounded-sm mb-1"
                          >
                            {promo.tag}
                          </motion.p>
                          <motion.h3 
                            key={`title-${currentPromoKey}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="text-[24px] font-black leading-none mb-1"
                          >
                            {promo.title}
                          </motion.h3>
                          <motion.div 
                            key={`code-${currentPromoKey}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-black text-white text-[9px] font-bold px-2.5 py-1 rounded-md w-fit uppercase mt-1.5 shadow-sm"
                          >
                            {promo.code}
                          </motion.div>
                        </div>
                        
                        {/* Dynamic Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient} z-10 transition-all duration-500`} />
                        
                        {/* Dynamic Background Image */}
                        <motion.img 
                          key={`img-${currentPromoKey}`}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.45 }}
                          src={promo.img} 
                          alt={promo.title} 
                          className="absolute right-0 top-0 bottom-0 w-3/5 object-cover object-center z-0" 
                        />
                      </motion.div>
                    </div>

                    {/* Categories (Dense Chips) */}
                    <div className="px-6 mb-6">
                      <div className="flex justify-between items-end mb-3">
                        <h3 className="text-[15px] font-black">Categories</h3>
                        <span onClick={() => setState('EXPLORE')} className="text-[11px] font-bold text-[#0055D4] cursor-pointer hover:underline">See all</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto noscroll pb-1">
                        {[
                          { name: 'Coffee', icon: 'local_cafe' },
                          { name: 'Cold Brew', icon: 'local_drink' },
                          { name: 'Matcha', icon: 'emoji_food_beverage' },
                          { name: 'Pastry', icon: 'bakery_dining' }
                        ].map((cat) => (
                          <div 
                            key={cat.name} 
                            onClick={() => {
                              setActiveCategory(cat.name);
                              setState('EXPLORE');
                            }}
                            className={`flex flex-col items-center justify-center shrink-0 w-[62px] h-[64px] rounded-[18px] shadow-xs cursor-pointer active:scale-95 transition-transform border ${activeCategory === cat.name ? 'bg-[#0055D4] text-white border-[#0055D4]' : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#64748B]'}`}
                          >
                            <MS name={cat.icon} size={22} className="mb-1" />
                            <span className="text-[10px] font-bold">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nearby Cafes */}
                    <div className="px-6 pb-6">
                      <div className="flex justify-between items-end mb-3">
                        <h3 className="text-[15px] font-black">Nearby cafés</h3>
                        <span onClick={() => setState('EXPLORE')} className="text-[11px] font-bold text-[#0055D4] cursor-pointer hover:underline">See all</span>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Cafe Card 1: Blue Tokai */}
                        <div 
                          onClick={() => setState('CAFE')}
                          className="w-full flex items-center gap-3.5 bg-white border border-[#E2E8F0] rounded-[22px] p-3 shadow-xs cursor-pointer active:scale-[0.98] transition-transform group"
                        >
                          <div className="w-[76px] h-[76px] bg-gray-200 rounded-[16px] overflow-hidden relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cafe" />
                          </div>
                          
                          <div className="flex flex-col flex-1 py-0.5">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-[14px] font-bold leading-tight">Blue Tokai Coffee</h4>
                              <div 
                                className="text-[#64748B] hover:text-red-500 transition-colors p-1"
                                onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); showToast(favorite ? 'Removed from favorites' : 'Saved to favorites'); }}
                              >
                                <MS name={favorite ? 'favorite' : 'favorite_border'} size={18} className={favorite ? 'text-red-500' : ''} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B] mb-1.5">
                              <span className="flex items-center gap-0.5 text-[#0055D4]"><MS name="star" size={12} /> 4.9</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#64748B]" />
                              <span>0.8 km</span>
                            </div>
                            <div className="bg-[#10B981]/10 text-[#10B981] w-fit px-2 py-0.5 rounded flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide">
                              Ready in 07 min
                            </div>
                          </div>
                        </div>

                        {/* Cafe Card 2: Third Wave */}
                        <div 
                          onClick={() => setState('CAFE')}
                          className="w-full flex items-center gap-3.5 bg-white border border-[#E2E8F0] rounded-[22px] p-3 shadow-xs cursor-pointer active:scale-[0.98] transition-transform group"
                        >
                          <div className="w-[76px] h-[76px] bg-gray-200 rounded-[16px] overflow-hidden relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Third Wave Coffee" />
                          </div>
                          
                          <div className="flex flex-col flex-1 py-0.5">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-[14px] font-bold leading-tight">Third Wave Coffee</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B] mb-1.5">
                              <span className="flex items-center gap-0.5 text-[#0055D4]"><MS name="star" size={12} /> 4.8</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#64748B]" />
                              <span>1.2 km</span>
                            </div>
                            <div className="bg-[#10B981]/10 text-[#10B981] w-fit px-2 py-0.5 rounded flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide">
                              Ready in 10 min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. EXPLORE SCREEN */}
                {state === 'EXPLORE' && (
                  <motion.div 
                    key="explore"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col w-full h-full px-6 pt-2"
                  >
                    {/* Sticky Header, Search & Filter Pills */}
                    <div className="sticky top-0 bg-[#F8FAFC] z-20 pt-1 pb-2 border-b border-[#E2E8F0]/60">
                      <div className="flex items-center gap-3 mb-3">
                        <div onClick={() => setState('HOME')} className="p-2 rounded-full bg-white border border-[#E2E8F0] cursor-pointer active:scale-90 transition-transform">
                          <MS name="arrow_back" size={18} />
                        </div>
                        <h2 className="text-[18px] font-black">Explore Cafés</h2>
                      </div>

                      {/* Search Bar */}
                      <div className="bg-white border border-[#E2E8F0] rounded-[18px] h-[42px] flex items-center px-3 mb-3 shadow-xs">
                        <MS name="search" size={18} className="text-[#64748B]" />
                        <input 
                          type="text" 
                          placeholder="Search espresso, cold brew..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-[13px] font-bold px-2 outline-none"
                        />
                        {searchQuery && (
                          <div onClick={() => setSearchQuery('')} className="cursor-pointer">
                            <MS name="cancel" size={16} className="text-[#64748B]" />
                          </div>
                        )}
                      </div>

                      {/* Filter Pills */}
                      <div className="flex gap-2 overflow-x-auto noscroll pb-1">
                        {['All', 'Top Rated', 'Fastest', 'Coffee', 'Matcha', 'Food'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setActiveCategory(filter)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border shrink-0 transition-colors ${activeCategory === filter ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-[#E2E8F0] text-[#64748B]'}`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cafes Grid */}
                    <div className="space-y-3 pt-3 pb-32">
                      {[
                        { name: 'Blue Tokai Coffee', rating: '4.9', dist: '0.8 km', time: '7 min', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop' },
                        { name: 'Third Wave Coffee', rating: '4.8', dist: '1.2 km', time: '10 min', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop' },
                        { name: 'Araku Specialty Coffee', rating: '4.9', dist: '2.1 km', time: '12 min', img: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?q=80&w=600&auto=format&fit=crop' },
                        { name: 'Subko Specialty Coffee', rating: '4.7', dist: '2.5 km', time: '15 min', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop' }
                      ].filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cafe) => (
                        <div 
                          key={cafe.name}
                          onClick={() => setState('CAFE')}
                          className="w-full flex items-center gap-3.5 bg-white border border-[#E2E8F0] rounded-[22px] p-3 shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          <img src={cafe.img} className="w-[68px] h-[68px] rounded-[16px] object-cover shrink-0" alt={cafe.name} />
                          <div className="flex-1">
                            <h4 className="text-[14px] font-bold">{cafe.name}</h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B] my-1">
                              <span className="flex items-center text-[#0055D4]"><MS name="star" size={12} /> {cafe.rating}</span>
                              <span>•</span>
                              <span>{cafe.dist}</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">Ready in {cafe.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. CAFÉ MENU SCREEN */}
                {state === 'CAFE' && (
                  <motion.div 
                    key="cafe"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col w-full h-full relative"
                  >
                    {/* Header Image */}
                    <div className="w-full h-[140px] relative shrink-0">
                      <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Blue Tokai" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div 
                        onClick={() => setState('HOME')}
                        className="absolute top-3 left-4 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.95)] flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-10 shadow-sm"
                      >
                        <MS name="arrow_back" size={18} />
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white flex justify-between items-end">
                        <div>
                          <h3 className="text-[17px] font-black leading-tight">Blue Tokai Coffee</h3>
                          <p className="text-[10px] text-white/80 font-bold">Connaught Place • 0.8 km</p>
                        </div>
                        <span className="bg-[#0055D4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MS name="star" size={12} /> 4.9
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-5 flex-1 space-y-3">
                      <h4 className="text-[13px] font-black uppercase tracking-wider text-[#64748B]">Must Try Drinks</h4>

                      {/* Item 1 */}
                      <div 
                        onClick={() => {
                          handleUserInteraction();
                          setState('PRODUCT');
                        }}
                        className="p-3 bg-white border border-[#E2E8F0] rounded-[20px] flex items-center justify-between shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="flex gap-3 items-center">
                          <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=200&auto=format&fit=crop" className="w-14 h-14 rounded-xl object-cover shrink-0" alt="Vietnamese Iced" />
                          <div>
                            <h5 className="text-[13px] font-bold">Vietnamese Iced Coffee</h5>
                            <p className="text-[10px] text-[#64748B] font-medium">Sweetened condensed milk</p>
                            <span className="text-[13px] font-black text-[#0F172A] mt-0.5 block">₹240</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserInteraction();
                            setCartCount(cartCount + 1);
                            showToast('Added Vietnamese Iced Coffee!');
                          }}
                          className={`relative px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all duration-300 ${
                            simulatedTap === 'item1' || cartCount >= 1
                              ? 'bg-[#0055D4] text-white shadow-[0_0_12px_rgba(0,85,212,0.4)]'
                              : 'bg-[#0055D4]/10 text-[#0055D4] border border-[#0055D4]/30'
                          }`}
                        >
                          {cartCount >= 1 ? 'ADDED ✓' : 'ADD +'}
                          {simulatedTap === 'item1' && (
                            <span className="absolute -inset-1 rounded-xl border-2 border-[#0055D4] animate-ping pointer-events-none" />
                          )}
                        </button>
                      </div>

                      {/* Item 2 */}
                      <div 
                        onClick={() => {
                          handleUserInteraction();
                          setState('PRODUCT');
                        }}
                        className="p-3 bg-white border border-[#E2E8F0] rounded-[20px] flex items-center justify-between shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="flex gap-3 items-center">
                          <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=200&auto=format&fit=crop" className="w-14 h-14 rounded-xl object-cover shrink-0" alt="Almond Croissant" />
                          <div>
                            <h5 className="text-[13px] font-bold">Almond Croissant</h5>
                            <p className="text-[10px] text-[#64748B] font-medium">Flaky & freshly baked</p>
                            <span className="text-[13px] font-black text-[#0F172A] mt-0.5 block">₹180</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserInteraction();
                            setCartCount(cartCount + 1);
                            showToast('Added Almond Croissant!');
                          }}
                          className={`relative px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all duration-300 ${
                            simulatedTap === 'item2' || cartCount >= 2
                              ? 'bg-[#0055D4] text-white shadow-[0_0_12px_rgba(0,85,212,0.4)]'
                              : 'bg-[#0055D4]/10 text-[#0055D4] border border-[#0055D4]/30'
                          }`}
                        >
                          {cartCount >= 2 ? 'ADDED ✓' : 'ADD +'}
                          {simulatedTap === 'item2' && (
                            <span className="absolute -inset-1 rounded-xl border-2 border-[#0055D4] animate-ping pointer-events-none" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Floating Bottom Cart Bar */}
                    {cartCount > 0 && (
                      <div className="px-5 pb-3">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1, scale: simulatedTap === 'viewCart' ? 0.95 : 1 }}
                          onClick={() => {
                            handleUserInteraction();
                            setState('CART');
                          }}
                          className="relative w-full bg-[#0F172A] text-white p-3 rounded-full flex justify-between items-center cursor-pointer active:scale-95 transition-all shadow-lg"
                        >
                          <div className="flex items-center gap-2 pl-2">
                            <span className="w-6 h-6 bg-[#0055D4] rounded-full text-white text-[11px] font-bold flex items-center justify-center">{cartCount}</span>
                            <span className="text-[12px] font-bold">{cartCount} item{cartCount > 1 ? 's' : ''} added</span>
                          </div>
                          <div className="flex items-center gap-1 pr-2 text-[12px] font-bold text-[#60A5FA]">
                            <span>View Cart</span>
                            <MS name="arrow_forward" size={16} />
                          </div>
                          {simulatedTap === 'viewCart' && (
                            <span className="absolute inset-0 rounded-full border-2 border-[#60A5FA] animate-ping pointer-events-none" />
                          )}
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. PRODUCT DETAIL SCREEN */}
                {state === 'PRODUCT' && (
                  <motion.div 
                    key="product"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col w-full h-full p-5 relative"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div onClick={() => setState('CAFE')} className="p-2 rounded-full bg-white border border-[#E2E8F0] cursor-pointer">
                        <MS name="close" size={18} />
                      </div>
                      <span className="text-[12px] font-bold text-[#64748B]">Blue Tokai</span>
                    </div>

                    <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" className="w-full h-[140px] rounded-[24px] object-cover mb-4 shadow-sm" alt="Product" />

                    <h3 className="text-[18px] font-black mb-1">Vietnamese Iced Coffee</h3>
                    <p className="text-[11px] text-[#64748B] mb-4 leading-relaxed">Signature espresso poured over condensed milk & ice. Strong, sweet & creamy.</p>

                    <div className="space-y-3 mb-6">
                      <div>
                        <label className="text-[11px] font-extrabold uppercase text-[#64748B]">Size</label>
                        <div className="flex gap-2 mt-1">
                          <button className="flex-1 py-2 bg-[#0055D4]/10 border border-[#0055D4] rounded-xl text-[11px] font-bold text-[#0055D4]">Regular (350ml)</button>
                          <button className="flex-1 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#64748B]">Large (450ml) +₹40</button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        handleUserInteraction();
                        setCartCount(cartCount + 1);
                        setState('CART');
                      }}
                      className="w-full py-3.5 bg-[#0F172A] text-white rounded-full font-bold text-[13px] active:scale-95 transition-transform mt-auto shadow-md"
                    >
                      Add to Order • ₹240
                    </button>
                  </motion.div>
                )}

                {/* 5. CART / CHECKOUT SCREEN */}
                {state === 'CART' && (
                  <motion.div 
                    key="cart"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col w-full h-full p-5 relative"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div onClick={() => setState('HOME')} className="p-2 rounded-full bg-white border border-[#E2E8F0] cursor-pointer">
                        <MS name="arrow_back" size={18} />
                      </div>
                      <h2 className="text-[16px] font-black">Checkout Order</h2>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 mb-3 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center text-[12px] font-bold pb-2 border-b border-[#E2E8F0]">
                        <span>1x Vietnamese Iced Coffee</span>
                        <span>₹240</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px] font-bold pb-2 border-b border-[#E2E8F0]">
                        <span>1x Almond Croissant</span>
                        <span>₹180</span>
                      </div>
                      
                      {/* Coupon Pill */}
                      <div 
                        onClick={() => {
                          handleUserInteraction();
                          setCouponApplied(!couponApplied);
                          showToast(couponApplied ? 'Coupon Removed' : 'GRAB20 Applied!');
                        }}
                        className="flex justify-between items-center p-2 rounded-xl bg-[#0055D4]/10 border border-[#0055D4]/30 text-[11px] font-bold text-[#0055D4] cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <MS name="local_offer" size={14} />
                          <span>{couponApplied ? 'GRAB20 (20% Off)' : 'Apply Coupon'}</span>
                        </div>
                        <span className="text-[10px] underline">{couponApplied ? 'REMOVE' : 'APPLY'}</span>
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 mb-4 text-[11px] font-bold space-y-1.5 shadow-xs">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Item Total</span>
                        <span>₹420</span>
                      </div>
                      {couponApplied && (
                        <div className="flex justify-between text-[#10B981]">
                          <span>Discount (20%)</span>
                          <span>-₹84</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#64748B]">
                        <span>Convenience Fee</span>
                        <span>₹0 (Free)</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-black text-[#0F172A] pt-2 border-t border-[#E2E8F0]">
                        <span>To Pay</span>
                        <span>₹{couponApplied ? 336 : 420}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        handleUserInteraction();
                        setState('CONFIRMATION');
                      }}
                      className="relative w-full py-3.5 bg-[#0055D4] text-white rounded-full font-bold text-[13px] active:scale-95 transition-transform mt-auto shadow-lg flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <span>Pay ₹{couponApplied ? 336 : 420} & Order</span>
                      <MS name="arrow_forward" size={16} />
                      {simulatedTap === 'pay' && (
                        <span className="absolute inset-0 bg-white/40 animate-ping rounded-full pointer-events-none" />
                      )}
                    </button>
                  </motion.div>
                )}

                {/* 6. CONFIRMATION / PREPARING SCREEN */}
                {state === 'CONFIRMATION' && (
                  <motion.div 
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center w-full h-full p-6 text-center"
                  >
                    <div className="w-14 h-14 bg-[#0055D4]/10 border-2 border-[#0055D4] rounded-full flex items-center justify-center text-[#0055D4] mb-4 animate-pulse">
                      <MS name="hourglass_top" size={28} />
                    </div>
                    <h3 className="text-[18px] font-black mb-1">Preparing Your Order</h3>
                    <p className="text-[11px] text-[#64748B] mb-6">Barista at Blue Tokai is brewing your coffee.</p>

                    <div className="w-full bg-white border border-[#E2E8F0] rounded-[20px] p-4 mb-6 text-left shadow-xs">
                      <div className="flex justify-between items-center text-[11px] font-bold text-[#64748B] mb-2">
                        <span>ESTIMATED PICKUP</span>
                        <span className="text-[#0055D4] font-black">04:30 mins</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-slate-100">
                        <motion.div 
                          initial={{ width: '15%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.8, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-[#0055D4] to-[#60A5FA] rounded-full"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        handleUserInteraction();
                        setState('READY');
                      }}
                      className="w-full py-3.5 bg-[#0F172A] text-white rounded-full font-bold text-[12px] active:scale-95 transition-transform"
                    >
                      Simulate Order Ready
                    </button>
                  </motion.div>
                )}

                {/* 7. ORDER READY SCREEN */}
                {state === 'READY' && (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center w-full h-full px-6 text-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center text-white mb-3 shadow-md"
                    >
                      <MS name="done" size={28} />
                    </motion.div>
                    
                    <h2 className="text-[18px] font-black mb-1">Order Ready for Pickup!</h2>
                    <p className="text-[11px] text-[#64748B] mb-5 leading-relaxed">
                      Show code at <strong>Blue Tokai Counter</strong>.
                    </p>

                    <div className="w-full bg-white border border-[#E2E8F0] rounded-[20px] p-4 mb-5 shadow-xs">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Pickup Token</div>
                      <div className="text-[22px] font-black text-[#0055D4] mb-3 tracking-widest">#GT-8492</div>
                      <div className="flex justify-between items-center text-[11px] font-bold pt-2 border-t border-[#E2E8F0] text-[#64748B]">
                        <span>1x Vietnamese Iced</span>
                        <span>1x Croissant</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setState('HOME')}
                      className="w-full py-3.5 bg-[#0F172A] text-white rounded-full font-bold text-[12px] active:scale-95 transition-transform shadow-md"
                    >
                      Back to Home
                    </button>
                  </motion.div>
                )}

                {/* 8. PROFILE / ACCOUNT SCREEN */}
                {state === 'PROFILE' && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col w-full h-full p-5"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#0055D4]/20 border border-[#0055D4] flex items-center justify-center text-[#0055D4] font-black text-[16px]">
                        S
                      </div>
                      <div>
                        <h3 className="text-[15px] font-black">Shriyansh Sharma</h3>
                        <p className="text-[10px] text-[#64748B] font-bold">GrabbIt Gold Member • 340 pts</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {[
                        { icon: 'receipt_long', title: 'Order History', action: () => setState('READY') },
                        { icon: 'favorite', title: 'Favorite Cafés', action: () => setState('EXPLORE') },
                        { icon: 'location_on', title: 'Saved Addresses', action: () => setShowCityPicker(true) },
                        { icon: 'payment', title: 'Payment Methods', action: () => showToast('Saved UPI & Cards Active') },
                        { icon: 'help_outline', title: 'Support & FAQ', action: () => showToast('Connecting to 24/7 Support...') }
                      ].map((item) => (
                        <div 
                          key={item.title}
                          onClick={item.action}
                          className="p-3 bg-white border border-[#E2E8F0] rounded-[16px] flex items-center justify-between cursor-pointer active:scale-98 transition-transform shadow-xs"
                        >
                          <div className="flex items-center gap-3 text-[12px] font-bold">
                            <MS name={item.icon} size={18} className="text-[#64748B]" />
                            <span>{item.title}</span>
                          </div>
                          <MS name="chevron_right" size={18} className="text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* BOTTOM APP NAVIGATION */}
            <div className="absolute bottom-0 inset-x-0 h-[84px] bg-[rgba(255,255,255,0.95)] border-t border-[rgba(235,228,216,0.5)] flex items-start justify-around pt-3.5 px-3 z-40 pb-5 shadow-[0_-4px_12px_rgba(15, 23, 42,0.02)]">
              {[
                { id: 'HOME', icon: 'home', label: 'Home' },
                { id: 'EXPLORE', icon: 'search', label: 'Explore' },
                { id: 'CART', icon: 'receipt_long', label: 'Orders' },
                { id: 'PROFILE', icon: 'person', label: 'Profile' }
              ].map((item) => {
                const isActive = state === item.id || (state === 'CAFE' && item.id === 'HOME') || (state === 'READY' && item.id === 'CART') || (state === 'CONFIRMATION' && item.id === 'CART');
                return (
                  <div 
                    key={item.id}
                    onClick={() => setState(item.id as AppState)}
                    className="flex flex-col items-center gap-1 cursor-pointer w-14 group"
                  >
                    <div className={`relative flex items-center justify-center w-12 h-9 rounded-full transition-colors duration-200 ${isActive ? 'bg-[#0055D4]/10' : 'group-hover:bg-gray-100'}`}>
                      <MS 
                        name={item.icon} 
                        size={22} 
                        className={`transition-colors duration-200 ${isActive ? 'text-[#0055D4]' : 'text-[#64748B]'}`} 
                      />
                      {item.id === 'CART' && cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0055D4] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9.5px] font-bold transition-colors duration-200 ${isActive ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
              
              {/* Home indicator bar (iOS) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-[#0F172A] rounded-full opacity-90" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
