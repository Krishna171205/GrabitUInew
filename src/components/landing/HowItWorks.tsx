'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MS } from '@/components/gb/kit';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 bg-[#F8FAFC] text-[#0F172A] overflow-hidden border-b-2 border-[#0F172A]/10">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-24 md:mb-40 relative">
          <div className="absolute -top-10 left-[10%] md:-left-[10%] rotate-[-10deg]">
            <Annotation text="three simple steps" arrowDirection="down-right" delay={0.2} />
          </div>
          <h2 className="text-[60px] md:text-[90px] font-black tracking-[-0.03em] leading-[0.85] text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
            HOW IT WORKS?
          </h2>
        </div>

        <div className="relative">
          {/* Vertical Connecting Line (Hand-drawn feel) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-[#0055D4]/20 border-l border-dashed border-[#0055D4]/40 -translate-x-1/2" />

          {/* --- STEP 01: DISCOVER --- */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-24 md:mb-32 gap-10 relative">
            <div className="w-full md:w-5/12 order-2 md:order-1 flex justify-end md:pr-10 relative">
              <Sticker text="NEAR YOU" color="blue" rotation={-15} className="top-0 -left-6 z-30" />
              <div className="w-full max-w-[340px] bg-white rounded-[16px] p-4 shadow-[8px_8px_0px_#0F172A] border-2 border-[#0F172A] relative z-10 rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl border border-[#0F172A]/10">
                  <MS name="search" size={18} color="#64748B" />
                  <div className="text-sm font-bold text-[#94A3B8]">Find cafes...</div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-[#0F172A]/10">
                        <img src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&q=80&sig=${i}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 w-3/4 bg-[#0F172A] rounded-full mb-2" />
                        <div className="flex gap-2">
                          <div className="h-2 w-10 bg-[#0055D4] rounded-full" />
                          <div className="h-2 w-16 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-5/12 order-1 md:order-2 pl-0 md:pl-10">
              <div className="text-[#0055D4] text-[80px] leading-none mb-4 opacity-20 absolute -top-10 -left-4 pointer-events-none" style={{ fontFamily: 'var(--font-anton)' }}>1.</div>
              <h3 className="text-[40px] font-black leading-[0.9] mb-4 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
                Take the quiz. <br />
                <span className="text-[#0055D4] text-[24px]" style={{ fontFamily: 'var(--font-caveat)' }}>Or just browse.</span>
              </h3>
              <p className="text-[#64748B] text-[16px] font-semibold leading-relaxed border-l-4 border-[#0055D4] pl-4">
                Instantly find the best cafés around you. See live pickup times, read reviews, and explore curated menus tailored to your taste.
              </p>
            </div>
          </div>

          {/* --- STEP 02: PRE-ORDER --- */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-24 md:mb-32 gap-10 relative">
            <div className="w-full md:w-5/12 pr-0 md:pr-10 text-left md:text-right">
              <div className="text-[#0055D4] text-[80px] leading-none mb-4 opacity-20 absolute -top-10 -right-4 pointer-events-none" style={{ fontFamily: 'var(--font-anton)' }}>2.</div>
              <h3 className="text-[40px] font-black leading-[0.9] mb-4 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
                Get your plan. <br />
                <span className="text-[#0055D4] text-[24px]" style={{ fontFamily: 'var(--font-caveat)' }}>Customize everything.</span>
              </h3>
              <p className="text-[#64748B] text-[16px] font-semibold leading-relaxed border-r-0 md:border-r-4 border-l-4 md:border-l-0 border-[#0055D4] pl-4 md:pl-0 md:pr-4">
                Oat milk? Extra shot? Customize your order exactly how you like it. Pay securely ahead of time with a single tap.
              </p>
            </div>
            <div className="w-full md:w-5/12 pl-0 md:pl-10 relative">
              <Sticker text="BESPOKE" color="cream" rotation={10} className="bottom-0 -right-6 z-30" />
              <div className="w-full max-w-[340px] bg-[#0F172A] rounded-[16px] overflow-hidden shadow-[8px_8px_0px_#0055D4] border-2 border-[#0F172A] relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 flex flex-col text-white">
                <div className="h-40 relative border-b-2 border-[#0055D4]">
                  <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-[20px] font-black uppercase tracking-wider">Iced Americano</div>
                    <div className="text-[16px] font-bold text-[#0055D4]">₹180</div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div className="text-[14px] font-bold">Milk</div>
                    <div className="text-[12px] font-bold bg-[#0055D4] text-white px-2 py-1 rounded">Oat Milk</div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div className="text-[14px] font-bold">Espresso</div>
                    <div className="text-[12px] font-bold bg-white/20 px-2 py-1 rounded">Extra Shot</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- STEP 03: PICK UP --- */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative">
            <div className="w-full md:w-5/12 order-2 md:order-1 flex justify-end md:pr-10 relative">
              <Sticker text="GRAB & GO" color="navy" rotation={-5} className="-top-6 right-10 z-30" />
              <div className="w-full max-w-[340px] bg-[#0055D4] rounded-[16px] p-8 text-center shadow-[8px_8px_0px_#0F172A] border-2 border-[#0F172A] flex flex-col items-center justify-center text-white h-[360px] relative z-10 rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 text-[#0055D4] border-2 border-[#0F172A]">
                  <MS name="check" size={32} />
                </div>
                <div className="text-[12px] font-bold tracking-widest uppercase opacity-90 mb-1" style={{ fontFamily: 'var(--font-anton)' }}>Status</div>
                <div className="text-[40px] font-black leading-none mb-6" style={{ fontFamily: 'var(--font-anton)' }}>ORDER READY</div>
                
                <div className="bg-[#0F172A] text-white w-full py-4 rounded-xl border-2 border-[#0F172A] shadow-inner">
                  <div className="text-[11px] font-bold tracking-widest uppercase opacity-80 mb-1">Pickup Counter</div>
                  <div className="text-[42px] font-black leading-none" style={{ fontFamily: 'var(--font-anton)' }}>04</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-5/12 order-1 md:order-2 pl-0 md:pl-10">
              <div className="text-[#0055D4] text-[80px] leading-none mb-4 opacity-20 absolute -top-10 -left-4 pointer-events-none" style={{ fontFamily: 'var(--font-anton)' }}>3.</div>
              <h3 className="text-[40px] font-black leading-[0.9] mb-4 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
                Eat & Enjoy. <br />
                <span className="text-[#0055D4] text-[24px]" style={{ fontFamily: 'var(--font-caveat)' }}>Walk in. Walk out.</span>
              </h3>
              <p className="text-[#64748B] text-[16px] font-semibold leading-relaxed border-l-4 border-[#0055D4] pl-4">
                Skip the entire queue. Your order is prepared exactly for your arrival time. Just grab it from the counter and go.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
