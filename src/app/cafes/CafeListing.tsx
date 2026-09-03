'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';
import { MS } from '@/components/gb/kit';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 26 } 
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
};

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  countBadge?: (cafes: RealCafe[]) => number;
}

export default function CafeListing({ cafes }: { cafes: RealCafe[] }) {
  const [q, setQ] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [mapMode, setMapMode] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<number | null>(null);

  // Carousel ref for mobile map view
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const filters: FilterOption[] = [
    { id: 'all', label: 'ALL', icon: 'storefront' },
    { 
      id: 'open', 
      label: 'OPEN NOW', 
      icon: 'bolt',
      countBadge: (list) => list.filter(c => c.acceptingOrders !== false).length 
    },
    { 
      id: 'near', 
      label: 'NEAR ME', 
      icon: 'near_me',
      countBadge: (list) => list.filter(c => (c.distanceKm ?? 99) <= 1.0).length 
    },
    { id: 'specialty', label: 'SPECIALTY COFFEE', icon: 'local_cafe' },
    { id: 'bakery', label: 'BAKERY & BITES', icon: 'bakery_dining' },
    { 
      id: 'rated', 
      label: 'TOP RATED', 
      icon: 'star',
      countBadge: (list) => list.filter(c => (c.rating ?? 0) >= 4.8).length 
    },
  ];

  // Search & Filter Pipeline
  const filteredCafes = useMemo(() => {
    let result = [...cafes];
    const query = q.trim().toLowerCase();

    // 1. Text Query Matching
    if (query) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query) ||
        c.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    // 2. Category / Vibe Filter
    switch (activeFilter) {
      case 'open':
        result = result.filter(c => c.acceptingOrders !== false);
        break;
      case 'near':
        result = result.filter(c => (c.distanceKm ?? 99) <= 1.0);
        break;
      case 'specialty':
        result = result.filter(c => 
          c.tags?.some(t => t.toLowerCase().includes('specialty') || t.toLowerCase().includes('roastery'))
        );
        break;
      case 'bakery':
        result = result.filter(c => 
          c.tags?.some(t => t.toLowerCase().includes('bakery') || t.toLowerCase().includes('pastries') || t.toLowerCase().includes('bites'))
        );
        break;
      case 'top':
        result = result.filter(c => (c.rating ?? 0) >= 4.8);
        break;
    }

    // 3. Sorting
    if (sortBy === 'distance') {
      result.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [cafes, q, activeFilter, sortBy]);

  // Set default selected cafe for map
  useEffect(() => {
    if (filteredCafes.length > 0 && !selectedCafeId) {
      setSelectedCafeId(filteredCafes[0].id);
    }
  }, [filteredCafes, selectedCafeId]);

  // Scroll mobile carousel when selected pin changes
  const handlePinSelect = (id: number) => {
    setSelectedCafeId(id);
    if (mobileCarouselRef.current) {
      const cardEl = mobileCarouselRef.current.querySelector(`[data-card-id="${id}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const selectedCafe = useMemo(() => 
    filteredCafes.find(c => c.id === selectedCafeId) || filteredCafes[0],
    [filteredCafes, selectedCafeId]
  );

  return (
    <div className="flex flex-col w-full font-sans pb-16 sm:pb-24">
      
      {/* 1. EDITORIAL HEADER & BRAND VIBE */}
      <div className="relative flex flex-col items-center justify-center text-center mt-6 sm:mt-12 mb-8 sm:mb-12 px-4">
        
        {/* Decorative Floating Stickers */}
        <motion.div 
          className="absolute -left-2 sm:left-12 lg:left-[12%] -top-6 sm:top-0 block pointer-events-none select-none drop-shadow-xl z-20"
          initial={{ opacity: 0, rotate: -20, scale: 0.5, y: 20 }}
          animate={{ opacity: 0.95, rotate: -12, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.3 }}
        >
          <div className="w-[65px] h-[65px] sm:w-[160px] sm:h-[160px] relative">
            <Image src="/cafes/burger_sticker.png" alt="Burger" fill className="object-contain" unoptimized />
          </div>
        </motion.div>

        <motion.div 
          className="absolute -right-2 sm:right-12 lg:right-[12%] -top-2 sm:top-10 block pointer-events-none select-none drop-shadow-xl z-20"
          initial={{ opacity: 0, rotate: 20, scale: 0.5, y: -20 }}
          animate={{ opacity: 0.95, rotate: 15, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.4 }}
        >
          <div className="w-[60px] h-[60px] sm:w-[150px] sm:h-[150px] relative">
            <Image src="/cafes/pizza_sticker.png" alt="Pizza" fill className="object-contain" unoptimized />
          </div>
        </motion.div>

        {/* Hero Title */}
        <div className="relative inline-flex flex-col items-center z-30">
          <h1 
            className="text-[38px] sm:text-[76px] lg:text-[92px] font-black tracking-normal leading-[0.9] uppercase text-[#0F172A] drop-shadow-sm flex flex-wrap justify-center gap-x-2 sm:gap-x-4"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            <span>DISCOVER</span>
            <span className="text-[#0055D4]">CAFÉS</span>
          </h1>

          {/* Cursive Annotation placed cleanly below the title */}
          <motion.div 
            className="absolute -bottom-7 sm:-bottom-9 right-0 sm:right-2 text-[#0055D4] -rotate-[5deg] pointer-events-none select-none"
            style={{ fontFamily: 'var(--font-caveat)', fontSize: 'clamp(22px, 3.6vw, 30px)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            find your next cup
          </motion.div>
        </div>

        <p className="mt-10 sm:mt-12 text-[#64748B] text-[15px] sm:text-[17px] font-medium tracking-wide max-w-lg mx-auto">
          Skip the line. Pre-order fresh specialty coffee & food from campus favorites.
        </p>
      </div>

      {/* 2. SEARCH & LIVE SUGGESTIONS (MOBILE-FIRST) */}
      <div className="relative max-w-[680px] mx-auto w-full z-30 px-4 mb-6 sm:mb-8">
        <div className={`
          flex items-center gap-3 bg-white border 
          ${isSearchFocused 
            ? 'border-[#0055D4] shadow-[0_8px_30px_rgba(0,85,212,0.12)] ring-4 ring-[#0055D4]/10' 
            : 'border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)]'} 
          rounded-[20px] px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-300 ease-out relative
        `}>
          <MS name="search" size={22} color={isSearchFocused ? "#0055D4" : "#64748B"} />
          
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 220)}
            placeholder="Search cafes, coffee roasters, areas..."
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
            className="flex-1 border-none outline-none text-[15px] sm:text-[16.5px] bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] font-medium"
          />

          {q && (
            <button 
              onClick={() => setQ('')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <MS name="close" size={18} />
            </button>
          )}

          {/* Desktop Keyboard Shortcut Badge */}
          {!q && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
              <span>⌘</span><span>K</span>
            </div>
          )}

          {/* Quick Suggestion Dropdown */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                className="absolute top-[112%] left-0 w-full bg-white border border-black/[0.08] rounded-[20px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-4 sm:p-5 overflow-hidden z-50 backdrop-blur-xl"
              >
                {!q ? (
                  <div className="flex flex-col gap-4 text-left">
                    <div>
                      <div className="text-[10.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase mb-2">
                        Quick Tags
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['DTU Campus', 'North Campus', 'Specialty Roasters', 'Cold Brew', 'Bakery'].map(tag => (
                          <button
                            key={tag}
                            onMouseDown={() => setQ(tag)}
                            className="bg-[#F1F5F9] hover:bg-[#0055D4] hover:text-white text-[#334155] px-3 py-1 rounded-full text-[12.5px] font-medium transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-[10.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase mb-2">
                        Popular Near Campus
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cafes.slice(0, 4).map(c => (
                          <div 
                            key={c.id} 
                            onMouseDown={() => setQ(c.name)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-left"
                          >
                            <span className="text-[13.5px] font-bold text-[#0F172A] truncate">{c.name}</span>
                            <span className="text-[11.5px] text-[#64748B] font-semibold flex items-center gap-0.5">
                              {c.distanceKm} km
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-left py-1">
                    <div className="text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase mb-2">
                      Matching Results ({filteredCafes.length})
                    </div>
                    {filteredCafes.slice(0, 4).map(c => (
                      <div 
                        key={c.id} 
                        onMouseDown={() => setQ(c.name)}
                        className="py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-[14px] font-medium text-[#0F172A]">{c.name}</span>
                        <span className="text-[12px] text-[#0055D4] font-semibold">{c.address}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. HORIZONTAL FILTER RAIL (TOUCH-FRIENDLY & SCROLLABLE) */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Scrollable Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 w-full sm:w-auto scrollbar-none [&::-webkit-scrollbar]:hidden touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {filters.map(filter => {
              const isActive = activeFilter === filter.id;
              const badgeCount = filter.countBadge ? filter.countBadge(cafes) : null;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex-none inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-bold tracking-tight transition-all duration-200 border select-none active:scale-95 ${
                    isActive 
                      ? 'bg-[#0055D4] text-white border-[#0055D4] shadow-md shadow-[#0055D4]/20 scale-[1.02]' 
                      : 'bg-white/90 text-[#334155] border-black/[0.08] hover:border-black/[0.15] hover:bg-white'
                  }`}
                >
                  {filter.icon && (
                    <MS 
                      name={filter.icon} 
                      size={15} 
                      color={isActive ? "#ffffff" : "#64748B"} 
                    />
                  )}
                  <span>{filter.label}</span>
                  {badgeCount != null && badgeCount > 0 && (
                    <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Sort & Desktop Map Toggle Right */}
          <div className="hidden sm:flex items-center gap-3 flex-none ml-auto">
            {/* Sort Selector */}
            <div className="relative inline-flex items-center bg-white border border-black/[0.08] rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[#334155]">
              <MS name="sort" size={15} className="mr-1 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer pr-2 text-[#0F172A] font-bold"
              >
                <option value="distance">Nearest First</option>
                <option value="rating">Top Rated</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* Desktop Map Toggle */}
            <button 
              onClick={() => setMapMode(!mapMode)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12.5px] font-bold tracking-wide border transition-all duration-200 ${
                mapMode 
                  ? 'bg-[#0F172A] text-white border-[#0F172A]' 
                  : 'bg-white text-[#0055D4] border-[#0055D4]/30 hover:border-[#0055D4]'
              }`}
            >
              <MS name={mapMode ? "view_list" : "map"} size={16} />
              <span>{mapMode ? 'HIDE MAP' : 'VIEW MAP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RESULTS COUNT BAR */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between text-[11.5px] sm:text-[12px] font-bold tracking-widest text-[#0F172A] uppercase">
        <div className="flex items-center">
          {filteredCafes.length} CAFÉS AROUND DTU
          <span className="text-[#94A3B8] font-semibold ml-2 normal-case tracking-normal hidden sm:inline">· Updated just now</span>
          {activeFilter !== 'all' && <span className="text-[#0055D4] ml-2 hidden sm:inline">· Filter Active</span>}
        </div>
        
        {/* Mobile sort summary */}
        <div className="sm:hidden flex items-center gap-1 text-[#334155]">
          <span>Sorted by</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-bold text-[#0055D4] underline outline-none"
          >
            <option value="distance">distance</option>
            <option value="rating">rating</option>
            <option value="name">name</option>
          </select>
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA: DESKTOP SPLIT MAP OR STANDARD GRID */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Empty State */}
        {filteredCafes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 bg-white/60 rounded-[24px] border border-black/[0.06] text-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0055D4] flex items-center justify-center mb-3">
              <MS name="storefront" size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-1">No spots match your search</h3>
            <p className="text-slate-500 text-[14px] max-w-sm mb-4">
              Try adjusting your search query or reset your filters to see all available campus cafes.
            </p>
            <button 
              onClick={() => { setQ(''); setActiveFilter('all'); }}
              className="bg-[#0055D4] text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold hover:bg-[#0044ab] transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </motion.div>
        ) : (
          /* Responsive Layout */
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            
            {/* Cards Grid */}
            <motion.div 
              className={`w-full transition-all duration-500 ${mapMode ? 'lg:w-[58%]' : 'w-full'}`}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <div className={`grid gap-5 sm:gap-6 ${
                mapMode 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
              }`}>
                {filteredCafes.map(cafe => (
                  <motion.div 
                    key={cafe.id} 
                    variants={cardVariant} 
                    layout
                    onMouseEnter={() => setSelectedCafeId(cafe.id)}
                  >
                    <RealCafeCard 
                      cafe={cafe} 
                      coverHeight={mapMode ? 190 : 210} 
                      isSelected={selectedCafeId === cafe.id && mapMode}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* DESKTOP SPLIT MAP CONTAINER */}
            {mapMode && (
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                className="hidden lg:block w-[42%] sticky top-24 h-[calc(100vh-120px)] rounded-[24px] bg-[#EEF2F6] border border-black/[0.08] overflow-hidden shadow-lg relative"
              >
                {/* SVG Vector Campus Map Background */}
                <div className="absolute inset-0 bg-[#E2E8F0]/50 overflow-hidden pointer-events-none">
                  {/* Subtle Grid Roads */}
                  <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    {/* Simulated Major Highway & Campus Ring */}
                    <path d="M 0,150 Q 200,80 450,220 T 900,100" fill="none" stroke="#CBD5E1" strokeWidth="16" />
                    <path d="M 120,0 Q 240,300 200,600" fill="none" stroke="#CBD5E1" strokeWidth="12" />
                    <circle cx="280" cy="240" r="140" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="6 6" />
                  </svg>
                </div>

                {/* You are Here Pin */}
                <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-[#0055D4] border-2 border-white shadow-md relative">
                    <span className="animate-ping absolute inset-0 rounded-full bg-[#0055D4] opacity-50" />
                  </div>
                  <span className="text-[9.5px] font-extrabold bg-[#0F172A] text-white px-2 py-0.5 rounded-full mt-1 shadow-sm uppercase tracking-wider">
                    You
                  </span>
                </div>

                {/* Interactive Map Pins for each cafe */}
                {filteredCafes.map((cafe, index) => {
                  const isSelected = selectedCafeId === cafe.id;
                  // Dynamic relative positioning coordinates on map canvas
                  const topPos = 22 + ((index * 13) % 65);
                  const leftPos = 20 + ((index * 24) % 65);

                  return (
                    <motion.div
                      key={cafe.id}
                      onClick={() => setSelectedCafeId(cafe.id)}
                      className="absolute cursor-pointer z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                      animate={{ scale: isSelected ? 1.15 : 1 }}
                      whileHover={{ scale: 1.2 }}
                    >
                      <div className={`flex items-center justify-center rounded-full shadow-lg transition-all border ${
                        isSelected 
                          ? 'bg-[#0055D4] text-white border-white ring-4 ring-[#0055D4]/25 shadow-xl px-2.5 py-1.5 gap-1 z-50' 
                          : 'bg-[#0055D4] text-white border-white ring-2 ring-white/50 w-8 h-8 hover:scale-110 z-40 hover:z-50'
                      }`}>
                        {isSelected ? (
                          <>
                            <span className="text-amber-300 text-[11px]">⚡</span>
                            <span className="text-[11.5px] font-extrabold whitespace-nowrap tracking-wide">
                              {cafe.prepTimeMinutes ? cafe.prepTimeMinutes.toString().split('–')[0] + 'm' : '5m'}
                            </span>
                          </>
                        ) : (
                          <MS name="local_cafe" size={14} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Active Cafe Quick Preview Float at Map Bottom */}
                {selectedCafe && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-[18px] border border-black/[0.08] shadow-lg flex items-center justify-between z-30">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#0F172A]">{selectedCafe.name}</span>
                        {selectedCafe.rating && (
                          <span className="text-[11.5px] font-bold text-[#0055D4]">★ {selectedCafe.rating}</span>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-500">{selectedCafe.address} · {selectedCafe.distanceKm} km</span>
                    </div>
                    <a
                      href={`/${selectedCafe.slug}`}
                      className="bg-[#0055D4] hover:bg-[#0043ab] text-white px-3.5 py-1.5 rounded-full text-[12.5px] font-bold transition-colors shadow-sm"
                    >
                      Order →
                    </a>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        )}

      </div>

      {/* 6. MOBILE FULL-SCREEN MAP MODAL & SWIPEABLE CARD DOCK */}
      <AnimatePresence>
        {mapMode && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="lg:hidden fixed inset-0 z-50 bg-[#EEF2F6] flex flex-col pt-16"
          >
            {/* Header bar on mobile map */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-black/[0.08] flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMapMode(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95"
                  aria-label="Back to list"
                >
                  <MS name="arrow_back" size={20} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[13px] font-extrabold text-[#0F172A]">CAMPUS MAP</span>
                  <span className="text-[11px] text-slate-500">{filteredCafes.length} spots nearby</span>
                </div>
              </div>

              <button
                onClick={() => setMapMode(false)}
                className="bg-[#0F172A] text-white text-[12px] font-bold px-3.5 py-1.5 rounded-full active:scale-95 shadow-sm"
              >
                List View
              </button>
            </div>

            {/* Interactive Vector Canvas on Mobile */}
            <div className="flex-1 relative overflow-hidden bg-[#E2E8F0]/40">
              <svg className="w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mobile-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#94A3B8" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mobile-grid)" />
                <path d="M 0,200 Q 180,100 400,300" fill="none" stroke="#CBD5E1" strokeWidth="14" />
                <path d="M 150,0 Q 200,400 160,800" fill="none" stroke="#CBD5E1" strokeWidth="10" />
              </svg>

              {/* User location on mobile map */}
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="w-4 h-4 rounded-full bg-[#0055D4] border-2 border-white shadow-md relative">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#0055D4] opacity-60" />
                </div>
              </div>

              {/* Interactive Mobile Pins */}
              {filteredCafes.map((cafe, index) => {
                const isSelected = selectedCafeId === cafe.id;
                const topPos = 18 + ((index * 12) % 55);
                const leftPos = 15 + ((index * 26) % 65);

                return (
                  <div
                    key={cafe.id}
                    onClick={() => handlePinSelect(cafe.id)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all ${
                      isSelected ? 'scale-110 z-30' : 'scale-95'
                    }`}
                    style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                  >
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border transition-all ${
                      isSelected 
                        ? 'bg-[#0055D4] text-white border-white ring-4 ring-[#0055D4]/30' 
                        : 'bg-white text-[#0F172A] border-black/[0.08]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${cafe.acceptingOrders !== false ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
                      <span className="text-[11.5px] font-bold whitespace-nowrap">{cafe.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Docked Snap-Carousel of Café Cards on Mobile Map */}
            <div 
              ref={mobileCarouselRef}
              className="w-full bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent pb-6 pt-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-3 scrollbar-none z-30"
            >
              {filteredCafes.map(cafe => (
                <div
                  key={cafe.id}
                  data-card-id={cafe.id}
                  onClick={() => setSelectedCafeId(cafe.id)}
                  className="snap-center flex-none w-[82vw] max-w-[320px]"
                >
                  <RealCafeCard 
                    cafe={cafe} 
                    compact={true}
                    isSelected={selectedCafeId === cafe.id}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FLOATING BOTTOM ACTION PILL (MOBILE ONLY - THUMB ACCESSIBLE) */}
      {!mapMode && (
        <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setMapMode(true)}
            className="inline-flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[13px] font-extrabold tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10"
          >
            <MS name="map" size={17} color="#ffffff" />
            <span>VIEW MAP</span>
          </motion.button>
        </div>
      )}

    </div>
  );
}
