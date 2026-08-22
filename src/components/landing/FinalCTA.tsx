'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function FinalCTA() {
  return (
    <section className="py-28 bg-[#0F172A] text-[#F8FAFC] relative overflow-hidden text-center border-t border-white/10">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0055D4]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[800px] mx-auto px-6 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#F8FAFC] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#0055D4] animate-pulse" />
          Ready To Experience Grabbit?
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
        >
          Your coffee, <br />
          <span className="text-[#0055D4] italic font-medium">ready when you are.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#F8FAFC]/80 text-lg md:text-xl max-w-lg mx-auto mb-10"
        >
          Skip queues at Delhi’s finest cafés. Pre-order coffee & snacks on your terms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/home"
            className="group bg-[#0055D4] text-[#0F172A] text-base font-bold px-9 py-4 rounded-full transition-all hover:shadow-[0_12px_32px_rgba(255,177,0,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>Start ordering</span>
            <MS name="arrow_forward" size={18} />
          </Link>
          <Link
            href="/partner"
            className="bg-white/10 text-white border border-white/20 text-base font-semibold px-9 py-4 rounded-full transition-all hover:bg-white/20 hover:-translate-y-1 w-full sm:w-auto"
          >
            Partner with us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
