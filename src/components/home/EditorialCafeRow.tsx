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

/** Stylized Minimal Barcode Graphic for the creative Pass Ticket identity */
function TicketBarcode({ code }: { code: string }) {
  const bars = [2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2];
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-end h-2.5 gap-[1.5px] opacity-75 overflow-hidden">
        {bars.map((w, i) => (
          <span
            key={i}
            className="bg-[#0055D4] inline-block rounded-xs"
            style={{
              width: `${w * 1.2}px`,
              height: i % 3 === 0 ? '100%' : i % 2 === 0 ? '70%' : '85%',
            }}
          />
        ))}
      </div>
      <span className="text-[7.5px] font-mono font-bold tracking-wider text-[#0055D4]/70 uppercase">
        {code}
      </span>
    </div>
  );
}

/** DESKTOP PASS TICKET CARD (≥ md): 3-column creative ticket in signature sky-blue palette */
function DesktopPassCafeCard({ cafe, index }: { cafe: CafeItem; index: number }) {
  const [saved, setSaved] = useState(false);

  const isOpen = cafe.acceptingOrders !== false;
  const ratingText = cafe.rating ? cafe.rating.toFixed(1) : '4.9';
  const locationText = cafe.address ? `${cafe.city || 'Delhi'} · ${cafe.address}` : `${cafe.city || 'Delhi'} · DTU Campus`;
  const distanceText = cafe.distanceKm ? `${cafe.distanceKm} km` : '0.4 km';
  const prepTime = cafe.prepTimeMinutes ? `${cafe.prepTimeMinutes} min` : '5–8 min';
  const ticketCode = `PASS-${cafe.slug.toUpperCase().slice(0, 6)}-${101 + index}`;

  return (
    <Link
      href={`/${cafe.slug}`}
      style={{
        background: 'linear-gradient(180deg, #D5E7FE 0%, #E6F0FD 52%, #EFF4FB 100%)',
      }}
      className="group relative flex flex-col justify-between rounded-[26px] p-3.5 shadow-[0_4px_20px_rgba(0,85,212,0.08)] hover:shadow-[0_14px_36px_rgba(0,85,212,0.18)] hover:-translate-y-1.5 border-2 border-[#BED8FE] hover:border-[#0055D4]/60 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Upper Section: Nested Cover Photo with Badges */}
      <div className="relative w-full aspect-[16/10] rounded-[18px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
        {cafe.cover_url ? (
          <Image
            src={cafe.cover_url}
            alt={cafe.name}
            fill
            sizes="(max-width: 1024px) 50vw, 420px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}

        {/* Top-Left: Status Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
            {isOpen ? 'Open now' : 'Closed'}
          </span>
        </div>

        {/* Top-Right: Directions & Bookmark Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const query = encodeURIComponent(`${cafe.name} ${cafe.address || 'DTU Delhi'}`);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
            className="w-7.5 h-7.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-[#0055D4] flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            aria-label="Get directions"
            title="Get directions"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved(!saved);
            }}
            className="w-7.5 h-7.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-[#0055D4] flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            aria-label="Save cafe"
            title={saved ? 'Saved' : 'Save cafe'}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={saved ? '#0055D4' : 'none'}
              stroke={saved ? '#0055D4' : 'currentColor'}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Bottom-Left: Rating Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10.5px] font-bold text-white flex items-center gap-1 shadow-xs border border-white/10">
          <span className="text-amber-400 text-xs">★</span>
          <span>{ratingText}</span>
        </div>
      </div>

      {/* Middle Section: Clean Café Info in Deep Slate */}
      <div className="flex flex-col pt-3 flex-1 gap-1">
        <h3 className="text-[19px] lg:text-[20px] font-black text-[#0F172A] tracking-tight leading-tight line-clamp-1 group-hover:text-[#0055D4] transition-colors">
          {cafe.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 font-semibold">
          <span className="truncate">{locationText}</span>
          <span className="text-slate-300">·</span>
          <span className="shrink-0 text-[#0055D4] font-bold">{distanceText}</span>
          <span className="text-slate-300">·</span>
          <span className="shrink-0 text-slate-500 font-medium">{prepTime}</span>
        </div>
      </div>

      {/* Lower Section: Perforation Line + Side Notches + Blue Barcode + Royal Blue CTA Button */}
      <div className="relative border-t border-dashed border-[#BED8FE] pt-2.5 mt-2.5 flex items-center justify-between">
        {/* Semi-circular Ticket Notches on the sides (exact alignment with perforation line) */}
        <span className="absolute -left-[23px] -top-[9px] w-4.5 h-4.5 rounded-full bg-[#F7F9FC] border border-[#BED8FE] shadow-inner pointer-events-none z-20" />
        <span className="absolute -right-[23px] -top-[9px] w-4.5 h-4.5 rounded-full bg-[#F7F9FC] border border-[#BED8FE] shadow-inner pointer-events-none z-20" />

        <TicketBarcode code={ticketCode} />

        <span className="bg-[#0055D4] text-white hover:bg-[#0040A1] active:scale-95 font-extrabold text-[12px] px-4 py-1.5 rounded-full shadow-[0_3px_10px_rgba(0,85,212,0.25)] inline-flex items-center gap-1 transition-all group-hover:translate-x-0.5">
          <span>Pre-order</span>
          <span className="text-xs">→</span>
        </span>
      </div>
    </Link>
  );
}

/** MOBILE PASS TICKET CARD (< md): Horizontal card matching mobile version in sky-blue */
function MobilePassCafeCard({ cafe, index }: { cafe: CafeItem; index: number }) {
  const [saved, setSaved] = useState(false);

  const isOpen = cafe.acceptingOrders !== false;
  const ratingText = cafe.rating ? cafe.rating.toFixed(1) : '4.9';
  const locationText = cafe.address || 'DTU Campus';
  const distanceText = cafe.distanceKm ? `${cafe.distanceKm} km` : '0.4 km';
  const prepTime = cafe.prepTimeMinutes ? `${cafe.prepTimeMinutes} min` : '5–8 min';
  const ticketCode = `PASS-${cafe.slug.toUpperCase().slice(0, 5)}-${101 + index}`;

  return (
    <Link
      href={`/${cafe.slug}`}
      style={{
        background: 'linear-gradient(180deg, #D5E7FE 0%, #E6F0FD 52%, #EFF4FB 100%)',
      }}
      className="group relative w-full rounded-[24px] p-3 shadow-[0_4px_16px_rgba(0,85,212,0.08)] border-2 border-[#BED8FE] flex items-stretch gap-3.5 transition-all active:scale-[0.99] cursor-pointer overflow-hidden"
    >
      {/* Left: Clean Café Photo (~42% width) */}
      <div className="relative w-[42%] min-h-[135px] rounded-[18px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
        {cafe.cover_url ? (
          <Image
            src={cafe.cover_url}
            alt={cafe.name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}

        {/* Minimal Floating Rating Badge */}
        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-xs border border-white/10">
          <span className="text-amber-400 text-xs">★</span>
          <span>{ratingText}</span>
        </div>

        {/* Subtle Status Pill */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Right: Minimalist Ticket Details (~58% width) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        {/* Top: Cafe Name + Bookmark */}
        <div className="flex items-start justify-between gap-1.5 w-full">
          <h3 className="text-[18px] font-black text-[#0F172A] tracking-tight leading-tight line-clamp-1 group-hover:text-[#0055D4] transition-colors flex-1 min-w-0">
            {cafe.name}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved(!saved);
            }}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#0F172A] hover:text-[#0055D4] shadow-xs active:scale-90 flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Save cafe"
          >
            <svg
              className="w-3.5 h-3.5"
              fill={saved ? '#0055D4' : 'none'}
              stroke={saved ? '#0055D4' : 'currentColor'}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Middle: Location & ETA */}
        <div className="my-auto py-0.5 flex flex-col gap-0.5">
          <p className="text-[12px] text-slate-600 font-semibold leading-snug line-clamp-1">
            {locationText}
          </p>
          <p className="text-[11.5px] text-[#0055D4] font-bold flex items-center gap-1.5">
            <span>{distanceText}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">{prepTime}</span>
          </p>
        </div>

        {/* Bottom: Barcode + Pre-order CTA */}
        <div className="border-t border-dashed border-[#BED8FE] pt-2 flex items-center justify-between">
          <TicketBarcode code={ticketCode} />

          <span className="bg-[#0055D4] text-white hover:bg-[#0040A1] font-extrabold text-[11.5px] px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(0,85,212,0.25)] inline-flex items-center gap-1 transition-all">
            <span>Pre-order</span>
            <span className="text-xs">→</span>
          </span>
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

      {/* MOBILE LIST (< md): Signature Blue Ticket Cards matching Mobile Version */}
      <div className="md:hidden flex flex-col gap-3.5 w-full">
        {cafes.slice(0, 3).map((cafe, i) => (
          <MobilePassCafeCard key={cafe.slug || i} cafe={cafe} index={i} />
        ))}
      </div>

      {/* DESKTOP GRID (≥ md): 3-column Creative Ticket Grid with Notches & Barcodes */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 w-full">
        {cafes.slice(0, 3).map((cafe, i) => (
          <DesktopPassCafeCard key={cafe.slug || i} cafe={cafe} index={i} />
        ))}
      </div>
    </section>
  );
}
