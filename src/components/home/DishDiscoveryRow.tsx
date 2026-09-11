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

      {/* Mobile Swipe Rail (<md): showing ~4.2 cards with smooth swipe */}
      <div className="md:hidden flex items-center gap-3 overflow-x-auto pb-2 pt-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        {items.map((dish) => (
          <Link
            key={dish.label}
            href={`/explore?q=${encodeURIComponent(dish.query)}`}
            className="group flex-none w-[88px] sm:w-[102px] flex flex-col items-center gap-2 cursor-pointer snap-start transition-all duration-200"
          >
            <div className="w-full aspect-square bg-white rounded-[18px] sm:rounded-[20px] border-2 border-[#D6E6FE] group-hover:border-[#1268F3] p-2 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] group-hover:shadow-[0_6px_20px_rgba(18,104,243,0.14)] transition-all duration-200 overflow-hidden">
              <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-slate-50">
                <Image
                  src={dish.photo}
                  alt={dish.label}
                  fill
                  sizes="90px"
                  className="object-cover transition-transform duration-250 group-hover:scale-106"
                />
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#334155] group-hover:text-[#1268F3] text-center truncate w-full transition-colors">
              {dish.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Desktop Grid (≥md): evenly distributed to fill 100% of the section width */}
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
            className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-1"
          >
            <div className="w-full aspect-square bg-white rounded-[20px] lg:rounded-[24px] border-2 border-[#D6E6FE] group-hover:border-[#1268F3] p-2.5 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_24px_rgba(18,104,243,0.16)] transition-all duration-200 overflow-hidden">
              <div className="relative w-full h-full rounded-[15px] lg:rounded-[18px] overflow-hidden bg-slate-50">
                <Image
                  src={dish.photo}
                  alt={dish.label}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-250 group-hover:scale-108"
                />
              </div>
            </div>
            <span className="text-[13px] lg:text-[14px] font-bold text-[#334155] group-hover:text-[#1268F3] text-center truncate w-full transition-colors">
              {dish.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
