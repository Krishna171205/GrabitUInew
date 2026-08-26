'use client';
import { motion } from 'framer-motion';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';
import { Star, CheckCircle2, Zap, Coffee, Clock } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Aarav Sharma',
    role: 'Software Engineer · CP',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&q=80',
    orderTag: 'Flat White @ Blue Tokai',
    saved: 'Saved 16 mins',
    quote: 'Grabbit transformed my morning rush. My flat white is sitting ready on the pickup counter right as I walk past the metro exit.',
    rating: 5,
  },
  {
    name: 'Priya Verma',
    role: 'Computer Eng. · DTU Campus',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    orderTag: 'Cold Brew & Croissant @ The Raydee Cafe',
    saved: 'Saved 20 mins',
    quote: 'No more standing in long canteen lines between back-to-back lectures. I pre-order from class and grab it within 30 seconds.',
    rating: 5,
  },
  {
    name: 'Rohan Gupta',
    role: 'Product Designer · Cyber Hub',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    orderTag: 'Sea Salt Mocha @ Third Wave',
    saved: 'Saved 14 mins',
    quote: 'The live preparation status is spot on. I never have to awkwardly hover around the barista counter waiting for my name to be called.',
    rating: 5,
  },
  {
    name: 'Ananya Iyer',
    role: 'MBA Student · Delhi University',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
    orderTag: 'Ginger Chai & Bun Maska @ Chai Point',
    saved: 'Saved 12 mins',
    quote: 'Direct counter pricing with zero predatory delivery markups. It’s like having VIP fast-track at all campus cafes.',
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-24 md:py-36 bg-[#F8FAFC] text-[#0F172A] overflow-hidden border-b-2 border-[#0F172A]/10 relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0055D4]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 mb-16 md:mb-20 text-center relative">
        <div className="absolute -top-10 left-[4%] md:left-[18%] rotate-[-8deg] z-10 pointer-events-none">
          <Annotation text="real campus voices" arrowDirection="down-right" delay={0.2} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#0F172A]/10 shadow-xs mb-4 text-[11px] font-black text-[#0055D4] uppercase tracking-wider">
          <Zap size={13} className="fill-[#0055D4]" />
          <span>10,000+ Campus Hours Saved</span>
        </div>

        <h2 className="text-[52px] sm:text-[70px] md:text-[88px] font-black tracking-[-0.03em] leading-[0.88] text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
          REAL STORIES <br />
          <span className="text-[#0055D4]">ZERO WAITING.</span>
        </h2>
      </div>

      {/* Marquee Ticker Container */}
      <div className="relative w-full flex overflow-hidden py-4">
        <motion.div
          className="flex gap-6 shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
        >
          {marqueeItems.map((t, idx) => (
            <div
              key={idx}
              className="w-[340px] sm:w-[380px] md:w-[420px] bg-white border-2 border-[#0F172A] rounded-[24px] p-6 sm:p-7 shadow-[6px_6px_0px_#0F172A] hover:shadow-[10px_10px_0px_#0055D4] flex flex-col justify-between shrink-0 hover:-translate-y-1.5 transition-all duration-300 group"
            >
              {/* Top Header: Order Tag & Time Saved */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 truncate">
                  <Coffee size={13} className="text-[#0055D4] flex-none" />
                  <span className="truncate">{t.orderTag}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full flex-none">
                  {t.saved}
                </span>
              </div>

              {/* Quote */}
              <p className="text-[#0F172A] text-[19px] sm:text-[21px] font-bold leading-snug mb-6" style={{ fontFamily: 'var(--font-caveat)' }}>
                "{t.quote}"
              </p>

              {/* Author Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#0F172A]/20 relative flex-none">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#0F172A] text-[14px] leading-tight flex items-center gap-1">
                      {t.name}
                      <CheckCircle2 size={12} className="text-[#0055D4]" />
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400">{t.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-[#F59E0B]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-[#F59E0B]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
