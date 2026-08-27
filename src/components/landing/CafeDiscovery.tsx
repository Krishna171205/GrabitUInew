'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ArrowRight, Sparkles, Flame, Coffee, Utensils } from 'lucide-react';
import Link from 'next/link';

interface Cafe {
  id: string;
  name: string;
  category: 'trending' | 'specialty' | 'bites' | 'bakery';
  location: string;
  distance: string;
  prepTime: string;
  rating: string;
  reviews: string;
  tag: string;
  popularItems: string;
  image: string;
  discount?: string;
}

const CAFES: Cafe[] = [
  {
    id: 'c1',
    name: 'The Raydee Cafe',
    category: 'trending',
    location: 'DTU Main Campus, Rohini',
    distance: '150m',
    prepTime: '5–8 min',
    rating: '4.9',
    reviews: '1.4k',
    tag: 'Campus Hotspot',
    popularItems: 'Cold Brew · Almond Croissant · Avocado Toast',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=85',
    discount: '15% off on first order'
  },
  {
    id: 'c2',
    name: 'Blue Tokai Coffee',
    category: 'specialty',
    location: 'Inner Circle, Connaught Place',
    distance: 'Direct Pickup',
    prepTime: '6–9 min',
    rating: '4.9',
    reviews: '2.8k',
    tag: 'Specialty Roastery',
    popularItems: 'Pour Over · Flat White · Banana Walnut Cake',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=85',
    discount: 'Free cookie on ₹300+'
  },
  {
    id: 'c3',
    name: 'Third Wave Coffee',
    category: 'specialty',
    location: 'Cyber Hub, Gurugram',
    distance: 'Counter #1',
    prepTime: '7–10 min',
    rating: '4.8',
    reviews: '1.9k',
    tag: 'Artisan Espresso',
    popularItems: 'Sea Salt Mocha · Bagels · Sourdough Melts',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=85',
  },
  {
    id: 'c4',
    name: 'DTU Nescafe Kiosk',
    category: 'trending',
    location: 'Mechanical Block, DTU',
    distance: '80m',
    prepTime: '3–5 min',
    rating: '4.8',
    reviews: '3.1k',
    tag: 'Speed Champion',
    popularItems: 'Classic Frappe · Maggi Bowls · Cheese Toast',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=85',
    discount: 'Flat ₹20 off'
  },
  {
    id: 'c5',
    name: 'Chai Point Express',
    category: 'bites',
    location: 'North Campus Hub, Delhi',
    distance: '200m',
    prepTime: '4–6 min',
    rating: '4.7',
    reviews: '980',
    tag: 'All-Day Refresh',
    popularItems: 'Ginger Chai · Bun Maska · Poha Box',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&q=85',
  },
  {
    id: 'c6',
    name: 'Crumbs & Crust Bakery',
    category: 'bakery',
    location: 'Rohini Sector 14, Delhi',
    distance: '350m',
    prepTime: '5–8 min',
    rating: '4.9',
    reviews: '740',
    tag: 'French Bakes',
    popularItems: 'Pain au Chocolat · Scones · Cinnamon Rolls',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=85',
  }
];

export default function CafeDiscovery() {
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'specialty' | 'bites' | 'bakery'>('all');

  const filteredCafes = activeTab === 'all' 
    ? CAFES 
    : CAFES.filter(c => c.category === activeTab);

  return (
    <section className="py-28 md:py-36 bg-white text-[#0F172A] relative overflow-hidden border-b-2 border-[#0F172A]/10">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0055D4]/10 border border-[#0055D4]/20 mb-4 text-[11px] font-black text-[#0055D4] uppercase tracking-wider">
              <Flame size={14} className="text-[#0055D4] fill-[#0055D4]" />
              <span>Zomato-Speed Discovery</span>
            </div>
            
            <h2 className="text-[44px] sm:text-[56px] md:text-[64px] font-black tracking-[-0.03em] text-[#0F172A] leading-[0.92] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
              TOP CAFES LIVE ON <span className="text-[#0055D4]">GRABBIT.</span>
            </h2>
            <p className="text-slate-500 font-semibold text-base sm:text-lg mt-3">
              Skip lines at Delhi NCR’s best campus coffee counters. Pre-order, walk in, and grab your order fresh.
            </p>
          </div>

          <Link 
            href="/home"
            className="group inline-flex items-center gap-2 bg-[#F8FAFC] border-2 border-[#0F172A] text-[#0F172A] px-6 py-3 rounded-full font-bold text-[13px] hover:bg-[#0055D4] hover:text-white hover:border-[#0055D4] transition-all shadow-[4px_4px_0px_#0F172A] shrink-0"
          >
            <span>Explore All 50+ Spots</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Tabs (Zomato / Swish Clean Style) */}
        <div className="flex items-center gap-2 pb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Cafes', icon: Sparkles },
            { id: 'trending', label: '🔥 Campus Hotspots', icon: Flame },
            { id: 'specialty', label: '☕ Specialty Coffee', icon: Coffee },
            { id: 'bites', label: '🥪 Quick Bites', icon: Utensils },
            { id: 'bakery', label: '🥐 Fresh Bakery', icon: Coffee },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-[13px] font-black tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-md scale-105'
                    : 'bg-[#F1F5F9] text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cafes Grid / Mobile Carousel */}
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {filteredCafes.map((cafe, index) => (
            <motion.div
              key={cafe.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group flex-none w-[85vw] max-w-[320px] md:w-auto md:max-w-none snap-center md:snap-align-none bg-white rounded-[26px] border-2 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] hover:shadow-[10px_10px_0px_#0055D4] overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Cover Image Banner */}
              <div className="relative h-[210px] w-full overflow-hidden">
                <img 
                  src={cafe.image} 
                  alt={cafe.name} 
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent pointer-events-none" />
                
                {/* Rating Badge */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-[#0F172A] text-[12px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#0F172A]/10">
                  <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{cafe.rating}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({cafe.reviews})</span>
                </div>

                {/* Open Status & Prep Time */}
                <div className="absolute top-3.5 right-3.5 bg-[#10B981] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>OPEN</span>
                </div>

                {/* Cafe Title & Tag */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white z-10">
                  <span className="text-[10px] font-extrabold tracking-wider text-[#60A5FA] uppercase block mb-0.5">
                    {cafe.tag}
                  </span>
                  <h3 className="text-[22px] font-black leading-tight tracking-tight drop-shadow-sm">
                    {cafe.name}
                  </h3>
                </div>
              </div>

              {/* Details & Popular Items */}
              <div className="p-5 flex flex-col grow">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-[#0055D4] flex-none" />
                    <span className="truncate">{cafe.location}</span>
                  </div>
                  <span className="font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-md flex-none ml-2">
                    {cafe.distance}
                  </span>
                </div>

                {/* Popular items note */}
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 line-clamp-1 font-medium">
                  <span className="font-bold text-[#0F172A]">Must Try: </span>
                  {cafe.popularItems}
                </div>

                {/* Bottom Order Bar */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0055D4]/10 flex items-center justify-center text-[#0055D4]">
                      <Clock size={15} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 tracking-wider uppercase leading-none">Ready In</div>
                      <div className="text-[14px] font-black text-[#0F172A] mt-0.5">{cafe.prepTime}</div>
                    </div>
                  </div>

                  <Link
                    href="/home"
                    className="inline-flex items-center gap-1.5 bg-[#0F172A] group-hover:bg-[#0055D4] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Order Ahead</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
