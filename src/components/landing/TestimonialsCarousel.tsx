'use client';
import { motion } from 'framer-motion';

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
    <section className="py-24 bg-[#FDFBF7] text-[#1A1311] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 mb-16 text-center">
        <span className="inline-flex items-center gap-2 bg-white border border-[#EBE4D8] shadow-sm text-[#1F1511] text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#F09819]" />
          Loved By Foodies
        </span>
        <h2 className="text-[36px] md:text-[48px] font-black tracking-tighter leading-none text-[#1A1311]">
          Over 10,000+ queues <br />
          <span className="text-[#8A7A6B] font-serif italic font-medium">skipped in Delhi.</span>
        </h2>
      </div>

      {/* Marquee Ticker Container */}
      <div className="relative w-full flex overflow-hidden py-4">
        <motion.div
          className="flex gap-6 shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
            <div
              key={idx}
              className="w-[320px] md:w-[380px] bg-white border border-[#EBE4D8] rounded-[24px] p-8 shadow-[0_12px_32px_rgba(26,19,17,0.03)] flex flex-col justify-between shrink-0 hover:shadow-[0_20px_48px_rgba(26,19,17,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <p className="text-[#1A1311] text-[16px] font-semibold leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between border-t border-[#EBE4D8] pt-4">
                <div>
                  <h4 className="font-bold text-[#1A1311] text-[14px]">{t.name}</h4>
                  <span className="text-[12px] font-semibold text-[#8A7A6B]">{t.role}</span>
                </div>
                <div className="bg-[#FDFBF7] border border-[#EBE4D8] px-3 py-1.5 rounded-full shadow-sm text-[11px] font-bold text-[#F09819]">
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
