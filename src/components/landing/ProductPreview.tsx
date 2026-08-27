'use client';
import Image from 'next/image';
import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionTemplate, useReducedMotion, type MotionValue } from 'framer-motion';
import { Star, MapPin, Check, ArrowRight, Clock, RotateCcw } from 'lucide-react';
import OrbitImages from '../react-bits/OrbitImages';

const ORBIT_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop&q=80",
];

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: 'coffee' | 'bakery';
  tag?: string;
  img: string;
}

const ITEMS: MenuItem[] = [
  { 
    id: 'c1', 
    name: 'Cold Brew', 
    desc: 'Smooth 12-hour single-origin steep', 
    price: 220, 
    category: 'coffee',
    tag: 'Popular',
    img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80' 
  },
  { 
    id: 'c2', 
    name: 'Flat White', 
    desc: 'Double ristretto with silky micro-foam', 
    price: 280, 
    category: 'coffee',
    tag: 'Artisan',
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80' 
  },
  { 
    id: 'c3', 
    name: 'Almond Croissant', 
    desc: 'Flaky French butter pastry with toasted almonds', 
    price: 180, 
    category: 'bakery',
    tag: 'Fresh Baked',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&q=80' 
  },
];

type OrderState = 'MENU' | 'CART' | 'CONFIRMING' | 'PREPARING' | 'READY';

