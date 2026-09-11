'use client';

import React from 'react';
import { PERFECT_FOR_CARDS } from './homeData';

export function PerfectForSection() {
  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        <div className="mb-6">
          <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[#0F172A] tracking-tight">
            Perfect for...
          </h2>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-4">
          <div className="flex gap-3 sm:gap-4 w-max">
            {PERFECT_FOR_CARDS.map((card) => (
              <div 
                key={card.id}
                className="group w-[150px] sm:w-[160px] bg-white border border-[#E2E8F0] p-4 rounded-[16px] cursor-pointer hover:border-[#0055D4]/30 hover:shadow-[0_8px_24px_rgba(0,85,212,0.06)] transition-all duration-300"
              >
                <h3 className="font-bold text-[15px] text-[#0F172A] mb-2 group-hover:text-[#0055D4] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[12px] text-[#64748B] font-medium leading-relaxed whitespace-pre-line">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
