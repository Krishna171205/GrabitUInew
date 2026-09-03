'use client';
/** Grabbit consumer app, presentational cards shared across Home & Explore. */
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MS } from './kit';
import { inr } from './format';
import { ph, type GbItem, type GbCategory } from './data';
import { fmtTime12, todayHours, type DayHours } from './format';
import { useFavoriteCafe } from './favorites';
import { directionsUrl, distanceLabel } from './maps';
import { getSavedCoords } from './location';
import { useCart } from '@/store/cart';

/** A real café from GET /api/grabit/cafes (honest fields only — no rating/distance/ETA). */
export interface RealCafe {
  id: number; name: string; slug: string;
  address?: string | null; city?: string | null;
  opening_time?: string | null; closing_time?: string | null;
  /** Brand mark on the assets CDN. Null for cafes that have not supplied one. */
  logo_url?: string | null;
  /** Storefront photo for the card cover. Null falls back to the branded placeholder. */
  cover_url?: string | null;
  /** Weekly schedule, Monday first. Shown to the customer; it does not decide open/closed. */
  hours?: DayHours[] | null;
  /** Server-fetched Omega store-status, so the card renders correct on first paint (no flash). */
  acceptingOrders?: boolean;
  /** Only set by the nearby-cafes search; absent everywhere else. */
  distanceKm?: number | null;
  /** The owner's pin from Omega. Null until they drop one. */
  latitude?: number | string | null;
  longitude?: number | string | null;
  /** Enhanced attributes for editorial discovery */
  tags?: string[];
  prepTimeMinutes?: number | string;
  rating?: number;
  reviewCount?: number;
}

