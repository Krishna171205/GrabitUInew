'use client';

import React from 'react';
import { MS } from '@/components/gb/kit';
import { HeroCupWatermark } from '@/components/gb/HeroCupWatermark';
import { INTENT_CHIPS } from './homeData';

export function DiscoveryHero() {
  return (
    <section className="relative w-full bg-[#0055D4] overflow-hidden pt-[calc(30px+env(safe-area-inset-top))] sm:pt-16 pb-8 lg:pb-12 text-white">
      {/* Background Illustration */}
      <div className="absolute right-[-10%] bottom-[-15%] pointer-events-none opacity-20 hidden sm:block md:right-0 md:bottom-0">
        <HeroCupWatermark top="auto" maxWidth={360} />
      </div>
      
      <div className="relative z-10 max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12 flex flex-col items-start h-full">
        
        {/* Location & Status */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-3 py-1.5 rounded-full cursor-pointer">
            <span className="text-[14px]">📍</span>
            <span className="text-[13.5px] font-bold text-white">Around DTU</span>
            <MS name="expand_more" size={16} color="white" />
          </div>
          <span className="text-[12.5px] text-[#99BBFF] font-medium ml-1 hidden sm:block">
            12 cafés open nearby
          </span>
        </div>

        {/* Headings */}
        <div className="max-w-2xl mb-8">
          <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-black tracking-tight leading-[1.1] mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
            Where are we grabbing today?
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#99BBFF] font-medium leading-relaxed max-w-md">
            Find cafés, food, drinks and chill spots around you.
          </p>
        </div>

        {/* Search Field */}
        <div className="w-full max-w-[660px] relative mb-5">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <MS name="search" size={24} color="#94A3B8" />
          </div>
          <input 
            type="text" 
            placeholder="Search cafés, dishes, drinks..." 
            className="w-full h-[54px] sm:h-[60px] pl-[46px] pr-5 rounded-[16px] sm:rounded-[18px] bg-white border-0 shadow-[0_8px_30px_rgba(0,10,30,0.12)] text-[#0F172A] font-medium text-[15px] sm:text-[16px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-white/20 transition-shadow"
          />
        </div>

        {/* Quick Actions (Intents) */}
        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2.5 sm:gap-3 w-max pb-2">
            {INTENT_CHIPS.map((chip) => (
              <button 
                key={chip.value}
                className="group flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-[13.5px] font-bold text-white whitespace-nowrap">
                  {chip.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
