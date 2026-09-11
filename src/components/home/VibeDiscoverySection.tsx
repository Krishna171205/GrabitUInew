'use client';

import React from 'react';
import Image from 'next/image';
import { VIBE_CARDS } from './homeData';

export function VibeDiscoverySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        <div className="mb-8">
          <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">
            What&apos;s the vibe?
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium">
            Pick what you&apos;re in the mood for.
          </p>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-4">
          <div className="flex gap-4 sm:gap-5 w-max">
            {VIBE_CARDS.map((vibe) => (
              <div 
                key={vibe.id}
                className="group relative w-[220px] sm:w-[240px] md:w-[260px] aspect-[4/5] rounded-[20px] sm:rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_12px_40px_rgba(0,10,30,0.1)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={vibe.image}
                    alt={vibe.title}
                    fill
                    sizes="(max-width: 768px) 240px, 260px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>
                
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
                  <h3 className="text-white font-bold text-[18px] sm:text-[20px] leading-tight mb-1.5 drop-shadow-sm">
                    {vibe.title}
                  </h3>
                  <p className="text-white/80 font-medium text-[13px] leading-snug drop-shadow-sm">
                    {vibe.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
