'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface DishItem {
  label: string;
  query: string;
  photo: string;
}

interface DishDiscoveryRowProps {
  title: string;
  items: DishItem[];
  seeAllHref?: string;
}

export default function DishDiscoveryRow({ title, items, seeAllHref = '/explore' }: DishDiscoveryRowProps) {
  return (
    <section className="w-full flex flex-col gap-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] sm:text-[23px] font-black text-[#0F172A] tracking-tight">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="group flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#1268F3] hover:text-[#0A56CD] transition-colors"
          >
            <span>See all</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        )}
      </div>

      {/* Mobile Swipe Rail (<md): showing ~4.4 cards with smooth swipe, perfectly aligned with section heading */}
      <div className="md:hidden flex items-center gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
        {items.map((dish) => (
          <Link
            key={dish.label}
            href={`/explore?q=${encodeURIComponent(dish.query)}`}
            className="group flex-none w-[84px] sm:w-[96px] flex flex-col items-center gap-1.5 cursor-pointer snap-start transition-all duration-200 active:scale-95"
          >
            {/* The Light-Blue Card Box from Image 1 */}
            <div className="w-full aspect-[4/4.9] bg-[#EAF2FE] hover:bg-[#DDEBFE] rounded-[18px] border-2 border-[#BED8FE] group-hover:border-[#0055D4] p-1.5 flex flex-col items-center justify-between shadow-[0_2px_8px_rgba(0,85,212,0.06)] group-hover:shadow-[0_4px_14px_rgba(0,85,212,0.18)] transition-all duration-200 overflow-hidden">
              <div className="relative w-full aspect-square rounded-[13px] overflow-hidden bg-white shadow-2xs">
                <Image
                  src={dish.photo}
                  alt={dish.label}
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-250 group-hover:scale-108"
                />
              </div>
              <span className="text-[11px] font-extrabold text-[#1E293B] group-hover:text-[#0055D4] text-center truncate w-full px-0.5 pb-0.5 transition-colors">
                {dish.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop Grid (≥md): matching the mobile version cards with light-blue rounded container, inner image & label */}
      <div
        className="hidden md:grid gap-3.5 lg:gap-4.5 xl:gap-5 w-full"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((dish) => (
          <Link
            key={dish.label}
            href={`/explore?q=${encodeURIComponent(dish.query)}`}
            className="group flex flex-col cursor-pointer transition-all duration-200"
          >
            {/* The Light-Blue Card Box matching Mobile Version */}
            <div className="w-full aspect-[4/4.9] bg-[#EAF2FE] hover:bg-[#DDEBFE] rounded-[22px] lg:rounded-[26px] border-2 border-[#BED8FE] group-hover:border-[#0055D4] p-2 lg:p-2.5 flex flex-col items-center justify-between shadow-[0_4px_16px_rgba(0,85,212,0.06)] group-hover:shadow-[0_12px_28px_rgba(0,85,212,0.18)] group-hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
              <div className="relative w-full aspect-square rounded-[16px] lg:rounded-[20px] overflow-hidden bg-white shadow-2xs">
                <Image
                  src={dish.photo}
                  alt={dish.label}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-108"
                />
              </div>
              <span className="text-[13px] lg:text-[14.5px] font-extrabold text-[#1E293B] group-hover:text-[#0055D4] text-center truncate w-full px-1 pt-1.5 pb-0.5 transition-colors">
                {dish.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
