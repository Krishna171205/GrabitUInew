'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MS } from '@/components/gb/kit';

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-[#FDFBF7] text-[#1A1311] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 md:mb-32">
          <h2 className="text-[36px] md:text-[52px] font-black tracking-tighter leading-none mb-6">
            Coffee without <br /> <span className="text-[#F09819] italic font-serif">the wait.</span>
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#8A7A6B] font-semibold leading-relaxed">
            Your daily coffee ritual, completely reimagined. No more queues, no more delays. Just perfect timing.
          </p>
        </div>

        {/* --- STEP 01: DISCOVER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 md:mb-40 gap-10">
          <div className="w-full md:w-5/12 order-2 md:order-1">
            <div className="relative w-full max-w-[340px] mx-auto">
              {/* Product UI Mockup: Discover */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0, 0.4], [50, -20]) }}
                className="bg-white rounded-[32px] p-4 shadow-[0_20px_60px_rgba(26,19,17,0.08)] border border-[#EBE4D8]"
              >
                <div className="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-2xl">
                  <MS name="search" size={18} color="#8A7A6B" />
                  <div className="h-2 w-24 bg-gray-200 rounded-full" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&q=80&sig=${i}`} className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 w-3/4 bg-[#1A1311] rounded-full mb-2" />
                        <div className="flex gap-2">
                          <div className="h-2 w-10 bg-[#F09819] rounded-full" />
                          <div className="h-2 w-16 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              {/* Floating Element */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0, 0.4], [100, -60]) }}
                className="absolute -right-8 -bottom-8 bg-[#1A1311] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-[#F09819] flex items-center justify-center"><MS name="near_me" size={20} /></div>
                <div>
                  <div className="text-[11px] font-bold text-white/60 tracking-widest uppercase">Nearby</div>
                  <div className="text-[16px] font-black">12 Cafés</div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="w-full md:w-5/12 order-1 md:order-2">
            <div className="text-[13px] font-bold text-[#F09819] tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F09819]" /> STEP 01
            </div>
            <h3 className="text-[32px] md:text-[42px] font-black leading-[1.1] mb-4 text-[#1A1311]">
              Discover local favorites.
            </h3>
            <p className="text-[#8A7A6B] text-[16px] font-semibold leading-relaxed">
              Instantly find the best cafés around you. See live pickup times, read reviews, and explore curated menus tailored to your taste.
            </p>
          </div>
        </div>

        {/* --- STEP 02: PRE-ORDER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 md:mb-40 gap-10">
          <div className="w-full md:w-5/12">
            <div className="text-[13px] font-bold text-[#F09819] tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F09819]" /> STEP 02
            </div>
            <h3 className="text-[32px] md:text-[42px] font-black leading-[1.1] mb-4 text-[#1A1311]">
              Customize & order.
            </h3>
            <p className="text-[#8A7A6B] text-[16px] font-semibold leading-relaxed">
              Oat milk? Extra shot? Customize your order exactly how you like it. Pay securely ahead of time with a single tap.
            </p>
          </div>
          <div className="w-full md:w-5/12">
            <div className="relative w-full max-w-[340px] mx-auto">
              {/* Product UI Mockup: Pre-Order */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0.2, 0.7], [50, -30]) }}
                className="bg-white rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(26,19,17,0.08)] border border-[#EBE4D8] flex flex-col"
              >
                <div className="h-40 bg-gray-100 relative">
                  <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-[20px] font-black">Iced Americano</div>
                    <div className="text-[14px] font-bold text-[#F09819]">₹180</div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="text-[14px] font-bold text-[#1A1311]">Milk</div>
                    <div className="text-[12px] font-semibold bg-[#F09819]/10 text-[#F09819] px-2 py-1 rounded">Oat Milk</div>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="text-[14px] font-bold text-[#1A1311]">Espresso</div>
                    <div className="text-[12px] font-semibold bg-gray-100 text-[#8A7A6B] px-2 py-1 rounded">Extra Shot</div>
                  </div>
                  <div className="w-full bg-[#1A1311] text-white rounded-xl py-3 text-center font-bold text-[14px] mt-2">
                    Add to Cart
                  </div>
                </div>
              </motion.div>
              {/* Floating Element */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0.2, 0.7], [80, -80]) }}
                className="absolute -left-10 top-10 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#EBE4D8]"
              >
                <div className="w-10 h-10 rounded-full bg-[#EBE4D8] flex items-center justify-center text-[18px]">✨</div>
                <div>
                  <div className="text-[10px] font-bold text-[#8A7A6B] tracking-widest uppercase">Customized</div>
                  <div className="text-[14px] font-black text-[#1A1311]">Just for you</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* --- STEP 03: PICK UP --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="w-full md:w-5/12 order-2 md:order-1">
            <div className="relative w-full max-w-[340px] mx-auto">
              {/* Product UI Mockup: Pick Up */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0.5, 1], [50, -30]) }}
                className="bg-[#F09819] rounded-[32px] p-8 text-center shadow-[0_20px_60px_rgba(240,152,25,0.3)] flex flex-col items-center justify-center text-white h-[360px]"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 text-[#F09819]">
                  <MS name="check" size={32} />
                </div>
                <div className="text-[12px] font-bold tracking-widest uppercase opacity-90 mb-1">Status</div>
                <div className="text-[32px] font-black leading-none mb-6">ORDER READY</div>
                
                <div className="bg-[rgba(255,255,255,0.3)] w-full py-4 rounded-2xl">
                  <div className="text-[11px] font-bold tracking-widest uppercase opacity-80 mb-1">Pickup Counter</div>
                  <div className="text-[42px] font-black leading-none">04</div>
                </div>
              </motion.div>
              {/* Floating Element */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0.5, 1], [100, -60]) }}
                className="absolute -right-8 bottom-12 bg-white p-4 rounded-2xl shadow-xl border border-[#EBE4D8]"
              >
                <div className="text-[10px] font-bold text-[#8A7A6B] tracking-widest uppercase mb-1">Time Saved</div>
                <div className="text-[24px] font-black text-[#1A1311]">14 Min</div>
              </motion.div>
            </div>
          </div>
          <div className="w-full md:w-5/12 order-1 md:order-2">
            <div className="text-[13px] font-bold text-[#F09819] tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#F09819]" /> STEP 03
            </div>
            <h3 className="text-[32px] md:text-[42px] font-black leading-[1.1] mb-4 text-[#1A1311]">
              Walk in. Walk out.
            </h3>
            <p className="text-[#8A7A6B] text-[16px] font-semibold leading-relaxed">
              Skip the entire queue. Your order is prepared exactly for your arrival time. Just grab it from the counter and go.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
