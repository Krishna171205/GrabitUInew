'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import type { RealCafe } from '@/components/gb/cards';
import { QUICK_FILTERS } from './homeData';

export function OpenAroundYouSection({ cafes }: { cafes: RealCafe[] }) {
  // Safe default tags if the backend doesn't provide them
  const defaultTags = ['Coffee', 'Sandwiches', 'Pasta'];

  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[#0F172A] tracking-tight">
                Open around you
              </h2>
              <span className="bg-[#E6F0FF] text-[#0055D4] text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide hidden sm:block">
                12 cafés open now
              </span>
            </div>
          </div>
          <Link href="/explore" className="text-[13.5px] font-bold text-[#0055D4] hover:text-[#0040A1] transition-colors flex items-center gap-1 group pb-1">
            See all <MS name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 mb-8">
          <div className="flex items-center gap-2.5 w-max pb-2">
            <button className="bg-[#0F172A] text-white border border-[#0F172A] px-4 py-1.5 rounded-full text-[13px] font-bold transition-all">
              All
            </button>
            {QUICK_FILTERS.map((filter) => (
              <button 
                key={filter.value}
                className="bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A] px-4 py-1.5 rounded-full text-[13px] font-bold transition-all"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Café Cards Horizontal Scroll */}
        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-6">
          <div className="flex gap-5 sm:gap-6 w-max">
            {cafes.map((cafe) => (
              <Link 
                href={`/${cafe.slug}`} 
                key={cafe.id}
                className="group flex flex-col w-[280px] sm:w-[320px] bg-white rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#E2E8F0] shadow-sm hover:shadow-[0_12px_40px_rgba(0,10,30,0.08)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Section (60% height visual) */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={cafe.cover_url || '/placeholder-cafe.jpg'}
                    alt={cafe.name}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-[12px] flex items-center gap-1.5 shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${cafe.acceptingOrders !== false ? 'bg-[#1f9d57]' : 'bg-[#ba1a1a]'}`} />
                    <span className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                      {cafe.acceptingOrders !== false ? 'Open now' : 'Closed'}
                    </span>
                  </div>
                  {/* Save Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <MS name="bookmark_border" size={18} color="#0F172A" />
                  </button>
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-[10px] flex items-center gap-1 shadow-sm">
                    <span className="text-[#C77800] text-[14px]">★</span>
                    <span className="text-[12px] font-bold text-[#0F172A]">{cafe.rating || '4.8'}</span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-[18px] text-[#0F172A] truncate pr-2">
                      {cafe.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-[13px] text-[#64748B] font-medium mb-3 gap-1.5">
                    <span>₹₹</span>
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                    <span>8 min walk</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {defaultTags.map(tag => (
                      <span key={tag} className="bg-[#F1F5F9] text-[#475569] text-[11px] font-bold px-2 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex justify-between items-center group-hover:border-[#E2E8F0] transition-colors">
                    <span className="text-[11.5px] font-bold text-[#0055D4] uppercase tracking-wide flex items-center gap-1">
                      View menu <MS name="arrow_forward" size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[11.5px] font-bold text-[#94A3B8]">
                      Good for · Study
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}
