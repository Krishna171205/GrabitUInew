'use client';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const STEP_1_ITEMS = [
  { name: 'Cold Brew', price: '₹220', tag: 'Popular' },
  { name: 'Flat White', price: '₹280', tag: 'Artisan' },
];

const STEP_2_OPTIONS = [
  { label: 'Milk Choice', value: 'Oat Milk (+₹30)' },
  { label: 'Espresso Roast', value: 'Dark Single-Origin' },
  { label: 'Sweetness', value: 'Zero Sugar' },
];

const STEPS = [
  {
    step: '01',
    title: 'Choose Your Spot',
    subtitle: 'Browse nearby campus cafes',
    desc: 'Instantly view live prep times, open counters, and curated menus across your campus before leaving your desk or classroom.',
    tag: 'Live ETA',
  },
  {
    step: '02',
    title: 'Customize in 10s',
    subtitle: 'Your drink, made your way',
    desc: 'Oat milk, extra shot, less sweet, or double ice. Customize with a tap and checkout securely via UPI in under 10 seconds.',
    tag: 'Bespoke',
  },
  {
    step: '03',
    title: 'Walk In & Grab',
    subtitle: 'Zero lines. Zero friction.',
    desc: 'Your drink is freshly brewed and labeled at the counter when you arrive. Flash your token, grab your order, and keep moving.',
    tag: 'Instant Pickup',
  }
];

const SPRING_CONFIG = {
  stiffness: 85,
  damping: 24,
  mass: 0.2,
  restDelta: 0.0005,
};

function HowItWorksHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);
  const opacity = useTransform(smoothProgress, [0.08, 0.32, 0.75, 0.95], [0, 1, 1, 0]);
  const y = useTransform(smoothProgress, [0.08, 0.32, 0.75, 0.95], [40, 0, 0, -30]);
  const scale = useTransform(smoothProgress, [0.08, 0.32, 0.75, 0.95], [0.94, 1, 1, 0.96]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, y, scale }}
      className="text-center max-w-3xl mx-auto mb-20 md:mb-28 relative transform-gpu"
    >
      <div className="absolute -top-10 left-[6%] md:left-[10%] rotate-[-8deg] pointer-events-none">
        <Annotation text="three simple steps" arrowDirection="down-right" delay={0.2} />
      </div>
      
      <h2 className="text-[54px] sm:text-[72px] md:text-[90px] font-black tracking-wider leading-[0.88] text-[#0F172A] uppercase drop-shadow-sm" style={{ fontFamily: 'var(--font-anton)' }}>
        HOW IT WORKS?
      </h2>
      <p className="text-slate-500 font-semibold text-base sm:text-lg max-w-lg mx-auto mt-4">
        Built for campus hustle. Fresh food & specialty coffee without wasting 20 minutes standing in line.
      </p>
    </motion.div>
  );
}

