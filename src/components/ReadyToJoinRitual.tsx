"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — cream paper, espresso ink, one marigold accent. No photography:
// the closing section is a printed page, not a hero.
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
@keyframes ritual-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.45; }
  100% { transform: translate(-50%, -50%) scale(1.14); opacity: 0.9;  }
}

@keyframes ritual-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes ritual-coffee {
  0%, 100% { transform: scale(1);    }
  15%, 45% { transform: scale(1.18); }
  30%      { transform: scale(1);    }
}

.ritual-animate-breathe { animation: ritual-breathe 9s ease-in-out infinite alternate; }
.ritual-animate-marquee { animation: ritual-marquee 46s linear infinite; }
.ritual-animate-coffee  { animation: ritual-coffee 2.4s cubic-bezier(0.25,1,0.5,1) infinite; }

/* Marigold aurora — the only light source in the composition */
.ritual-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 177, 0, 0.16) 0%,
    rgba(255, 150, 50, 0.07) 42%,
    transparent 72%
  );
}

/* Paper tooth — barely-there warm grid, reads as texture not as lines */
.ritual-bg-grid {
  background-size: 64px 64px;
  background-image:
    linear-gradient(to right,  rgba(43,25,10,0.022) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(43,25,10,0.022) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 34%, black 72%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 34%, black 72%, transparent);
}

/* GRABBIT letterpressed into the paper — cream on cream, lit from above.
   Sits above the footer bars, which are taller on small screens. */
.ritual-giant-bg {
  position: absolute;
  bottom: 16vh;
  left: 50%;
  white-space: nowrap;
  font-size: 27vw;
  line-height: 0.72;
  font-weight: 800;
  letter-spacing: -0.055em;
  color: rgba(43, 25, 10, 0.07);
  text-shadow: 0 1.5px 0 rgba(255, 255, 255, 0.95);
  user-select: none;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 34%, black 74%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 34%, black 74%, transparent 100%);
}
@media (max-width: 640px) {
  .ritual-giant-bg { bottom: 30vh; font-size: 32vw; }
}

