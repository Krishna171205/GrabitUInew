'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import type { GrabitCafe } from '@/types/grabit';
import dynamic from 'next/dynamic';
import type { CafeEntry } from '@/components/CafeCircularGallery';

// Below-fold heavy components — deferred so they never block initial paint
const ContainerScroll = dynamic(
  () => import('@/components/ui/container-scroll-animation').then(m => ({ default: m.ContainerScroll })),
  { ssr: false, loading: () => <div style={{ height: '60rem' }} /> },
);
const TestimonialsSection = dynamic(
  () => import('@/components/ui/testimonials-columns').then((m) => ({ default: m.TestimonialsSection })),
  { ssr: false, loading: () => <div style={{ minHeight: 400 }} /> },
);
const ReadyToJoinRitual = dynamic(
  () => import('@/components/ReadyToJoinRitual').then((m) => ({ default: m.ReadyToJoinRitual })),
  // ssr: false — GSAP relies on window/document, cannot run on server
  { ssr: false, loading: () => <div style={{ height: '100vh' }} /> },
);

const CafeCircularGallery = dynamic(() => import('@/components/CafeCircularGallery'), {
  ssr: false,
  loading: () => <div style={{ height: 500 }} />,
});

interface Props {
  cafes: GrabitCafe[];
}

/* ── Inline SVG icons — stroke="currentColor" so they respond to text-* classes ── */
function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}
function CardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2.5" ry="2.5" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <line x1="5" y1="15" x2="9" y2="15" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

type IconFC = React.FC<{ className?: string }>;

const FEATURES: Array<{
  n: string;
  Icon: IconFC;
  title: string;
  body: string;
  wrapClass: string;
  iconBg: string;
  iconColor: string;
  titleClass: string;
  bodyClass: string;
}> = [
  {
    n: '01',
    Icon: TimerIcon,
    title: '20 Min Advance Order',
    body: 'Schedule your caffeine hit up to 20 minutes before you arrive. Timing is everything.',
    wrapClass: 'bg-surface-container hover:bg-primary-container',
    iconBg: 'bg-primary/10 group-hover:bg-white/25',
    iconColor: 'text-primary group-hover:text-white',
    titleClass: 'text-on-surface group-hover:text-white',
    bodyClass: 'text-on-surface-variant group-hover:text-white/80',
  },
  {
    n: '02',
    Icon: CardIcon,
    title: 'Pay Online',
    body: 'Secure, contactless payments via Apple Pay, Google Pay, or Credit Card. Zero friction.',
    wrapClass: 'bg-surface-container-lowest shadow-sm hover:shadow-2xl',
    iconBg: 'bg-primary',
    iconColor: 'text-white',
    titleClass: 'text-on-surface',
    bodyClass: 'text-on-surface-variant',
  },
  {
    n: '03',
    Icon: ChatIcon,
    title: 'WhatsApp Updates',
    body: 'Real-time status updates pushed directly to your favorite messaging app. No new app needed.',
    wrapClass: 'bg-surface-container hover:bg-zinc-900',
    iconBg: 'bg-zinc-200 group-hover:bg-white/10',
    iconColor: 'text-zinc-700 group-hover:text-white',
    titleClass: 'text-on-surface group-hover:text-white',
    bodyClass: 'text-on-surface-variant group-hover:text-white/80',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Select Your Craft',
    body: 'Choose from a curated list of top-rated local coffee artisans near you.',
  },
  {
    n: '2',
    title: 'Customize & Pay',
    body: 'Oat milk? Extra shot? Customize every detail and pay in a single tap.',
  },
  {
    n: '3',
    title: 'Grab & Go',
    body: 'Skip the line and pick up your fresh order from the designated Grabit station.',
  },
];

// Curated Unsplash images — warm cafe tones, high contrast against dark bg
const STEPS_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85',
    alt: 'Warm cafe interior',
    h: 'h-64',
  },
  {
    src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85',
    alt: 'Barista pouring latte art',
    h: 'h-80',
  },
  {
    src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=85',
    alt: 'Beautifully crafted espresso',
    h: 'h-80',
  },
  {
    src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=85',
    alt: 'Cozy cafe counter pickup',
    h: 'h-64',
  },
];

// Hardcoded city override for known cafes
const CITY_OVERRIDES: Record<string, string> = {
  'the raydee cafe': 'DTU, Delhi',
};