function Step1Row() {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);
  const opacity = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0, 1, 1, 0]);
  const leftX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [-60, 0, 0, -40]);
  const rightX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [60, 0, 0, 40]);
  const y = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [30, 0, 0, -20]);
  const scale = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0.94, 1, 1, 0.96]);

  return (
    <div ref={rowRef} className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 relative">
      <motion.div 
        style={{ opacity, x: leftX, y, scale }}
        className="w-full md:w-5/12 order-2 md:order-1 flex justify-center md:justify-end relative transform-gpu"
      >
        <Sticker text="CAMPUS RADAR" color="blue" rotation={-10} className="top-2 -left-4 z-30" />
        <div className="w-full max-w-[360px] bg-white rounded-[24px] p-5 shadow-[8px_8px_0px_#0F172A] border-[3px] border-[#0F172A] relative z-10 rotate-[1.5deg] hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="text-[16px] font-black text-[#0F172A] leading-tight">The Raydee Cafe</div>
              <div className="text-[11px] font-semibold text-slate-500">DTU Main Block · 150m away</div>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">
              Open
            </span>
          </div>

          <div className="space-y-2.5">
            {STEP_1_ITEMS.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-[13px] text-[#0F172A]">{it.name}</div>
                  <span className="text-[10px] font-extrabold text-[#0055D4] bg-[#0055D4]/10 px-1.5 py-0.5 rounded">
                    {it.tag}
                  </span>
                </div>
                <span className="font-black text-[13px] text-[#0F172A]">{it.price}</span>
              </div>
            ))}
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><Clock size={12} className="text-[#0055D4]" /> 5-8 min prep</span>
            <span className="text-[#0055D4] font-black">Tap to order →</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        style={{ opacity, x: rightX, y, scale }}
        className="w-full md:w-5/12 order-1 md:order-2 pl-0 md:pl-8 transform-gpu"
      >
        <span className="text-[64px] font-black text-[#0055D4]/20 leading-none block -mb-4 font-sans">01</span>
        <h3 className="text-[34px] sm:text-[44px] font-black leading-[0.92] mb-3 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
          {STEPS[0].title} <br />
          <span className="text-[#0055D4] text-[22px] font-medium" style={{ fontFamily: 'var(--font-caveat)' }}>{STEPS[0].subtitle}</span>
        </h3>
        <p className="text-slate-600 text-[15px] sm:text-[16px] font-semibold leading-relaxed border-l-4 border-[#0055D4] pl-4">
          {STEPS[0].desc}
        </p>
      </motion.div>
    </div>
  );
}

