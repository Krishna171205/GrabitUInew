'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useState, useEffect } from 'react';

export type AppState = 'CAFE_WEBSITE' | 'CAFE' | 'CART' | 'CONFIRMATION' | 'READY';

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
  const [internalState, setInternalState] = useState<AppState>('CAFE_WEBSITE');
  
  // Active promo theme based on current energy transition
  const currentPromoKey = (activeEnergyCard && promoThemes[activeEnergyCard]) ? activeEnergyCard : 'cafes';
  const promo = promoThemes[currentPromoKey];
  
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Automated Simulation Tap indicator
  const [simulatedTap, setSimulatedTap] = useState<'order' | 'item1' | 'item2' | 'viewCart' | 'pay' | null>(null);

  const state = onStateChange ? activeState : internalState;
  const setState = (newState: AppState) => {
    if (onStateChange) onStateChange(newState);
    else setInternalState(newState);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Automated Continuous Ordering Cycle
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    const runStoryCycle = () => {
      // 0.0s: Start on CAFE_WEBSITE
      setState('CAFE_WEBSITE');
      setCartCount(0);
      setSimulatedTap(null);

      // 2.0s: Tap Order Now on website
      timers.push(setTimeout(() => {
        setSimulatedTap('order');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 2000));

      // 2.5s: Transition to Grabbit CAFE screen
      timers.push(setTimeout(() => {
        setState('CAFE');
      }, 2500));

      // 4.0s: Tap & Add 1st item (Vietnamese Iced Coffee)
      timers.push(setTimeout(() => {
        setSimulatedTap('item1');
        setCartCount(1);
        showToast('Added Vietnamese Iced Coffee!');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 4000));

      // 5.6s: Tap & Add 2nd item (Almond Croissant)
      timers.push(setTimeout(() => {
        setSimulatedTap('item2');
        setCartCount(2);
        showToast('Added Almond Croissant!');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 5600));

      // 7.2s: Tap View Cart button
      timers.push(setTimeout(() => {
        setSimulatedTap('viewCart');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 7200));

      // 7.8s: Transition to Cart Screen
      timers.push(setTimeout(() => {
        setState('CART');
      }, 7800));

      // 10.0s: Tap Pay & Order button
      timers.push(setTimeout(() => {
        setSimulatedTap('pay');
        showToast('Processing UPI payment...');
        setTimeout(() => setSimulatedTap(null), 450);
      }, 10000));

      // 10.8s: Transition to Brewing / Preparing Screen
      timers.push(setTimeout(() => {
        setState('CONFIRMATION');
      }, 10800));

      // 13.8s: Transition to Order Ready for Pickup Screen
      timers.push(setTimeout(() => {
        setState('READY');
      }, 13800));
    };

    runStoryCycle();
    const interval = setInterval(runStoryCycle, 17000);

    return () => {
      clearInterval(interval);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Gurgaon', 'South Delhi'];

  return (
    <div className="relative mx-auto w-[280px] sm:w-[310px] h-[580px] sm:h-[640px] shrink-0 z-20 pointer-events-none transition-all duration-300">
      
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

            {/* SCREEN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden noscroll pb-24 relative">
              <AnimatePresence>
                
                {/* 0. CAFE_WEBSITE SCREEN */}
                {state === 'CAFE_WEBSITE' && (
                  <motion.div 
                    key="website"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col w-full h-full bg-[#EAE9E4] overflow-hidden"
                  >
                    {/* Grabbit Navbar */}
                    <div className="h-[48px] bg-[#0055D4] w-full flex items-center justify-between px-4 text-white shrink-0 shadow-sm">
                      <div className="flex items-center gap-0.5">
                        <span className="font-black text-[18px] tracking-tight">grabbit</span>
                      </div>
                      <MS name="menu" size={20} />
                    </div>

                    <div className="flex flex-col items-center flex-1 w-full pt-6 px-4">
                      {/* Headline */}
                      <h1 
                        className="text-[32px] font-black leading-[0.9] text-center uppercase tracking-tight text-[#0F172A] w-full"
                        style={{ fontFamily: 'var(--font-anton)' }}
                      >
                        ORDER AHEAD<br/>
                        <span className="text-[#0055D4]">WITH GRABBIT.</span>
                      </h1>

                      {/* Description */}
                      <p className="text-[10px] text-center text-[#334155] font-medium leading-relaxed mt-3 max-w-[220px]">
                        Grabbit is a 10-minute cafe pickup app. Order ahead at your favorite local spots. Your coffee should be ready when you arrive.
                      </p>

                      {/* Video / Bag */}
                      <div 
                        className="w-full relative mt-2 flex-1 max-h-[220px]"
                        style={{
                          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)',
                          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)'
                        }}
                      >
                        <video 
                           src="/grabv1.mp4" 
                           autoPlay 
                           loop 
                           muted 
                           playsInline 
                           className="w-full h-full object-cover absolute inset-0"
                         />
                      </div>
                    </div>

                    {/* Bottom Button */}
                    <div className="p-4 w-full bg-[#EAE9E4] relative pb-8 shrink-0">
                      <div 
                        className="w-full bg-[#0055D4] text-white h-[44px] rounded-full flex items-center justify-center font-bold text-[13px] shadow-[0_6px_16px_rgba(0,85,212,0.3)] relative overflow-hidden"
                      >
                        ORDER NOW
                        
                        {/* Simulated Tap for 'order' */}
                        {simulatedTap === 'order' && (
                          <motion.div 
                            layoutId="tap-order"
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute w-12 h-12 bg-white/40 rounded-full"
                          />
                        )}
                      </div>
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
                    className="absolute inset-0 flex flex-col w-full h-full bg-[#F4F7F9] pb-[88px]"
                  >
                    {/* Header Image */}
                    <div className="w-full h-[160px] relative shrink-0 rounded-b-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] z-10">
                      <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Blue Tokai" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-10 shadow-sm text-[#0F172A]">
                        <MS name="arrow_back" size={18} />
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                        <div>
                          <h3 className="text-[19px] font-black leading-tight tracking-tight">Blue Tokai Coffee</h3>
                          <p className="text-[11px] text-white/90 font-semibold mt-0.5 opacity-90 flex items-center gap-1">
                            <MS name="location_on" size={12} className="opacity-80" /> Connaught Place • 0.8 km
                          </p>
                        </div>
                        <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <MS name="star" size={12} className="text-[#FBBF24]" /> 4.9
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-5 flex-1 space-y-4">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#64748B] mb-2">Must Try Drinks</h4>

                      {/* Item 1 */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-3.5 bg-white rounded-[24px] flex items-center justify-between shadow-[0_8px_24px_rgba(149,157,165,0.1)] transition-transform border border-[#F1F5F9]"
                      >
                        <div className="flex gap-3.5 items-center">
                          <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=200&auto=format&fit=crop" className="w-16 h-16 rounded-[16px] object-cover shrink-0 shadow-sm" alt="Vietnamese Iced" />
                          <div>
                            <h5 className="text-[14px] font-bold tracking-tight text-[#0F172A]">Vietnamese Iced</h5>
                            <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Sweetened condensed milk</p>
                            <span className="text-[14px] font-black text-[#0F172A] mt-1 block">₹240</span>
                          </div>
                        </div>
                        <button className={`relative px-4 py-2 rounded-full font-bold text-[12px] transition-all duration-300 ${
                            simulatedTap === 'item1' || cartCount >= 1
                              ? 'bg-[#0055D4] text-white shadow-[0_4px_12px_rgba(0,85,212,0.3)]'
                              : 'bg-[#F1F5F9] text-[#0055D4]'
                          }`}>
                          {cartCount >= 1 ? '+ 1' : 'ADD +'}
                          {simulatedTap === 'item1' && (
                            <span className="absolute -inset-1 rounded-full border-2 border-[#0055D4] animate-ping pointer-events-none" />
                          )}
                        </button>
                      </motion.div>

                      {/* Item 2 */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-3.5 bg-white rounded-[24px] flex items-center justify-between shadow-[0_8px_24px_rgba(149,157,165,0.1)] transition-transform border border-[#F1F5F9]"
                      >
                        <div className="flex gap-3.5 items-center">
                          <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=200&auto=format&fit=crop" className="w-16 h-16 rounded-[16px] object-cover shrink-0 shadow-sm" alt="Almond Croissant" />
                          <div>
                            <h5 className="text-[14px] font-bold tracking-tight text-[#0F172A]">Almond Croissant</h5>
                            <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Flaky & freshly baked</p>
                            <span className="text-[14px] font-black text-[#0F172A] mt-1 block">₹180</span>
                          </div>
                        </div>
                        <button className={`relative px-4 py-2 rounded-full font-bold text-[12px] transition-all duration-300 ${
                            simulatedTap === 'item2' || cartCount >= 2
                              ? 'bg-[#0055D4] text-white shadow-[0_4px_12px_rgba(0,85,212,0.3)]'
                              : 'bg-[#F1F5F9] text-[#0055D4]'
                          }`}>
                          {cartCount >= 2 ? '+ 1' : 'ADD +'}
                          {simulatedTap === 'item2' && (
                            <span className="absolute -inset-1 rounded-full border-2 border-[#0055D4] animate-ping pointer-events-none" />
                          )}
                        </button>
                      </motion.div>
                    </div>

                    {/* Floating Bottom Cart Bar */}
                    {cartCount > 0 && (
                      <div className="px-5 pb-3">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1, scale: simulatedTap === 'viewCart' ? 0.95 : 1 }}
                          className="relative w-full bg-[#0F172A] text-white p-3 rounded-full flex justify-between items-center cursor-pointer transition-all shadow-lg"
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

                {/* 5. CART / CHECKOUT SCREEN */}
                {state === 'CART' && (
                  <motion.div 
                    key="cart"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col w-full h-full p-5 pb-[100px] bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-white border border-[#E2E8F0] cursor-pointer">
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
                      <div className="flex justify-between items-center p-2 rounded-xl bg-[#0055D4]/10 border border-[#0055D4]/30 text-[11px] font-bold text-[#0055D4] cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <MS name="local_offer" size={14} />
                          <span>GRAB20 (20% Off)</span>
                        </div>
                        <span className="text-[10px] underline">REMOVE</span>
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 mb-4 text-[11px] font-bold space-y-1.5 shadow-xs">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Item Total</span>
                        <span>₹420</span>
                      </div>
                      <div className="flex justify-between text-[#10B981]">
                        <span>Discount (20%)</span>
                        <span>-₹84</span>
                      </div>
                      <div className="flex justify-between text-[#64748B]">
                        <span>Convenience Fee</span>
                        <span>₹0 (Free)</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-black text-[#0F172A] pt-2 border-t border-[#E2E8F0]">
                        <span>To Pay</span>
                        <span>₹336</span>
                      </div>
                    </div>

                    <button className="relative w-full py-3.5 bg-[#0055D4] text-white rounded-full font-bold text-[13px] transition-transform mt-auto shadow-lg flex items-center justify-center gap-2 overflow-hidden">
                      <span>Pay ₹336 & Order</span>
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
                    className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-6 text-center bg-[#F8FAFC]"
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

                    <button className="w-full py-3.5 bg-[#0F172A] text-white rounded-full font-bold text-[12px] transition-transform">
                      View Live Status
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
                    className="absolute inset-0 flex flex-col items-center justify-center w-full h-full px-6 text-center bg-[#F8FAFC] pb-[88px]"
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

                    <button className="w-full py-3.5 bg-[#0F172A] text-white rounded-full font-bold text-[12px] transition-transform shadow-md">
                      Scan QR Code
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* BOTTOM APP NAVIGATION (Only visible during Grabbit app flow) */}
            {state !== 'CAFE_WEBSITE' && (
              <div className="absolute bottom-0 inset-x-0 h-[84px] bg-[rgba(255,255,255,0.95)] border-t border-[rgba(235,228,216,0.5)] flex items-start justify-around pt-3.5 px-3 z-40 pb-5 shadow-[0_-4px_12px_rgba(15, 23, 42,0.02)]">
                {[
                  { id: 'CAFE', icon: 'local_cafe', label: 'Café' },
                  { id: 'CART', icon: 'receipt_long', label: 'Order' }
                ].map((item) => {
                  const isActive = state === item.id || (state === 'READY' && item.id === 'CART') || (state === 'CONFIRMATION' && item.id === 'CART');
                  return (
                    <div 
                      key={item.id}
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
