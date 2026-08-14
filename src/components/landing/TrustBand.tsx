// grabbit/src/components/landing/TrustBand.tsx
'use client';
import { MS } from '@/components/gb/kit';

import { motion } from 'framer-motion';

const PILLARS = [
  { icon: 'bolt', label: 'Skip the wait' },
  { icon: 'payments', label: 'Pay online, skip the queue' },
  { icon: 'chat', label: 'WhatsApp updates' },
  { icon: 'local_cafe', label: 'Freshly brewed' },
  { icon: 'verified', label: 'Verified Partners' },
];

export default function TrustBand() {
  // We duplicate the items so the marquee can scroll seamlessly
  const marqueeItems = [...PILLARS, ...PILLARS, ...PILLARS, ...PILLARS];

  return (
    <section className="relative overflow-hidden py-16 bg-[#FDFBF7] flex items-center justify-center -mt-8 mb-8 z-10">
      <div 
        className="w-[110%] bg-[#F09819] flex items-center shadow-lg border-y border-[#E09A00]"
        style={{ transform: 'rotate(-2deg)' }}
      >
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 40 }}
          className="flex items-center gap-12 py-3 px-6 shrink-0 w-max"
        >
          {marqueeItems.map((p, idx) => (
            <div key={`${p.label}-${idx}`} className="flex items-center gap-2 shrink-0">
              <MS name={p.icon} size={20} fill color="#FFFDF8" />
              <span className="text-[14px] font-bold text-[#FFFDF8] uppercase tracking-widest">{p.label}</span>
              <span className="text-[#FFFDF8] opacity-40 ml-10">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