const COMING_SOON_CAFES = [
  { id: 'soon-1',  name: 'The Brew Collective',   location: 'Connaught Place, Delhi' },
  { id: 'soon-2',  name: 'Roasted & Co.',          location: 'Hauz Khas Village, Delhi' },
  { id: 'soon-3',  name: 'Black Baza Coffee',      location: 'Shahpur Jat, Delhi' },
  { id: 'soon-4',  name: 'The Quarter Cafe',        location: 'Khan Market, Delhi' },
  { id: 'soon-5',  name: 'Sip & Serif',            location: 'Lajpat Nagar, Delhi' },
  { id: 'soon-6',  name: 'Perch Wine & Coffee',    location: 'Khan Market, Delhi' },
  { id: 'soon-7',  name: 'Diggin Cafe',            location: 'Anand Lok, Delhi' },
  { id: 'soon-8',  name: 'The Smokehouse Room',    location: 'Vasant Kunj, Delhi' },
  { id: 'soon-9',  name: 'Fig & Maple',            location: 'Defence Colony, Delhi' },
  { id: 'soon-10', name: 'Kunzum Travel Cafe',     location: 'Hauz Khas, Delhi' },
  { id: 'soon-11', name: 'Cafe Lota',              location: 'Pragati Maidan, Delhi' },
  { id: 'soon-12', name: 'The Piano Man Jazz Club',location: 'Safdarjung, Delhi' },
];

