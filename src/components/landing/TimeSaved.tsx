'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function TimeSaved() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  // Animate the widths of the bars based on scroll
  const grabbitWidth = useTransform(scrollYProgress, [0, 0.5], ['0%', '20%']);
  const traditionalWidth = useTransform(scrollYProgress, [0, 0.5], ['0%', '85%']);
  
  // Opacity for the payoff text
  const payoffOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const payoffY = useTransform(scrollYProgress, [0.4, 0.6], [20, 0]);

  return (
    <section ref={containerRef} className="py-32 bg-[#1A1311] text-[#FDFBF7] relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F09819]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-[42px] md:text-[64px] font-black tracking-tighter mb-6 leading-none">
            The math is <span className="text-[#F09819]">simple.</span>
          </h2>
          <p className="text-[18px] text-white/60 font-semibold max-w-lg mx-auto">
            Traditional queues waste your mornings. We bypass the queue entirely so you can get back your time.
          </p>
        </div>

        {/* Visual Timeline Comparison */}
        <div className="max-w-[900px] mx-auto space-y-12">
          
          {/* TRADITIONAL CAFE */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-[14px] font-bold text-white/50 tracking-widest uppercase">Without Grabbit</span>
              <span className="text-[20px] font-black text-white/50">17 MIN</span>
            </div>
            <div className="w-full h-12 bg-white/5 rounded-full p-1.5 overflow-hidden">
              <motion.div 
                style={{ width: traditionalWidth }}
                className="h-full bg-white/20 rounded-full relative flex items-center"
              >
                <div className="absolute right-4 text-[10px] font-bold tracking-widest text-white/60 uppercase">Waiting</div>
              </motion.div>
            </div>
          </div>

          {/* WITH GRABBIT */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-[14px] font-bold text-[#F09819] tracking-widest uppercase">With Grabbit</span>
              <span className="text-[20px] font-black text-[#F09819]">03 MIN</span>
            </div>
            <div className="w-full h-12 bg-[#F09819]/10 rounded-full p-1.5 overflow-hidden">
              <motion.div 
                style={{ width: grabbitWidth }}
                className="h-full bg-[#F09819] rounded-full shadow-[0_0_24px_rgba(240,152,25,0.4)] relative flex items-center"
              >
                <div className="absolute left-4 text-[10px] font-bold tracking-widest text-[#1A1311] uppercase">Pickup</div>
              </motion.div>
            </div>
          </div>

        </div>

        {/* PAYOFF METRIC */}
        <motion.div 
          style={{ opacity: payoffOpacity, y: payoffY }}
          className="mt-24 text-center"
        >
          <div className="text-[14px] font-bold text-[#F09819] tracking-widest uppercase mb-4">You just reclaimed</div>
          <div className="text-[86px] md:text-[140px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FDFBF7] to-white/40">
            14 MIN
          </div>
        </motion.div>

      </div>
    </section>
  );
}