/* Signup: two stacked pills on phones, one nested capsule from sm up */
.ritual-signup {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 460px;
}
.ritual-signup-row {
  display: flex;
  align-items: center;
  min-width: 0;
  background: var(--gb-card);
  border: 1px solid var(--gb-line-3);
  border-radius: 999px;
  padding: 5px;
  box-shadow: 0 12px 30px -22px rgba(60,40,25,0.55);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.ritual-signup-cta {
  width: 100%;
  height: 52px;
  flex: none;
  border: none;
  border-radius: 999px;
  background: var(--gb-primary);
  color: var(--gb-on-primary);
  font-family: var(--gb-sans);
  font-size: 14.5px;
  font-weight: 800;
  white-space: nowrap;
}
.ritual-signup input { border: none; background: transparent; min-width: 0; flex: 1; }
.ritual-signup input::placeholder { color: var(--gb-muted-3); }
.ritual-signup input:focus { outline: none; }
.ritual-signup-row:focus-within {
  border-color: rgba(255, 177, 0, 0.75);
  box-shadow: 0 10px 30px -18px rgba(60,40,25,0.5), 0 0 0 4px rgba(255, 177, 0, 0.14);
}

@media (min-width: 640px) {
  .ritual-signup {
    flex-direction: row;
    align-items: center;
    gap: 0;
    background: var(--gb-card);
    border: 1px solid var(--gb-line-3);
    border-radius: 999px;
    padding: 5px;
    box-shadow: 0 12px 30px -22px rgba(60,40,25,0.55);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .ritual-signup:focus-within {
    border-color: rgba(255, 177, 0, 0.75);
    box-shadow: 0 10px 30px -18px rgba(60,40,25,0.5), 0 0 0 4px rgba(255, 177, 0, 0.14);
  }
  .ritual-signup-row { flex: 1; border: none; padding: 0; box-shadow: none; background: transparent; }
  .ritual-signup-row:focus-within { border: none; box-shadow: none; }
  .ritual-signup-cta { width: auto; height: 48px; padding: 0 24px; }
}

/* Quiet text links — hairline underline grows on hover, no chrome */
.ritual-link {
  position: relative;
  color: rgba(43, 25, 10, 0.62);
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.ritual-link::after {
  content: "";
  position: absolute;
  left: 0; bottom: -3px;
  width: 100%; height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.ritual-link:hover { color: var(--gb-text-strong); }
.ritual-link:hover::after { transform: scaleX(1); transform-origin: left; }
.ritual-link:focus-visible { outline: 2px solid var(--gb-gold); outline-offset: 4px; border-radius: 2px; }

.ritual-top-btn {
  transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
}
.ritual-top-btn:hover { border-color: var(--gb-text-strong); color: var(--gb-text-strong); }
.ritual-top-btn:focus-visible { outline: 2px solid var(--gb-gold); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .ritual-animate-breathe,
  .ritual-animate-marquee,
  .ritual-animate-coffee { animation: none; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON (GSAP spring pull) — reserved for the two real actions
// ─────────────────────────────────────────────────────────────────────────────
type MagneticProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticProps>(
  ({ className, children, as: Tag = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = localRef.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, { x: x * 0.22, y: y * 0.22, scale: 1.03, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, scale: 1, ease: "elastic.out(1, 0.35)", duration: 1 });
        };
        el.addEventListener("mousemove", onMove as EventListener);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove as EventListener);
          el.removeEventListener("mouseleave", onLeave);
        };
      }, el);

      return () => ctx.revert();
    }, []);

    return (
      <Tag
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={`cursor-pointer ${className ?? ""}`}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE STRIP — flat hairline band, no rotation, no glass
// ─────────────────────────────────────────────────────────────────────────────
const MARQUEE_WORDS = [
  "Skip the queue",
  "Order ahead",
  "Pick your slot",
  "Fresh every time",
  "Your daily ritual",
  "Zero wait, all craft",
];

function MarqueeItem() {
  return (
    <div className="flex items-center" aria-hidden="true">
      {MARQUEE_WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-6">{w}</span>
          <span style={{ color: "var(--gb-gold)", opacity: 0.55 }}>✦</span>
        </span>
      ))}
    </div>
  );
}