/* ---------- Real café card (live data, honest signals only) ---------- */
export function RealCafeCard({
  cafe,
  cta = 'View menu',
  coverHeight = 220,
  compact = false,
  isSelected = false
}: {
  cafe: RealCafe;
  cta?: string;
  coverHeight?: number;
  compact?: boolean;
  isSelected?: boolean;
}) {
  const { favorite, toggle } = useFavoriteCafe(cafe);
  const [acceptingOrders, setAcceptingOrders] = useState(cafe.acceptingOrders !== false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  useEffect(() => {
    if (cafe.acceptingOrders !== undefined) return;
    fetch(`/api/proxy/grabit/cafes/${cafe.slug}/status`)
      .then(res => res.ok ? res.json() : null)
      .then(d => { if (d) setAcceptingOrders(d.acceptingOrders !== false); })
      .catch(() => {});
  }, [cafe.slug, cafe.acceptingOrders]);

  const open = acceptingOrders;
  const initial = cafe.name.trim().charAt(0).toUpperCase();
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { setMe(getSavedCoords()); }, []);
  
  const area = cafe.distanceKm != null
    ? `${cafe.distanceKm.toFixed(1)} km away`
    : distanceLabel(cafe, me) ?? cafe.city ?? cafe.address ?? null;

  const prepTime = cafe.prepTimeMinutes ? `${cafe.prepTimeMinutes} min prep` : open ? '5–8 min prep' : null;
  const tagsList = cafe.tags && cafe.tags.length > 0 ? cafe.tags : ['Coffee', 'Quick Bites'];

  return (
    <Link href={`/${cafe.slug}`} className="block transition-all duration-300 ease-out" style={{ textDecoration: 'none' }}>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white rounded-[20px] overflow-hidden border cursor-pointer transition-all duration-300 ease-out group ${
          isSelected ? 'ring-2 ring-[#0055D4] border-transparent shadow-lg' : 'border-black/[0.06]'
        }`}
        style={{ 
          textDecoration: 'none',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isHovered 
            ? '0 16px 36px -4px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(0, 85, 212, 0.06)' 
            : '0 2px 12px rgba(0,0,0,0.03)',
          borderColor: isHovered ? 'rgba(0, 85, 212, 0.2)' : isSelected ? '#0055D4' : 'rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ position: 'relative', height: compact ? 150 : coverHeight, overflow: 'hidden', background: '#F1F5F9' }}>
          {!imgError && cafe.cover_url ? (
            <div
              style={{ 
                width: '100%', height: '100%', position: 'relative',
                transform: isHovered ? 'scale(1.025)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Image 
                src={cafe.cover_url} 
                alt={cafe.name} 
                fill 
                sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 448px" 
                style={{ objectFit: 'cover' }} 
                unoptimized={true}
                onError={() => setImgError(true)} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20 pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#0055D4] flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-[#004bbd] transition-colors duration-500">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <MS name="local_cafe" size={48} className="text-white/90 mb-2 drop-shadow-md transform group-hover:scale-110 transition-transform duration-500" />
              <span className="text-white/90 font-extrabold tracking-widest text-[12px] uppercase z-10 px-4 text-center leading-tight drop-shadow-sm">{cafe.name}</span>
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
             {/* Status Badge */}
             <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                <span className={`w-2 h-2 rounded-full ${open ? 'bg-[#10B981] animate-pulse' : 'bg-[#94A3B8]'}`} />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#0F172A]">{open ? 'Open Now' : 'Closed'}</span>
             </div>

             {/* Action Buttons (Bookmark) */}
             <div className="flex items-center pointer-events-auto">
               <button 
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }} 
                 className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90 ${
                   favorite 
                     ? 'bg-[#0055D4] text-white scale-105' 
                     : 'bg-white/90 backdrop-blur-md hover:bg-white text-[#0F172A]'
                 }`}
                 aria-label={favorite ? 'Remove bookmark' : 'Bookmark'}
                 title={favorite ? 'Saved' : 'Save cafe'}
               >
                 <MS name={favorite ? "favorite" : "favorite_border"} size={18} fill={favorite} color={favorite ? '#ffffff' : '#0F172A'} />
               </button>
             </div>
          </div>

          {/* Prep time buffer floating badge at bottom left of cover */}
          {prepTime && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[10.5px] font-semibold tracking-tight shadow-sm">
              <span className="text-amber-400">⚡</span>
              <span>{prepTime}</span>
            </div>
          )}

          {/* Optional Rating badge at bottom right */}
          {cafe.rating && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[#0F172A] text-[11px] font-bold shadow-sm">
              <span className="text-[#0055D4]">★</span>
              <span>{cafe.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
           <div className="flex items-start justify-between gap-2">
             <h3 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] tracking-tight leading-snug group-hover:text-[#0055D4] transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
               {cafe.name}
             </h3>
           </div>
           
           {/* Location and Category Metadata */}
           <div className="flex flex-wrap items-center gap-2 text-[12.5px] sm:text-[13px] font-medium text-[#64748B]">
             {area && (
               <span className="inline-flex items-center gap-1 font-semibold text-[#0055D4]">
                 <MS name="near_me" size={13} />
                 {area}
               </span>
             )}
             {area && <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />}
             <span className="truncate">{tagsList.slice(0, 2).join(' · ')}</span>
           </div>

           {/* Interactive CTA Footnote */}
           <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748B]">
                {open ? 'Available for pickup' : 'Opens tomorrow'}
              </span>
              <div className="flex items-center text-[#0055D4] text-[13.5px] sm:text-[14px] font-bold transition-all">
                <span>{isHovered ? 'Order ahead' : 'View menu'}</span>
                <div
                  style={{ 
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="ml-1 flex items-center"
                >
                  <MS name="arrow_forward" size={16} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Café signed up, not live yet ---------- */
// A cafe that has confirmed it is joining but has not sent its menu. Deliberately not
// shaped like a live cafe card: a pill on an otherwise identical card read as a small
// difference between two orderable cafes. Here the photo sits far back behind a wash,
// "Coming soon" is the headline, and there is no cover/body split, no bookmark, no
// hours, no link, since there is nothing behind it to open yet. Delete its entry from
// COMING_SOON the day it goes live in the API.
export function ComingSoonCafeCard({ name, area, coverUrl, height = 210 }: { name: string; area?: string; coverUrl?: string; height?: number }) {
  return (
    <div
      aria-label={`${name}, coming soon`}
      style={{ position: 'relative', height, marginTop: 16, borderRadius: 'var(--gb-r-lg)', overflow: 'hidden', border: '1.5px dashed #E0C89F', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center' }}
    >
      {coverUrl && (
        <>
          <Image src={coverUrl} alt="" fill sizes="(max-width: 480px) 100vw, 448px" style={{ objectFit: 'cover', filter: 'grayscale(.12) saturate(1.05)' }} />
          {/* The photo is a promise, not a storefront anyone can walk into yet, so it sits
              behind a warm wash rather than competing with the live cafe card above it. */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,246,231,.86) 0%, rgba(255,236,209,.91) 100%)' }} />
        </>
      )}
      <div style={{ position: 'relative', padding: '0 22px', textAlign: 'center' }}>
        <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--gb-ink)', lineHeight: 1.05 }}>Coming soon</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '12px auto 11px', maxWidth: 210 }}>
          <span style={{ flex: 1, height: 1, background: '#DFC79E' }} />
          <MS name="local_cafe" size={17} color="var(--gb-primary)" />
          <span style={{ flex: 1, height: 1, background: '#DFC79E' }} />
        </div>
        <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, color: 'var(--gb-text)', lineHeight: 1.1 }}>{name}</div>
        {area && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, color: '#7A6E60', fontSize: 12.5, fontWeight: 700 }}>
            <MS name="near_me" size={14} />{area}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Popular / favourite item card (horizontal carousel) ---------- */
export function ItemCard({ item, heart }: { item: GbItem; heart?: boolean }) {
  const { addItem, items: cartItems } = useCart();
  const inCart = cartItems.some((i) => i.menu_item_id === item.id);

  function add() {
    addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: ph(item.photo) }, item.slug);
  }

  return (
    <div style={{ flex: 'none', width: 152, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-md)', overflow: 'hidden', boxShadow: 'var(--gb-elev-2)' }}>
      <div style={{ position: 'relative', height: 104 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph(item.photo)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {heart && (
          <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MS name="favorite" size={16} fill color="#C1502E" />
          </div>
        )}
      </div>
      <div style={{ padding: '10px 11px 12px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{item.cafe}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(item.price)}</span>
          <button
            onClick={add}
            aria-label="Add"
            style={{ width: 26, height: 26, borderRadius: 'var(--gb-r-xs)', border: '1.5px solid #E7DCCC', background: inCart ? 'var(--gb-primary)' : '#fff', color: inCart ? '#fff' : 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MS name={inCart ? 'check' : 'add'} size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Category circle (Browse by craving) ---------- */
export function CategoryCircle({ cat }: { cat: GbCategory }) {
  return (
    <Link href={`/raydee?craving=${encodeURIComponent(cat.query)}`} style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 72, textDecoration: 'none' }}>
      <div style={{ width: 66, height: 66, borderRadius: 'var(--gb-r-lg)', overflow: 'hidden', boxShadow: 'var(--gb-elev-1)', border: '1px solid #EFE7DB', position: 'relative' }}>
        <Image src={cat.photo} alt={cat.label} fill sizes="66px" style={{ objectFit: 'cover', borderRadius: 'var(--gb-r-lg)' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#4A4038', textAlign: 'center', lineHeight: 1.1 }}>{cat.label}</span>
    </Link>
  );
}
