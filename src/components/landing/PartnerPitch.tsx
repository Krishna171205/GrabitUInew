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
  }
];

const AUTOPLAY_INTERVAL = 5500; // 5.5 seconds per tab

// --- MOCK UI COMPONENTS FOR THE DASHBOARD ---

const LiveQueueView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-8">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[24px] font-bold text-[#111317]">Live Queue</h3>
      <div className="bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-[13px] font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
        <MS name="filter_list" size={16} className="text-gray-500" /> Filter
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col flex-1">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
        <div className="col-span-2">Order</div>
        <div className="col-span-5">Items</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-2 text-right">Amount</div>
      </div>
      <div className="flex flex-col">
        {[
          { id: '#4092', items: '2x Iced Latte (Oat), 1x Almond Croissant', status: 'PREPARING', statusColor: 'bg-blue-100 text-blue-700', amount: '₹680', active: true },
          { id: '#4091', items: '1x Americano, 1x Espresso', status: 'READY', statusColor: 'bg-green-100 text-green-700', amount: '₹280' },
          { id: '#4090', items: '3x Flat White', status: 'PICKED UP', statusColor: 'bg-gray-100 text-gray-500', amount: '₹840' },
          { id: '#4089', items: '1x Matcha Latte, 1x Choc Chip Cookie', status: 'PICKED UP', statusColor: 'bg-gray-100 text-gray-500', amount: '₹420' },
          { id: '#4088', items: '2x Cappuccino', status: 'PICKED UP', statusColor: 'bg-gray-100 text-gray-500', amount: '₹440' },
        ].map((row, i) => (
          <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-50 last:border-0 items-center text-[14px] transition-colors ${row.active ? 'bg-blue-50/40 relative' : 'hover:bg-gray-50'}`}>
            {row.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0055D4]" />}
            <div className="col-span-2 font-bold text-gray-500">{row.id}</div>
            <div className="col-span-5 font-medium text-[#111317] truncate pr-4">{row.items}</div>
            <div className="col-span-3">
              <span className={`px-2.5 py-1.5 rounded-[6px] text-[10.5px] font-bold tracking-wide ${row.statusColor}`}>
                {row.status}
              </span>
            </div>
            <div className="col-span-2 text-right font-bold text-[#111317]">{row.amount}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MenuSyncView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-8">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[24px] font-bold text-[#111317]">Menu Management</h3>
      <div className="bg-[#0055D4] text-white shadow-[0_4px_12px_rgba(0,85,212,0.2)] rounded-lg px-4 py-2 text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#0044AA] transition-colors">
        <MS name="add" size={16} /> Add Item
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col flex-1">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
        <div className="col-span-5">Item Name</div>
        <div className="col-span-3 text-center">Availability</div>
        <div className="col-span-4 text-right">Price</div>
      </div>
      <div className="flex flex-col">
        {[
          { name: 'Iced Latte (Oat)', category: 'Cold Coffee', inStock: true, price: '₹260' },
          { name: 'Flat White', category: 'Hot Coffee', inStock: true, price: '₹220' },
          { name: 'Almond Croissant', category: 'Pastries', inStock: false, price: '₹220' },
          { name: 'Matcha Latte', category: 'Tea', inStock: true, price: '₹320' },
          { name: 'Pour Over (Ethiopia)', category: 'Manual Brew', inStock: true, price: '₹350' },
        ].map((item, i) => (
          <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-50 last:border-0 items-center text-[14px] transition-colors ${!item.inStock ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
            <div className="col-span-5 flex flex-col gap-0.5">
              <span className={`font-bold ${item.inStock ? 'text-[#111317]' : 'text-gray-400'}`}>{item.name}</span>
              <span className="text-[12px] text-gray-400 font-medium">{item.category}</span>
            </div>
            <div className="col-span-3 flex justify-center">
              {/* Refined Toggle Switch */}
              <div className={`w-10 h-5.5 rounded-full flex items-center p-[2px] transition-colors ${item.inStock ? 'bg-[#10B981]' : 'bg-gray-300'}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${item.inStock ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </div>
            </div>
            <div className="col-span-4 flex justify-end items-center gap-4">
              <span className="font-bold text-[#111317]">{item.price}</span>
              <div className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer">
                <MS name="more_horiz" size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AnalyticsView = () => (
  <div className="flex flex-col h-full bg-[#FAFAFA] p-8">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[24px] font-bold text-[#111317]">Today's Performance</h3>
      <div className="bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-[13px] font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-50">
        Today <MS name="expand_more" size={16} className="text-gray-500" />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</div>
        <div className="text-[32px] font-black text-[#111317] leading-none">₹14,250</div>
        <div className="text-[12px] font-bold text-green-600 flex items-center gap-1.5 mt-3 bg-green-50 w-fit px-2 py-1 rounded-md">
          <MS name="trending_up" size={14} /> +12.4% vs yesterday
        </div>
        <MS name="account_balance_wallet" size={80} className="absolute -right-4 -bottom-4 text-gray-50 opacity-50" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Orders Completed</div>
        <div className="text-[32px] font-black text-[#111317] leading-none">64</div>
        <div className="text-[12px] font-bold text-green-600 flex items-center gap-1.5 mt-3 bg-green-50 w-fit px-2 py-1 rounded-md">
          <MS name="trending_up" size={14} /> +8.2% vs yesterday
        </div>
        <MS name="receipt_long" size={80} className="absolute -right-4 -bottom-4 text-gray-50 opacity-50" />
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex-1 flex flex-col justify-end relative overflow-hidden">
      <div className="absolute top-6 left-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">Hourly Volume</div>
      
      {/* Refined Bar Chart */}
      <div className="flex items-end gap-3 h-32 w-full mt-8">
        {[20, 35, 25, 40, 60, 85, 100, 75, 45, 30, 15].map((h, i) => (
          <div key={i} className="flex-1 h-full bg-blue-50 rounded-t-md relative group overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-[#0055D4] rounded-t-md transition-all duration-700 ease-out" 
              style={{ height: `${h}%` }} 
            />
            {/* Hover tooltip effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full mt-3 text-[10px] font-bold text-gray-300 uppercase">
        <span>8 AM</span>
        <span>12 PM</span>
        <span>4 PM</span>
        <span>8 PM</span>
      </div>
    </div>
  </div>
);


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
      <div className="max-w-[1440px] mx-auto px-6 lg:pl-12 lg:pr-0 relative z-10 flex flex-col lg:flex-row items-center lg:items-center min-h-[720px] lg:min-h-[850px]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEFT COLUMN: EDITORIAL FEATURE SELECTOR
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full lg:w-[42%] flex flex-col z-20 py-12 lg:py-0 pr-0 lg:pr-12">
          
          <h2 
            className="text-[64px] sm:text-[76px] lg:text-[88px] xl:text-[96px] leading-[1.05] tracking-[0.02em] font-normal uppercase text-[#111317] mb-16 lg:mb-20"
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
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
            style={{ x: frameX, y: frameY }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[800px] lg:max-w-none lg:w-[1100px] aspect-[4/3] lg:aspect-auto lg:h-[720px] xl:h-[760px] bg-white rounded-[20px] lg:rounded-[24px] border border-black/[0.04] flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.12), 0 10px 30px -10px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,1) inset'
            }}
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
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {activeTab === 0 && <LiveQueueView />}
                    {activeTab === 1 && <MenuSyncView />}
                    {activeTab === 2 && <AnalyticsView />}
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
