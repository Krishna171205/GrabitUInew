'use client';
import { motion } from 'framer-motion';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';

const TESTIMONIALS = [
  {
    name: 'Aarav Sharma',
    role: 'Software Engineer @ CP',
    quote: 'Grabbit saved me 15 minutes every morning. My flat white is waiting on the counter right as I walk past.',
    rating: '5.0 ★',
  },
  {
    name: 'Priya Verma',
    role: 'Student @ DTU',
    quote: 'No more standing in long canteen lines between classes. I pre-order cold brew and grab it immediately.',
    rating: '5.0 ★',
  },
  {
    name: 'Rohan Gupta',
    role: 'Product Designer',
    quote: 'The notifications when my order is being prepared are super convenient.',
    rating: '5.0 ★',
  },
  {
    name: 'Ananya Iyer',
    role: 'Consultant @ Gurgaon',
    quote: 'Finally a slick app for Delhi cafes that actually respects my time. 10/10 experience!',
    rating: '5.0 ★',
  },
];

export default function TestimonialsCarousel() {
  return (
    <section className="py-24 md:py-32 bg-[#F8FAFC] text-[#0F172A] overflow-hidden border-b-2 border-[#0F172A]/10 relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0055D4]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 mb-20 md:mb-24 text-center relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-[20%] md:-translate-x-0 rotate-[-8deg] z-10">
          <Annotation text="don't just take our word" arrowDirection="down-right" delay={0.2} />
        </div>
        <Sticker text="10K+ SAVED" color="blue" rotation={12} className="absolute right-[10%] md:right-[20%] top-10" />

        <h2 className="text-[60px] md:text-[90px] font-black tracking-[-0.03em] leading-[0.85] text-[#0F172A] uppercase mt-8 md:mt-0" style={{ fontFamily: 'var(--font-anton)' }}>
          REAL STORIES <br />
          <span className="text-[#0055D4]">NO WAITING.</span>
        </h2>
      </div>

      {/* Marquee Ticker Container */}
      <div className="relative w-full flex overflow-hidden py-8">
        <motion.div
          className="flex gap-8 shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
            <div
              key={idx}
              className="w-[320px] md:w-[400px] bg-white border-2 border-[#0F172A] rounded-[16px] p-8 shadow-[8px_8px_0px_#0055D4] flex flex-col justify-between shrink-0 hover:-translate-y-2 hover:shadow-[12px_12px_0px_#0055D4] transition-all duration-300"
            >
              <p className="text-[#0F172A] text-[20px] font-bold leading-snug mb-8" style={{ fontFamily: 'var(--font-caveat)' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center justify-between border-t-2 border-[#0F172A]/10 pt-4 mt-auto">
                <div>
                  <h4 className="font-black text-[#0F172A] text-[16px] uppercase tracking-wide">{t.name}</h4>
                  <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest">{t.role}</span>
                </div>
                <div className="bg-[#0F172A] px-3 py-1.5 rounded shadow-[2px_2px_0px_#0055D4] text-[12px] font-bold text-white tracking-widest">
                  {t.rating}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