const FOOTER_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
  { href: "/privacy", label: "Privacy" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ReadyToJoinRitual() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Everything is visible by default; the scroll trigger only adds a one-shot
      // rise-in. A gated reveal here once left the CTA + policy links hidden.
      gsap.from(giantTextRef.current, {
        yPercent: 10, opacity: 0,
        duration: 0.9, ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: wrapperRef.current, start: "top 88%", toggleActions: "play none none none", once: true },
      });

      gsap.from([headingRef.current, contentRef.current], {
        y: 34, opacity: 0,
        duration: 0.75, stagger: 0.12, ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: wrapperRef.current, start: "top 90%", toggleActions: "play none none none", once: true },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        Curtain reveal wrapper: sits in normal flow at viewport height, clip-path
        constrains visibility to its own box, and the fixed footer peeks through.
      */}
      <div
        id="join-ritual"
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: "100vh", clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden"
          style={{ background: "var(--gb-surface)", color: "var(--gb-text-strong)", fontFamily: "var(--gb-sans)" }}
        >
          {/* Marigold aurora */}
          <div
            className="ritual-aurora ritual-animate-breathe absolute pointer-events-none z-0"
            style={{ left: "50%", top: "52%", width: "78vw", height: "56vh", borderRadius: "50%", filter: "blur(90px)" }}
          />

          {/* Paper tooth */}
          <div className="ritual-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* GRABBIT, letterpressed */}
          <div
            ref={giantTextRef}
            className="ritual-giant-bg z-0 select-none"
            style={{ transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            GRABBIT
          </div>

          {/* ── Center content ─────────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 w-full max-w-3xl mx-auto text-center">
            <h2
              ref={headingRef}
              className="gb-serif"
              style={{
                fontSize: "clamp(38px, 7vw, 76px)",
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "var(--gb-text-strong)",
              }}
            >
              Ready to join
              <br />
              <span style={{ fontStyle: "italic", color: "var(--gb-gold)" }}>the ritual?</span>
            </h2>

            <p
              style={{
                color: "var(--gb-muted)",
                fontSize: 16,
                lineHeight: 1.55,
                maxWidth: 430,
                margin: "20px 0 0",
              }}
            >
              Exclusive offers from cafés near you, and first word on new artisan partnerships.
            </p>

            <div ref={contentRef} className="flex flex-col items-center w-full" style={{ marginTop: 34 }}>
              {/* One nested capsule on desktop, two stacked pills on phones. */}
              <form className="ritual-signup" onSubmit={(e) => e.preventDefault()}>
                <div className="ritual-signup-row">
                  <span
                    className="select-none"
                    style={{ padding: "0 12px 0 18px", fontSize: 14, fontWeight: 700, color: "var(--gb-muted)" }}
                  >
                    +91
                  </span>
                  <span style={{ width: 1, height: 22, background: "var(--gb-line-3)", flex: "none" }} />
                  <input
                    style={{ padding: "0 14px", height: 48, fontSize: 15, fontWeight: 500, color: "var(--gb-text)", fontFamily: "var(--gb-sans)" }}
                    placeholder="Mobile number"
                    aria-label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <MagneticButton as="button" type="submit" className="ritual-signup-cta">
                  Get early access
                </MagneticButton>
              </form>

              <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--gb-muted-2)", fontWeight: 500 }}>
                No spam. Only the good stuff, once in a while.
              </p>
            </div>
          </div>

          {/* ── Marquee band, sitting on the masthead like a printed rule ──── */}
          <div className="relative z-20 w-full mt-auto">
            <div
              className="w-full overflow-hidden"
              style={{
                borderTop: "1px solid var(--gb-line-2)",
                padding: "12px 0",
                background: "rgba(255,248,236,0.86)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div
                className="ritual-animate-marquee flex w-max uppercase"
                style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.3em", color: "var(--gb-faint)" }}
              >
                <MarqueeItem />
                <MarqueeItem />
              </div>
            </div>

            {/* ── Masthead bar ─────────────────────────────────────────────── */}
            <div
              className="w-full"
              style={{ borderTop: "1px solid var(--gb-line-2)", background: "rgba(255,248,236,0.86)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            >
            <div
              className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 lg:flex-row lg:justify-between lg:gap-8"
              style={{ paddingTop: 20, paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
            >
              {/* Policy links — quiet type, not five glass pills */}
              <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 order-1" style={{ fontSize: 13, fontWeight: 600 }}>
                {FOOTER_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className="ritual-link">
                    {l.label}
                  </a>
                ))}
                <a
                  href="#cafe-search"
                  className="ritual-link"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("cafe-search")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore cafés
                </a>
              </nav>

              <div className="flex items-center gap-5 order-2">
                <span
                  className="hidden sm:inline uppercase"
                  style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em", color: "var(--gb-faint-2)" }}
                >
                  Crafted for the{" "}
                  <span className="ritual-animate-coffee" style={{ display: "inline-block" }}>
                    ☕
                  </span>{" "}
                  urban alchemist
                </span>
                <MagneticButton
                  as="button"
                  onClick={scrollToTop}
                  aria-label="Back to top"
                  className="ritual-top-btn flex items-center justify-center"
                  style={{
                    width: 38, height: 38, borderRadius: 999,
                    border: "1px solid var(--gb-line-3)",
                    background: "var(--gb-card)",
                    color: "var(--gb-muted)",
                    flex: "none",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </MagneticButton>
              </div>

              <p
                className="uppercase order-3 lg:order-none text-center lg:whitespace-nowrap"
                style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", color: "var(--gb-faint-2)" }}
              >
                © 2026 Unified Nexgrade Private Limited · Delhi NCR
              </p>
            </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
