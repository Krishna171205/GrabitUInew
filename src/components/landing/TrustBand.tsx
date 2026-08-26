// grabbit/src/components/landing/TrustBand.tsx
'use client';
import { motion } from 'framer-motion';
import { Zap, SmartphoneNfc, MessageCircleHeart, Flame, BadgeCheck } from 'lucide-react';

const PILLARS = [
  { icon: Zap, label: 'Skip the wait' },
  { icon: SmartphoneNfc, label: 'Pay online, skip the queue' },
  { icon: MessageCircleHeart, label: 'WhatsApp updates' },
  { icon: Flame, label: 'Freshly brewed' },
  { icon: BadgeCheck, label: 'Verified Partners' },
];

export default function TrustBand() {
  // We duplicate the items so the marquee can scroll seamlessly
  const marqueeItems = [...PILLARS, ...PILLARS, ...PILLARS, ...PILLARS];

  return (
    <section className="relative overflow-hidden pt-28 pb-20 bg-[#F8FAFC] flex items-center justify-center z-10">
      <div 
        className="w-[110%] bg-[#0055D4] flex items-center shadow-[0_12px_40px_rgba(0,85,212,0.25)]"
        style={{ transform: 'rotate(-2.5deg)' }}
      >
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 40 }}
          className="flex items-center gap-16 py-4 md:py-5 px-8 shrink-0 w-max"
        >
          {marqueeItems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={`${p.label}-${idx}`} className="flex items-center gap-3.5 shrink-0 group">
                <Icon size={26} strokeWidth={2.5} className="text-[#FFEA00] -rotate-3 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                <span 
                  className="text-[18px] md:text-[24px] font-normal text-white uppercase tracking-[0.15em]"
                  style={{ fontFamily: 'var(--font-anton)' }}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
