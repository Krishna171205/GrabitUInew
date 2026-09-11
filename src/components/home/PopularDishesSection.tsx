'use client';

import React from 'react';
import Image from 'next/image';
import { MS } from '@/components/gb/kit';
import { POPULAR_DISHES } from './homeData';

export function PopularDishesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        <div className="mb-8">
          <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">
            Popular around DTU
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium">
            What students are grabbing right now.
          </p>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-4">
          <div className="flex gap-4 sm:gap-5 w-max">
            {POPULAR_DISHES.map((dish) => (
              <div 
                key={dish.id}
                className="group w-[160px] sm:w-[180px] cursor-pointer"
              >
                {/* 1:1 Image */}
                <div className="relative w-full aspect-square rounded-[18px] sm:rounded-[20px] overflow-hidden mb-3 bg-[#F8FAFC]">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 160px, 180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle hover overlay to invite click */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Text Content */}
                <div>
                  <h3 className="font-bold text-[15px] sm:text-[16px] text-[#0F172A] leading-tight mb-1">
                    {dish.name}
                  </h3>
                  <div className="flex items-center text-[12px] sm:text-[13px] text-[#64748B] font-bold mb-1.5 gap-1.5">
                    <span>₹{dish.price}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-[#CBD5E1]" />
                    <span className="text-[#C77800]">★</span>
                    <span>{dish.rating}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-[12px] font-medium text-[#94A3B8]">
                    <span>{dish.cafe}</span>
                    <MS name="arrow_forward" size={14} className="text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0055D4]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
