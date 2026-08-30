'use client';
import { useState, useMemo, useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import GrabbitCup3D from '@/components/cup3d/GrabbitCup3D';
import { FAQS, FAQ_CATEGORIES, type Faq, type FaqCategory } from './content';

type Filter = 'All' | FaqCategory;

/** Splits text on a query match so the matched run can be marked. */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[var(--gb-primary-pale)] text-[var(--gb-text-strong)] rounded-[3px] px-0.5">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

function matches(faq: Faq, q: string) {
  const hay = `${faq.q} ${faq.a} ${(faq.keywords ?? []).join(' ')}`.toLowerCase();
  // Every word must appear somewhere, so "cafe cost" finds the pricing answer
  // even though those two words are far apart in it.
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

function AccordionItem({
  faq,
  query,
  open,
  onToggle,
}: {
  faq: Faq;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
  const panelId = `faq-panel-${faq.id}`;
  const buttonId = `faq-button-${faq.id}`;

  return (
    <div
      id={faq.id}
      // Clears the 68px nav plus the ~110px sticky filter bar, so a deep-linked
      // answer lands below both instead of behind them.
      className="scroll-mt-[190px] rounded-2xl border border-[var(--gb-line-2)] bg-white transition-shadow duration-300 hover:shadow-[var(--gb-shadow-card)] data-[open=true]:shadow-[var(--gb-shadow-card)]"
      data-open={open}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gb-primary)] rounded-2xl cursor-pointer"
        >
          <span className="flex-1 text-[16px] sm:text-[17px] font-semibold leading-snug text-[var(--gb-text-strong)]">
            {highlight(faq.q, query)}
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-[var(--gb-primary-pale)] text-[var(--gb-primary)] transition-transform duration-300 data-[open=true]:rotate-180"
            data-open={open}
          >
            <MS name="expand_more" size={20} />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="m-0 px-5 pb-5 pr-12 text-[14.5px] leading-relaxed text-[var(--gb-muted)] sm:px-6 sm:pb-6">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqExplorer() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [openIds, setOpenIds] = useState<string[]>([]);
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => FAQS.filter((f) => (filter === 'All' || f.category === filter) && matches(f, query)),
    [query, filter],
  );

  // Deep link: /faq#cafe-cost opens that answer and scrolls to it. Support
  // conversations link straight at a single question, so landing on a collapsed
  // page with no indication of which one was meant is a dead end.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !FAQS.some((f) => f.id === id)) return;
    setOpenIds([id]);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }, []);

  // "/" focuses search, the convention people already expect from docs sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Reflect the newly opened answer in the URL so it can be copied and shared.
      if (!prev.includes(id)) history.replaceState(null, '', `#${id}`);
      return next;
    });
  };

  // When filtering, a flat list reads better than headed groups that mostly
  // contain one item each.
  const grouped = query.trim() === '' && filter === 'All';

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden border-b border-[var(--gb-line-2)] bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'var(--gb-primary)' }}
        />
        {/* max-w-3xl matches the search bar and the answer list below, so the
            headline, the search field and every card share one left edge. */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-5 pb-14 pt-16 text-center sm:pt-20 lg:flex-row lg:gap-6 lg:text-left">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gb-primary-pale)] px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[var(--gb-primary)]">
              Help centre
            </span>
            <h1 className="gb-serif mx-auto mt-5 max-w-[15ch] text-[clamp(34px,6vw,56px)] font-semibold leading-[1.05] tracking-tight text-[var(--gb-text-strong)] lg:mx-0">
              Questions, answered.
            </h1>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-[var(--gb-muted)] lg:mx-0">
              Everything about ordering ahead, paying, and picking up — plus what it takes
              to put your café on Grabbit.
            </p>
          </div>

          {/* Decorative, and hidden on phones: at 390px it pushed the search
              field below the fold, and search is the whole point of this page.
              Lazy-mounts only when it scrolls into view. */}
          <div className="hidden w-[190px] flex-none sm:block sm:w-[230px]" aria-hidden="true">
            <GrabbitCup3D variant="spot" interactive={false} />
          </div>
        </div>
      </section>

      {/* ---- Sticky search + filters ---- */}
      {/* top-[68px] parks this under the fixed LandingNav rather than sliding
          beneath it, which hid the search field on scroll. */}
      <div className="sticky top-[68px] z-30 border-b border-[var(--gb-line-2)] bg-[var(--gb-surface)]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <label htmlFor={searchId} className="sr-only">
            Search frequently asked questions
          </label>
          <div className="relative">
            <input
              id={searchId}
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — try “refund” or “UPI”"
              className="w-full rounded-xl border border-[var(--gb-line-4)] bg-white py-3 pl-11 pr-4 text-[15px] text-[var(--gb-text-strong)] outline-none transition-colors placeholder:text-[var(--gb-muted-2)] focus:border-[var(--gb-primary)] focus:ring-4 focus:ring-[var(--gb-primary-pale)]"
            />
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
              <MS name="search" size={20} color="var(--gb-icon)" />
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(['All', ...FAQ_CATEGORIES] as Filter[]).map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gb-primary)] ${
                    active
                      ? 'border-[var(--gb-primary)] bg-[var(--gb-primary)] text-white'
                      : 'border-[var(--gb-line-3)] bg-white text-[var(--gb-muted)] hover:border-[var(--gb-primary)] hover:text-[var(--gb-primary)]'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Results ---- */}
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-8">
        <p aria-live="polite" className="sr-only">
          {results.length} {results.length === 1 ? 'answer' : 'answers'} found
        </p>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--gb-line-3)] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--gb-primary-pale)]">
              <MS name="search_off" size={26} color="var(--gb-primary)" />
            </div>
            <p className="gb-serif m-0 text-[19px] font-semibold text-[var(--gb-text-strong)]">
              Nothing matches “{query}”
            </p>
            <p className="mx-auto mt-2 max-w-[38ch] text-[14px] leading-relaxed text-[var(--gb-muted)]">
              Try a different word, or ask us directly — we answer every message.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => { setQuery(''); setFilter('All'); }}
                className="rounded-xl border border-[var(--gb-line-3)] bg-white px-4 py-2.5 text-[14px] font-bold text-[var(--gb-text-strong)] cursor-pointer hover:border-[var(--gb-primary)]"
              >
                Clear search
              </button>
              <Link
                href="/contact"
                className="rounded-xl bg-[var(--gb-primary)] px-4 py-2.5 text-[14px] font-bold text-white hover:opacity-90"
              >
                Ask a question
              </Link>
            </div>
          </div>
        ) : grouped ? (
          FAQ_CATEGORIES.map((cat) => {
            const items = results.filter((f) => f.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat} className="mb-10 last:mb-0">
                <h2 className="mb-3 px-1 text-[11.5px] font-extrabold uppercase tracking-[0.09em] text-[var(--gb-faint)]">
                  {cat}
                </h2>
                <div className="grid gap-3">
                  {items.map((f) => (
                    <AccordionItem
                      key={f.id}
                      faq={f}
                      query={query}
                      open={openIds.includes(f.id)}
                      onToggle={() => toggle(f.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid gap-3">
            {results.map((f) => (
              <AccordionItem
                key={f.id}
                faq={f}
                query={query}
                open={openIds.includes(f.id)}
                onToggle={() => toggle(f.id)}
              />
            ))}
          </div>
        )}

        {/* ---- Still stuck ---- */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-[var(--gb-text-strong)] px-7 py-10 text-center sm:px-10">
          <h2 className="gb-serif m-0 text-[clamp(22px,3.4vw,28px)] font-semibold text-white">
            Still stuck?
          </h2>
          <p className="mx-auto mt-3 max-w-[42ch] text-[14.5px] leading-relaxed text-white/70">
            Message us and a human replies — usually within a few hours, always the same day.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-white px-5 py-3 text-[14.5px] font-bold text-[var(--gb-text-strong)] transition-transform hover:scale-[1.02]"
            >
              Contact support
            </Link>
            <Link
              href="/partner"
              className="rounded-xl border border-white/25 px-5 py-3 text-[14.5px] font-bold text-white transition-colors hover:bg-white/10"
            >
              List your café
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
