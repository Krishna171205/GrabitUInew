'use client';

import React from 'react';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export function ContextualLoginBanner() {
  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        <div className="w-full bg-[#E6F0FF] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#CCE0FF]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-[#0055D4]">
              <MS name="electric_bolt" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[15px] sm:text-[16px] text-[#0055D4] mb-0.5">
                Want faster reorders?
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#3377DE] font-medium">
                Sign in to save cafés & track pickups
              </p>
            </div>
          </div>
          
          <Link 
            href="/login"
            className="group flex items-center justify-center gap-2 bg-[#0055D4] hover:bg-[#0040A1] text-white px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Log in <MS name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