export default function ProductPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const isReduced = useReducedMotion();

  // Scroll animations
  const orderOpacity = useTransform(scrollYProgress, [0.22, 0.45], [1, 0.35]);
  const orderY = useTransform(scrollYProgress, [0.22, 0.45], [0, -12]);
  
  const pickupOpacity = useTransform(scrollYProgress, [0.32, 0.55], [0.3, 1]);
  const pickupScale = useTransform(scrollYProgress, [0.32, 0.55], [0.96, 1.04]);

  const uiScale = useTransform(scrollYProgress, [0.18, 0.5], [0.96, 1.0]);
  const cardY = useTransform(scrollYProgress, [0.12, 0.5], [30, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.12, 0.4], [0, 1]);

  // Pointer tilt & sheen
  const rotateXScroll = useTransform(scrollYProgress, [0.12, 0.5], [8, 0]);
  const tiltX = useSpring(0, { stiffness: 260, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 20 });
  const rotateXAll = useTransform([rotateXScroll, tiltX] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  const sheenX = useSpring(50, { stiffness: 200, damping: 25 });
  const sheenY = useSpring(50, { stiffness: 200, damping: 25 });
  const sheenOpacity = useSpring(0, { stiffness: 200, damping: 25 });
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.45), transparent 50%)`;

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (isReduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    tiltY.set((cx / r.width - 0.5) * 8);
    tiltX.set((0.5 - cy / r.height) * 6);
    sheenX.set((cx / r.width) * 100);
    sheenY.set((cy / r.height) * 100);
    sheenOpacity.set(1);
  }
  function handleLeave() { tiltX.set(0); tiltY.set(0); sheenOpacity.set(0); }

  // App State
  const [orderState, setOrderState] = useState<OrderState>('MENU');
  const [cart, setCart] = useState<Record<string, number>>({ c1: 1 });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'bakery'>('all');
  
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = ITEMS.find(i => i.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);
  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleAdd = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: string) => {
    setCart(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  // Preparation Progress Simulation
  const [prepProgress, setPrepProgress] = useState(0);
  useEffect(() => {
    if (orderState === 'PREPARING') {
      const interval = setInterval(() => {
        setPrepProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setOrderState('READY'), 500);
            return 100;
          }
          return p + 2;
        });
      }, 90);
      return () => clearInterval(interval);
    }
  }, [orderState]);

  const filteredItems = selectedCategory === 'all' 
    ? ITEMS 
    : ITEMS.filter(it => it.category === selectedCategory);

  return (
    <section id="preview" ref={sectionRef} className="relative bg-[#F9F8F5] pt-[140px] pb-[160px] min-h-[110vh] overflow-hidden flex flex-col items-center justify-center">

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-[1180px] mx-auto px-4 text-center">
        

        {/* Editorial Heading Block */}
        <div className="mb-14 flex flex-col items-center justify-center relative">
          <motion.h2 
            className="text-[48px] sm:text-[68px] md:text-[88px] font-black tracking-normal leading-[0.92] uppercase"
            style={{ 
              opacity: orderOpacity, 
              y: orderY, 
              fontFamily: 'var(--font-anton)',
            }}
          >
            <span className="text-[#0F172A] block">ORDER IN SECONDS.</span>
            <span className="text-[#0055D4] block mt-1">PICK UP IN MINUTES.</span>
          </motion.h2>
          
          <motion.p 
            className="text-slate-500 font-semibold text-sm sm:text-base max-w-md mx-auto mt-4"
            style={{ opacity: pickupOpacity, scale: pickupScale }}
          >
            Experience the real student ordering flow. Pick your brew, customize, and watch it brew live.
          </motion.p>
        </div>

        {/* Central Showcase Container with Floating Badges */}
        <div className="relative w-full max-w-[390px] mx-auto mt-16 lg:mt-24">
          
          {/* Orbiting Images Background */}
          <div 
            className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[1400px] h-[1400px] pointer-events-none z-0 opacity-80"
          >
            <OrbitImages
              images={ORBIT_IMAGES}
              shape="ellipse"
              radiusX={580}
              radiusY={280}
              rotation={-8}
              duration={40}
              itemSize={64}
              responsive={true}
              showPath={true}
              pathColor="rgba(15, 23, 42, 0.12)"
              pathWidth={2}
            />
          </div>

          {/* FLOATING FEATURE BADGES (Removed for cleaner look with orbiting images) */}

          {/* Ambient Glow behind the phone */}
          <motion.div
            style={{ opacity: cardOpacity, scale: uiScale }}
            className="absolute inset-0 bg-[#0055D4] blur-[120px] opacity-15 rounded-full z-0" 
          />

          {/* Interactive Smartphone UI */}
          <motion.div
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ 
              rotateX: rotateXAll, 
              rotateY: tiltY, 
              y: cardY, 
              opacity: cardOpacity, 
              scale: uiScale,
              transformPerspective: 1200, 
              transformStyle: 'preserve-3d', 
            }}
            className="relative z-10 w-full bg-[#FFFFFF] rounded-[38px] overflow-hidden shadow-[16px_16px_0px_#0F172A] border-[4px] border-[#0F172A] text-left select-none"
          >
            {/* Realistic Smartphone Status Bar */}
            <div className="bg-[#0F172A] text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight">
              <span>9:41</span>
              {/* Dynamic Island Capsule */}
              <div className="w-20 h-4 bg-black/90 rounded-full flex items-center justify-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[9px] text-white/80 font-bold tracking-tight">Grabbit</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              
              {/* STATE 1: CAFE MENU */}
              {orderState === 'MENU' && (
                <motion.div 
                  key="menu" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0, filter: 'blur(4px)' }} 
                  transition={{ duration: 0.3 }} 
                  className="pb-16 bg-[#F8FAFC]"
                >
                  {/* Café Header Banner */}
                  <div className="relative h-[155px] overflow-hidden group">
                    <Image 
                      src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=85" 
                      alt="The Raydee Cafe" 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-[1.04]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent" />
                    
                    {/* Live Open Status Tag */}
                    <div className="absolute top-3.5 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold tracking-wider border border-white/25 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(74,222,128,1)]" /> 
                      OPEN NOW
                    </div>

                    {/* Cafe Name & Details */}
                    <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between text-white">
                      <div>
                        <div className="text-[21px] font-black leading-tight mb-0.5 tracking-tight font-sans">
                          The Raydee Cafe
                        </div>
                        <div className="text-[12px] text-white/80 font-medium flex items-center gap-1.5">
                          <span>DTU Campus</span>
                          <span>·</span>
                          <span className="text-[#60A5FA] font-bold">~5-8 min prep</span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl text-[12px] font-bold border border-white/25 flex items-center gap-1">
                        <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                        <span>4.9</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Chips */}
                  <div className="px-4 pt-3.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'coffee', label: '☕ Coffee' },
                      { id: 'bakery', label: '🥐 Bakery' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? 'bg-[#0F172A] text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Menu Items List */}
                  <div className="p-4 flex flex-col gap-2.5 relative z-10">
                    {filteredItems.map((it) => {
                      const qty = cart[it.id] || 0;
                      return (
                        <motion.div 
                          key={it.id}
                          whileHover={{ scale: 1.015, y: -1 }}
                          className="group/item flex items-center gap-3 p-2.5 rounded-[22px] bg-white border border-[#0F172A]/[0.06] shadow-sm transition-all hover:shadow-md hover:border-[#0055D4]/30"
                        >
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-none border border-slate-100">
                            <Image 
                              src={it.img} 
                              alt={it.name} 
                              fill 
                              className="object-cover transition-transform duration-500 group-hover/item:scale-110" 
                            />
                            {it.tag && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold text-center py-0.5 tracking-tight uppercase">
                                {it.tag}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-[#0F172A] truncate">{it.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{it.desc}</div>
                            <div className="text-[13px] font-black text-[#0055D4] mt-0.5">₹{it.price}</div>
                          </div>

                          {/* Interactive Add Button */}
                          <div className="flex items-center gap-1.5 pr-1">
                            {qty > 0 ? (
                              <div className="flex items-center bg-[#F1F5F9] rounded-full p-0.5 border border-slate-200">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemove(it.id); }}
                                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#0F172A] shadow-xs hover:bg-slate-50"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-black text-[#0F172A]">{qty}</span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAdd(it.id); }}
                                  className="w-6 h-6 rounded-full bg-[#0055D4] flex items-center justify-center text-xs font-bold text-white shadow-xs hover:bg-[#0040A1]"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAdd(it.id)}
                                className="h-8 px-3 rounded-full bg-[#0F172A] text-white flex items-center gap-1 text-[11px] font-bold border-2 border-[#0F172A] shadow-[2px_2px_0px_#0055D4] hover:bg-[#0055D4] hover:shadow-[2px_2px_0px_#0F172A] transition-all"
                              >
                                <span>Add</span>
                                <span>+</span>
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Floating Cart Sticky Bottom Bar */}
                  <AnimatePresence>
                    {cartItemsCount > 0 && (
                      <motion.div 
                        initial={{ y: 80, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: 80, opacity: 0 }}
                        className="absolute bottom-3 left-4 right-4 z-20"
                      >
                        <button 
                          onClick={() => setOrderState('CART')}
                          className="w-full bg-[#0055D4] text-white px-4 py-3 rounded-xl font-bold border-[3px] border-[#0F172A] shadow-[6px_6px_0px_#0F172A] flex items-center justify-between hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#0F172A] active:translate-y-[6px] active:shadow-none transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">
                              {cartItemsCount} item{cartItemsCount > 1 ? 's' : ''}
                            </span>
                            <span className="text-xs font-black">₹{cartTotal}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs tracking-wide">
                            <span>View Order</span>
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* STATE 2: CART / CHECKOUT */}
              {orderState === 'CART' && (
                <motion.div 
                  key="cart" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  transition={{ duration: 0.25 }} 
                  className="p-6 min-h-[410px] flex flex-col bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      Order Summary
                    </div>
                    <button 
                      onClick={() => setOrderState('MENU')}
                      className="text-[11px] font-bold text-[#0055D4] hover:underline"
                    >
                      + Add more items
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    {Object.entries(cart).map(([id, qty]) => {
                      const item = ITEMS.find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex justify-between items-center p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-none">
                              <Image src={item.img} alt={item.name} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-[13px] text-[#0F172A]">{item.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">₹{item.price} each</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white rounded-lg border border-slate-200 px-1 py-0.5">
                              <button onClick={() => handleRemove(id)} className="px-1 text-xs font-bold text-slate-600">-</button>
                              <span className="px-1.5 text-xs font-black text-[#0F172A]">{qty}</span>
                              <button onClick={() => handleAdd(id)} className="px-1 text-xs font-bold text-slate-600">+</button>
                            </div>
                            <div className="font-black text-[13px] text-[#0F172A] w-12 text-right">
                              ₹{item.price * qty}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="h-[1px] bg-slate-100 my-1" />
                    
                    <div className="flex justify-between items-center font-black text-[#0F172A] text-[16px] px-1">
                      <div>Total Payable</div>
                      <div className="text-[#0055D4] text-[18px]">₹{cartTotal}</div>
                    </div>
                    
                    {/* Pickup Details Box */}
                    <div className="mt-auto pt-3 p-3.5 rounded-2xl bg-[#F1F5F9] border border-slate-200/80">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Direct Pickup At</div>
                      <div className="font-black text-[#0F172A] text-[14px] mt-0.5">The Raydee Cafe · Counter #1</div>
                      <div className="text-[11px] text-[#0055D4] font-bold flex items-center gap-1 mt-1">
                        <Clock size={12} /> Estimated prep time: ~5 mins
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setOrderState('CONFIRMING')}
                    className="w-full bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl font-bold mt-4 shadow-md flex items-center justify-center gap-2 hover:bg-[#0055D4] transition-all hover:scale-[1.01] text-sm"
                  >
                    <span>Confirm & Pay ₹{cartTotal}</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {/* STATE 3: ORDER CONFIRMING / TRANSMITTING */}
              {orderState === 'CONFIRMING' && (
                <motion.div 
                  key="confirming" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  onAnimationComplete={() => setTimeout(() => setOrderState('PREPARING'), 1800)} 
                  className="p-8 min-h-[410px] flex flex-col items-center justify-center text-center bg-white"
                >
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 14 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4 shadow-sm border-2 border-emerald-300"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  
                  <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    Order Transmitted
                  </div>
                  <div className="text-[22px] font-black text-[#0F172A] leading-tight mb-1">
                    The Raydee Cafe
                  </div>
                  <div className="text-[13px] text-slate-500 mb-6">
                    Directly queued at barista counter.
                  </div>
                  
                  <div className="bg-[#F8FAFC] border border-slate-200/80 w-full p-4 rounded-2xl shadow-xs">
                    <div className="text-[11px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Pickup Token</div>
                    <div className="font-black text-[#0055D4] text-[24px] tracking-wider">#GB-408</div>
                  </div>
                </motion.div>
              )}

              {/* STATE 4: LIVE PREPARING PROGRESS */}
              {orderState === 'PREPARING' && (
                <motion.div 
                  key="preparing" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="p-8 min-h-[410px] flex flex-col items-center justify-center text-center bg-white"
                >
                  <div className="relative mb-4">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }} 
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="text-[44px]"
                    >
                      ☕
                    </motion.div>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0055D4] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0055D4]" />
                    </span>
                  </div>

                  <div className="text-[11px] font-black tracking-widest text-[#0055D4] uppercase mb-1">
                    Live Preparation
                  </div>
                  <div className="text-[19px] font-black text-[#0F172A] mb-5">
                    Your barista is brewing
                  </div>
                  
                  {/* Progress Track */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 shadow-inner border border-slate-200/60">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#0055D4] to-[#3B82F6] rounded-full" 
                      style={{ width: `${prepProgress}%` }} 
                      transition={{ duration: 0.2 }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between w-full text-[12px] font-bold text-slate-500 px-1">
                    <span>{prepProgress < 50 ? 'Grinding beans...' : 'Pouring micro-foam...'}</span>
                    <span className="text-[#0055D4] font-black">{Math.round(prepProgress)}%</span>
                  </div>
                </motion.div>
              )}

              {/* STATE 5: READY FOR PICKUP */}
              {orderState === 'READY' && (
                <motion.div 
                  key="ready" 
                  initial={{ opacity: 0, scale: 0.92 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="p-8 min-h-[410px] flex flex-col items-center justify-center text-center bg-white"
                >
                  <div className="relative mb-5">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: 'spring', damping: 12, delay: 0.15 }} 
                      className="w-18 h-18 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30"
                    >
                      <Check size={36} strokeWidth={3.5} />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.8 }} 
                      className="absolute inset-0 rounded-full border-2 border-emerald-500" 
                    />
                  </div>
                  
                  <div className="text-[11px] font-black tracking-widest text-emerald-600 uppercase mb-1">
                    Ready At Counter
                  </div>
                  <div className="text-[22px] font-black text-[#0F172A] leading-tight mb-1">
                    The Raydee Cafe
                  </div>
                  <div className="text-[13px] text-slate-500 mb-6">
                    Present Token <span className="font-black text-[#0F172A]">#GB-408</span> to collect.
                  </div>
                  
                  <button 
                    onClick={() => { setOrderState('MENU'); setCart({ c1: 1 }); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] text-white text-[12px] font-bold hover:bg-[#0055D4] transition-all hover:scale-105"
                  >
                    <RotateCcw size={13} />
                    <span>Replay Demo</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cursor-follow realistic sheen reflection */}
            <motion.div 
              aria-hidden 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                background: sheen, 
                opacity: sheenOpacity, 
                mixBlendMode: 'soft-light', 
                pointerEvents: 'none', 
                zIndex: 30 
              }} 
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