function Step2Row() {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);
  const opacity = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0, 1, 1, 0]);
  const leftX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [-60, 0, 0, -40]);
  const rightX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [60, 0, 0, 40]);
  const y = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [30, 0, 0, -20]);
  const scale = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0.94, 1, 1, 0.96]);

  return (
    <div ref={rowRef} className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 relative">
      <motion.div 
        style={{ opacity, x: leftX, y, scale }}
        className="w-full md:w-5/12 pr-0 md:pr-8 text-left md:text-right transform-gpu"
      >
        <span className="text-[64px] font-black text-[#0055D4]/20 leading-none block -mb-4 font-sans">02</span>
        <h3 className="text-[34px] sm:text-[44px] font-black leading-[0.92] mb-3 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
          {STEPS[1].title} <br />
          <span className="text-[#0055D4] text-[22px] font-medium" style={{ fontFamily: 'var(--font-caveat)' }}>{STEPS[1].subtitle}</span>
        </h3>
        <p className="text-slate-600 text-[15px] sm:text-[16px] font-semibold leading-relaxed border-l-4 md:border-l-0 md:border-r-4 border-[#0055D4] pl-4 md:pl-0 md:pr-4">
          {STEPS[1].desc}
        </p>
      </motion.div>

      <motion.div 
        style={{ opacity, x: rightX, y, scale }}
        className="w-full md:w-5/12 pl-0 md:pl-8 flex justify-center md:justify-start relative transform-gpu"
      >
        <Sticker text="ONE TAP UPI" color="cream" rotation={12} className="-bottom-3 -right-4 z-30" />
        <div className="w-full max-w-[360px] bg-white rounded-[24px] p-5 shadow-[8px_8px_0px_#0F172A] border-[3px] border-[#0F172A] relative z-10 rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="text-[17px] font-black text-[#0F172A]">Iced Americano</div>
              <div className="text-[11px] text-slate-500 font-bold">Double Espresso · Chilled</div>
            </div>
            <span className="text-[18px] font-black text-[#0F172A]">₹180</span>
          </div>

          <div className="space-y-2 mb-4">
            {STEP_2_OPTIONS.map((opt, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[12px]">
                <span className="text-slate-500 font-medium">{opt.label}</span>
                <span className="text-white font-bold bg-[#0055D4] px-2 py-0.5 rounded-md text-[11px]">{opt.value}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-[#0055D4] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#0040A1] transition-colors">
            <span>Pay ₹180 via UPI</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Step3Row() {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);
  const opacity = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0, 1, 1, 0]);
  const leftX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [-60, 0, 0, -40]);
  const rightX = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [60, 0, 0, 40]);
  const y = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [30, 0, 0, -20]);
  const scale = useTransform(smoothProgress, [0.06, 0.28, 0.72, 0.94], [0.94, 1, 1, 0.96]);

  return (
    <div ref={rowRef} className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 relative">
      <motion.div 
        style={{ opacity, x: leftX, y, scale }}
        className="w-full md:w-5/12 order-2 md:order-1 flex justify-center md:justify-end relative transform-gpu"
      >
        <Sticker text="ZERO LINE" color="navy" rotation={-6} className="-top-4 right-6 z-30" />
        <div className="w-full max-w-[360px] bg-white rounded-[24px] p-6 text-center shadow-[8px_8px_0px_#0F172A] border-[3px] border-[#0F172A] flex flex-col items-center justify-center text-[#0F172A] relative z-10 rotate-[1.5deg] hover:rotate-0 transition-transform duration-300">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 text-[#0055D4] border-2 border-[#0F172A] shadow-sm">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <div className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-0.5">Order Status</div>
          <div className="text-[32px] font-black leading-none mb-4 text-[#0F172A]" style={{ fontFamily: 'var(--font-anton)' }}>
            READY FOR PICKUP
          </div>
          
          <div className="bg-[#F8FAFC] text-[#0F172A] w-full py-3.5 px-4 rounded-2xl border-2 border-[#0F172A] shadow-inner flex items-center justify-between">
            <div className="text-left">
              <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Pickup Counter</div>
              <div className="text-[13px] font-black text-[#0F172A]">Main Block #2</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Token</div>
              <div className="text-[20px] font-black text-[#0055D4] leading-none">#GB-408</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        style={{ opacity, x: rightX, y, scale }}
        className="w-full md:w-5/12 order-1 md:order-2 pl-0 md:pl-8 transform-gpu"
      >
        <span className="text-[64px] font-black text-[#0055D4]/20 leading-none block -mb-4 font-sans">03</span>
        <h3 className="text-[34px] sm:text-[44px] font-black leading-[0.92] mb-3 text-[#0F172A] uppercase" style={{ fontFamily: 'var(--font-anton)' }}>
          {STEPS[2].title} <br />
          <span className="text-[#0055D4] text-[22px] font-medium" style={{ fontFamily: 'var(--font-caveat)' }}>{STEPS[2].subtitle}</span>
        </h3>
        <p className="text-slate-600 text-[15px] sm:text-[16px] font-semibold leading-relaxed border-l-4 border-[#0055D4] pl-4">
          {STEPS[2].desc}
        </p>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 85%']
  });

  const smoothBeamProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.15
  });

  const beamHeight = useTransform(smoothBeamProgress, [0, 1], ['0%', '100%']);
  const beamOpacity = useTransform(smoothBeamProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0.8]);

  return (
    <section id="how-it-works" ref={containerRef} className="relative py-24 md:py-32 bg-[#F8FAFC] text-[#0F172A] overflow-hidden border-b-2 border-[#0F172A]/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <HowItWorksHeader />

        {/* 3-Step Alternating Grid */}
        <div className="relative space-y-24 md:space-y-32">
          {/* Vertical Center Connector Line on Desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-[#0055D4]/25 -translate-x-1/2 overflow-hidden">
            {/* Active glowing electric laser beam */}
            <motion.div
              style={{ height: beamHeight, opacity: beamOpacity }}
              className="w-full bg-gradient-to-b from-[#0055D4] via-[#38BDF8] to-[#0055D4] shadow-[0_0_12px_#38BDF8]"
            />
          </div>

          {/* Tracer Sparkle that rides the beam */}
          <motion.div
            style={{ top: beamHeight, opacity: beamOpacity }}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0055D4] border-2 border-white shadow-[0_0_16px_4px_rgba(0,85,212,0.8)] items-center justify-center pointer-events-none z-20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </motion.div>

          <Step1Row />
          <Step2Row />
          <Step3Row />
        </div>
      </div>
    </section>
  );
}