const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.28, delayChildren: 0.05 } },
};
const heroLeftVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const heroItemVariants = {
  hidden: { opacity: 0, y: 72, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

export default function LandingClient({ cafes }: Props) {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();

  const filteredReal = cafes.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (CITY_OVERRIDES[c.name.toLowerCase()] ?? c.city ?? '').toLowerCase().includes(q),
  );

  const filteredSoon = COMING_SOON_CAFES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
  );

  const allItems: CafeEntry[] = [
    ...filteredReal.map((c) => ({
      type: 'live' as const,
      id: c.id,
      slug: c.slug,
      name: c.name,
      location: CITY_OVERRIDES[c.name.toLowerCase()] ?? c.city ?? '',
    })),
    ...filteredSoon.map((c) => ({ type: 'soon' as const, ...c })),
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const { scrollY } = useScroll();
  const [heroKey, setHeroKey] = useState(0);
  const hasScrolledDown = useRef(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y > 300) hasScrolledDown.current = true;
    if (y < 80 && hasScrolledDown.current) {
      hasScrolledDown.current = false;
      setHeroKey((k) => k + 1);
    }
  });

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">

      {/* ── Top App Bar ───────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm">
        <nav className="flex justify-between items-center px-6 h-20 w-full max-w-7xl mx-auto">
          <Image src="/grabit-logo.svg" alt="Grabit Logo" width={96} height={48} priority className="h-12 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <div className="hidden md:flex items-center gap-8 font-label text-sm tracking-widest uppercase">
            <a
              className="font-bold hover:opacity-80 transition-opacity duration-300 text-primary"
              onClick={(e) => { e.preventDefault(); scrollTo('cafe-search'); }}
              href="#"
            >
              Explore
            </a>
            <a
              className="text-zinc-600 hover:opacity-80 transition-opacity duration-300"
              onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}
              href="#"
            >
              How it works
            </a>
            <a
              className="text-zinc-600 hover:opacity-80 transition-opacity duration-300"
              onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}
              href="#"
            >
              Reviews
            </a>
            <a
              className="text-zinc-600 hover:opacity-80 transition-opacity duration-300"
              onClick={(e) => { e.preventDefault(); scrollTo('cafe-search'); }}
              href="#"
            >
              Order
            </a>
          </div>
          <Link
            href="/login"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg hover:bg-primary-dim"
            style={{ boxShadow: '0 4px 24px rgba(255,107,0,0.25)' }}
          >
            Login
          </Link>
        </nav>
      </header>

      <main className="pt-20">

        {/* ── Hero — Mobile: full-bleed image + gradient overlay ──────────── */}
        <section className="relative lg:hidden min-h-[88dvh] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=90"
              alt="Premium latte art in a ceramic cup"
              fill
              priority
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.82) 100%)',
              }}
            />
          </motion.div>
          <motion.div
            key={heroKey}
            className="absolute inset-x-0 bottom-0 px-6 pb-10"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } } }}
          >
            <motion.span
              variants={heroItemVariants}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-white"
              style={{ backgroundColor: '#FF6B00' }}
            >
              Freshly Brewed Convenience
            </motion.span>
            <motion.h1
              variants={heroItemVariants}
              className="text-4xl font-headline font-extrabold leading-[1.1] tracking-tighter mb-4 text-white"
            >
              Order Ahead.<br />
              <span style={{ color: '#ff8533' }}>Skip the Queue.</span>
            </motion.h1>
            <motion.p
              variants={heroItemVariants}
              className="text-white/80 text-base mb-8 leading-relaxed max-w-sm"
            >
              Connect to the city&apos;s finest baristas for a seamless pick-up experience.
            </motion.p>
            <motion.button
              variants={heroItemVariants}
              onClick={() => scrollTo('cafe-search')}
              className="w-full bg-primary text-white py-5 rounded-full font-bold text-lg transition-all duration-300 hover:bg-primary-dim"
              style={{ boxShadow: '0 20px 40px rgba(156,63,0,0.35)' }}
            >
              Find your cafe
            </motion.button>
          </motion.div>
        </section>

        {/* ── Hero — Desktop: side-by-side grid ────────────────────────────── */}
        <section className="relative hidden lg:flex min-h-[795px] items-center overflow-hidden px-6 lg:px-20">
          <motion.div
            key={heroKey}
            className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={heroLeftVariants}>
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 text-white"
                style={{ backgroundColor: '#FF6B00' }}
                variants={heroItemVariants}
              >
                Freshly Brewed Convenience
              </motion.span>
              <motion.h1
                className="text-5xl lg:text-[5rem] font-headline font-extrabold leading-[1.1] tracking-tighter mb-8 text-on-surface"
                variants={heroItemVariants}
              >
                Order Ahead.<br />
                <span className="text-primary italic">Skip the Queue.</span>
              </motion.h1>
              <motion.p
                className="text-on-surface-variant text-xl max-w-lg mb-10 leading-relaxed"
                variants={heroItemVariants}
              >
                Curate your morning ritual without the wait. Grabit connects you to the city&apos;s finest
                baristas for a seamless pick-up experience.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-4" variants={heroItemVariants}>
                <button
                  onClick={() => scrollTo('cafe-search')}
                  className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: '0 20px 40px rgba(156,63,0,0.2)' }}
                >
                  Find your cafe
                </button>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="px-10 py-5 rounded-full font-bold text-lg text-primary border border-primary/20 hover:bg-surface-container-low transition-all duration-300"
                >
                  How it works
                </button>
              </motion.div>
            </motion.div>

            <motion.div className="relative" variants={heroItemVariants}>
              <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3 scale-105">
                <Image
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=90"
                  alt="Premium latte art in a ceramic cup"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-8 -left-8 p-6 rounded-3xl shadow-2xl max-w-xs -rotate-2 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.5 }}
                whileHover={{
                  y: -8,
                  scale: 1.07,
                  rotate: 0,
                  boxShadow: '0 24px 48px rgba(255,107,0,0.28)',
                  transition: { type: 'spring', stiffness: 320, damping: 18 },
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                  >
                    <TimerIcon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-on-surface">Fresh in 5 mins</p>
                    <p className="text-sm text-on-surface-variant">Your order is being prepared.</p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low -z-10 rounded-l-[10rem] opacity-50" />
        </section>

        {/* ── Cafe Search ───────────────────────────────────────────────────── */}
        <section id="cafe-search" className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-headline font-bold mb-6 tracking-tight text-on-surface">
              Cafes near you
            </h2>
            <div className="relative max-w-md mx-auto mb-10">
              <input
                className="w-full h-14 pl-12 pr-14 rounded-full bg-surface-container-lowest border-none text-base font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search by neighborhood or cafe..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl select-none">🔍</span>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-full hover:scale-105 transition-transform text-base leading-none">
                📍
              </button>
            </div>

            {allItems.length === 0 && search ? (
              <p className="text-center text-on-surface-variant py-16">No cafes found.</p>
            ) : (
              <CafeCircularGallery items={allItems} />
            )}

            {!search && (
              <p className="mt-4 text-sm text-on-surface-variant">
                +{COMING_SOON_CAFES.length} more cafes coming to Delhi soon
              </p>
            )}
          </div>
        </section>

        {/* ── Features Bento Grid ───────────────────────────────────────────── */}
        <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.n}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.1 }}
                className={`group relative p-10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 ${feat.wrapClass}`}
              >
                {/* Watermark number */}
                <span className="absolute -right-4 -bottom-6 text-[8rem] font-extrabold text-on-surface/[0.05] select-none leading-none pointer-events-none">
                  {feat.n}
                </span>
                {/* Icon container */}
                <div
                  className={`w-[72px] h-[72px] mb-8 rounded-3xl flex items-center justify-center shadow-md transition-all duration-300 ${feat.iconBg}`}
                >
                  <feat.Icon className={`w-9 h-9 transition-colors duration-300 ${feat.iconColor}`} />
                </div>
                <h3 className={`text-2xl font-bold font-headline mb-4 transition-colors duration-300 ${feat.titleClass}`}>
                  {feat.title}
                </h3>
                <p className={`leading-relaxed transition-colors duration-300 ${feat.bodyClass}`}>
                  {feat.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Steps (Dark Section) ──────────────────────────────────────────── */}
        <section className="py-32 bg-zinc-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">

            <div className="relative">
              <motion.h2
                className="text-4xl lg:text-5xl font-headline font-extrabold mb-12 leading-tight"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              >
                From browse to<br />
                <span className="text-primary-container">pickup in minutes.</span>
              </motion.h2>
              <div className="space-y-12">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ x: -24, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.12 }}
                    className="flex gap-8 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl font-bold group-hover:bg-primary group-hover:border-transparent transition-all duration-300">
                      {step.n}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold font-headline mb-2">{step.title}</h4>
                      <p className="text-zinc-400 leading-relaxed">{step.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Image grid — desktop only */}
            <div className="relative hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                {STEPS_IMAGES.slice(0, 2).map((img) => (
                  <div key={img.src} className={`relative ${img.h} w-full rounded-3xl overflow-hidden shadow-2xl`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      loading="lazy"
                      className="object-cover rounded-3xl"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {STEPS_IMAGES.slice(2).map((img) => (
                  <div key={img.src} className={`relative ${img.h} w-full rounded-3xl overflow-hidden shadow-2xl`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      loading="lazy"
                      className="object-cover rounded-3xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── App Showcase (ContainerScroll) ───────────────────────────────── */}
        <section className="bg-surface-container-low overflow-hidden">
          <ContainerScroll
            titleComponent={
              <div className="mb-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-white" style={{ backgroundColor: '#FF6B00' }}>
                  The Experience
                </span>
                <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface leading-tight">
                  Order in seconds.<br />
                  <span className="text-primary italic">Pick up in minutes.</span>
                </h2>
              </div>
            }
          >
            {/* ── Grabit app UI mockup ── */}
            <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden font-body select-none">
              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-100">
                <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">grabit365.com</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">Open</span>
                </div>
              </div>
              {/* Cafe header */}
              <div className="relative h-28 md:h-40 overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=85" alt="Cafe" fill loading="lazy" className="object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-lg md:text-2xl font-bold leading-tight">The Raydee Cafe</p>
                  <p className="text-xs text-white/70">DTU, Delhi · 15 min prep · ⭐ 4.8</p>
                </div>
              </div>
              {/* Category tabs */}
              <div className="flex gap-1 px-4 py-2 border-b border-zinc-100 overflow-x-auto">
                {['Drinks', 'Food', 'Specials', 'Desserts'].map((tab, i) => (
                  <button
                    key={tab}
                    className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                    style={i === 0 ? { background: '#FF6B00', color: '#fff' } : { background: '#f4f4f5', color: '#52525b' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Menu items */}
              <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
                {[
                  { name: 'Cold Brew', desc: 'Smooth 12-hour steeped cold brew', price: '₹220', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80', hot: false },
                  { name: 'Flat White', desc: 'Double ristretto, silky microfoam', price: '₹280', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80', hot: true },
                  { name: 'Matcha Latte', desc: 'Ceremonial grade, oat milk', price: '₹320', img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80', hot: false },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.img} alt={item.name} fill loading="lazy" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-zinc-800 truncate">{item.name}</p>
                        {item.hot && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">HOT</span>}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{item.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-bold text-zinc-800">{item.price}</span>
                      <button className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: '#FF6B00' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bottom CTA */}
              <div className="px-4 py-3 border-t border-zinc-100">
                <button className="w-full py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #FF6B00, #ff8c00)' }}>
                  View Cart · ₹500 → Pick up @ 10:30 AM
                </button>
              </div>
            </div>
          </ContainerScroll>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <div className="-mt-40 md:-mt-72">
          <TestimonialsSection />
        </div>

        {/* ── Scroll-down hint before cinematic reveal ─────────────────────── */}
        <button
          className="flex flex-col items-center gap-0 py-20 w-full select-none cursor-pointer group"
          onClick={() => document.getElementById('join-ritual')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span
            className="text-xs uppercase font-light mb-6 transition-opacity duration-300 group-hover:opacity-60"
            style={{ color: 'rgba(0,0,0,0.22)', letterSpacing: '0.4em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Scroll down to join
          </span>
          <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.18), transparent)' }} />
        </button>

      </main>

      <ReadyToJoinRitual />

    </div>
  );
}
