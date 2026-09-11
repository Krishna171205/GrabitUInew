'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export interface CafeItem {
  id?: number | string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  cover_url?: string;
  rating?: number;
  tags?: string[];
  prepTimeMinutes?: string;
  distanceKm?: number;
  acceptingOrders?: boolean;
}

interface EditorialCafeRowProps {
  title: string;
  cafes: CafeItem[];
  seeAllHref?: string;
}

/** Stylized Barcode Graphic mirroring the Figma card signature aesthetic */
function CardBarcode({ code }: { code: string }) {
  const bars = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2];
  return (
    <div className="w-full flex flex-col gap-1.5 pt-2.5 border-t border-white/15 mt-auto">
      <div className="flex items-end justify-between h-4 gap-[2px] opacity-75 overflow-hidden">
        {bars.map((w, i) => (
          <span
            key={i}
            className="bg-white inline-block rounded-xs"
            style={{
              width: `${w * 1.4}px`,
              height: i % 4 === 0 ? '100%' : i % 2 === 0 ? '75%' : '88%',
            }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold tracking-widest text-white/60 uppercase">
        <span>{code}</span>
        <span>GRABBIT PASS</span>
      </div>
    </div>
  );
}

function CafeCard({ cafe, index }: { cafe: CafeItem; index: number }) {
  const [saved, setSaved] = useState(false);

  const isOpen = cafe.acceptingOrders !== false;
  const ratingText = cafe.rating ? cafe.rating.toFixed(1) : '4.9';
  const categoryText = cafe.tags && cafe.tags.length > 0 ? cafe.tags.slice(0, 2).join(' · ') : 'Coffee · Quick Bites';
  const locationText = cafe.address ? `${cafe.city || 'Delhi'} · ${cafe.address}` : `${cafe.city || 'Delhi'} · Campus`;

  return (
    <Link
      href={`/${cafe.slug}`}
      className="group relative flex flex-col justify-between bg-[#061A42] hover:bg-[#04132F] text-white rounded-[24px] sm:rounded-[26px] p-3.5 sm:p-4.5 border border-[#1A3266] shadow-[0_10px_30px_rgba(6,26,66,0.18)] hover:shadow-[0_18px_42px_rgba(6,26,66,0.28)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
    >
      {/* Upper Section (58% of height): Cafe Image + Badges */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/10.5] rounded-[18px] sm:rounded-[20px] overflow-hidden bg-[#0F172A] shadow-inner">
        {cafe.cover_url ? (
          <Image
            src={cafe.cover_url}
            alt={cafe.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-95"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="relative z-10 flex items-center justify-between w-full p-2.5 sm:p-3">
          {/* Status Badge Pill */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'
              }`}
            />
            <span className="text-[10px] sm:text-[10.5px] font-black tracking-wider text-[#0F172A] uppercase">
              {isOpen ? 'Open now' : 'Closed'}
            </span>
          </div>

          {/* Top Right Controls: Rating & Bookmark */}
          <div className="flex items-center gap-2">
            {/* Small Rating Circle */}
            <div className="h-7 px-2 rounded-full bg-white/95 backdrop-blur-md flex items-center gap-1 text-[#0F172A] font-bold text-[11px] shadow-xs">
              <span className="text-[#1268F3]">★</span>
              <span>{ratingText}</span>
            </div>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSaved(!saved);
              }}
              aria-label="Save café to favourites"
              className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#0F172A] hover:text-[#1268F3] shadow-xs active:scale-90 transition-transform cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill={saved ? '#1268F3' : 'none'}
                stroke={saved ? '#1268F3' : 'currentColor'}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.4}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom edge of image: Prep Time Pill */}
        {cafe.prepTimeMinutes && (
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-md">
              ⏱ {cafe.prepTimeMinutes} min prep
            </span>
          </div>
        )}
      </div>

      {/* Lower Section (42% of height): Navy Container with Scannable Details */}
      <div className="flex flex-col gap-2.5 pt-3 sm:pt-3.5 flex-1 justify-between">
        <div>
          {/* Café Name */}
          <h3 className="text-[18px] sm:text-[19px] font-black text-white tracking-tight leading-snug group-hover:text-[#99BBFF] transition-colors">
            {cafe.name}
          </h3>

          {/* Location & Distance */}
          <p className="text-[12px] sm:text-[12.5px] text-white/70 font-medium truncate mt-0.5">
            {locationText}
          </p>

          {/* Category / Metadata */}
          <p className="text-[11.5px] sm:text-[12px] text-[#99BBFF] font-semibold truncate mt-1">
            ★ {ratingText} · {categoryText}
          </p>
        </div>

        {/* View Menu CTA Action + Barcode */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[13px] sm:text-[13.5px] font-bold text-white group-hover:text-[#99BBFF] transition-colors">
              View menu
            </span>
            <span className="text-[14px] text-[#99BBFF] font-bold transition-transform duration-200 group-hover:translate-x-1.5">
              →
            </span>
          </div>

          <CardBarcode code={`PASS-${cafe.slug.toUpperCase().slice(0, 8)}-${100 + index}`} />
        </div>
      </div>
    </Link>
  );
}

export default function EditorialCafeRow({ title, cafes, seeAllHref = '/explore' }: EditorialCafeRowProps) {
  return (
    <section className="w-full flex flex-col gap-4">
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

      {/* Grid: 3 columns on Desktop, 2 on Tablet, 1 on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {cafes.slice(0, 3).map((cafe, i) => (
          <CafeCard key={cafe.slug || i} cafe={cafe} index={i} />
        ))}
      </div>
    </section>
  );
}
