"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
@keyframes ritual-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1;   }
}

@keyframes ritual-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes ritual-coffee {
  0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 4px rgba(255,107,0,0.4)); }
  15%, 45% { transform: scale(1.25); filter: drop-shadow(0 0 12px rgba(255,107,0,0.9)); }
  30%      { transform: scale(1);   }
}

.ritual-animate-breathe  { animation: ritual-breathe  8s ease-in-out infinite alternate; }
.ritual-animate-marquee  { animation: ritual-marquee  38s linear        infinite; }
.ritual-animate-coffee   { animation: ritual-coffee   2s  cubic-bezier(0.25,1,0.5,1) infinite; }

/* Amber-warm aurora */
.ritual-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 107, 0, 0.08) 0%,
    rgba(255, 150, 50, 0.05) 40%,
    transparent 70%
  );
}

/* Near-invisible warm grid */
.ritual-bg-grid {
  background-size: 56px 56px;
  background-image:
    linear-gradient(to right,  rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Ghost GRABIT behind everything */
.ritual-giant-bg {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,107,0,0.07);
  background: linear-gradient(180deg, rgba(255,107,0,0.09) 0%, transparent 55%);
  -webkit-background-clip: text;
  background-clip: text;
  user-select: none;
  pointer-events: none;
}

/* Amber-tinted warm glass pills */
.ritual-glass-pill {
  --pill-bg1:     rgba(255, 107, 0, 0.05);
  --pill-bg2:     rgba(255, 107, 0, 0.02);
  --pill-border:  rgba(255, 107, 0, 0.14);
  --pill-shadow:  rgba(255, 107, 0, 0.08);
  --pill-hi:      rgba(255, 255, 255, 0.8);
  background: linear-gradient(145deg, var(--pill-bg1) 0%, var(--pill-bg2) 100%);
  box-shadow:
    0 8px 28px -8px var(--pill-shadow),
    inset 0 1px 1px var(--pill-hi),
    inset 0 -1px 1px rgba(255,107,0,0.04);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.ritual-glass-pill:hover {
  --pill-bg1:    rgba(255, 107, 0, 0.1);
  --pill-bg2:    rgba(255, 107, 0, 0.04);
  --pill-border: rgba(255, 107, 0, 0.28);
  --pill-shadow: rgba(255, 107, 0, 0.18);
  --pill-hi:     rgba(255, 255, 255, 0.9);
  color: #1d1d1f;
}

/* Charcoal gradient heading */
.ritual-text-glow {
  background: linear-gradient(180deg, #1d1d1f 0%, rgba(29,29,31,0.45) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 24px rgba(255,107,0,0.12));
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON (GSAP spring pull)
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

      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, { x: x * 0.38, y: y * 0.38, rotationX: -y * 0.12, rotationY: x * 0.12, scale: 1.05, ease: "power2.out", duration: 0.38 });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1, 0.3)", duration: 1.2 });
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
// MARQUEE STRIP
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeItem() {
  return (
    <div className="flex items-center space-x-10 px-6 text-zinc-500">
      <span>Skip The Queue</span>      <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
      <span>Order Ahead</span>         <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
      <span>Pick Your Slot</span>      <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
      <span>Fresh Every Time</span>    <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
      <span>Your Daily Ritual</span>   <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
      <span>Zero Wait. All Craft.</span> <span style={{ color: "#ff6b00", opacity: 0.6 }}>✦</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ReadyToJoinRitual() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Ghost text parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "12vh", scale: 0.82, opacity: 0 },
        {
          y: "0vh", scale: 1, opacity: 1,
          ease: "power1.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 },
        }
      );

      // Heading + content stagger reveal
      gsap.fromTo(
        [headingRef.current, contentRef.current],
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        Curtain reveal wrapper:
        - Sits in normal flow, height = viewport
        - clip-path constrains visibility to its own bounding box
        - The inner footer is fixed, so it "peeks through" this cutout
      */}
      <div
        id="join-ritual"
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: "100vh", clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden"
          style={{ background: "#ffffff", color: "#1d1d1f", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Aurora glow */}
          <div
            className="ritual-aurora ritual-animate-breathe absolute pointer-events-none z-0"
            style={{ left: "50%", top: "50%", width: "80vw", height: "60vh", borderRadius: "50%", filter: "blur(80px)" }}
          />

          {/* Warm grid */}
          <div className="ritual-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Ghost GRABIT */}
          <div
            ref={giantTextRef}
            className="ritual-giant-bg absolute z-0 select-none"
            style={{ bottom: "-4vh", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
          >
            GRABIT
          </div>

          {/* ── Diagonal marquee strip ─────────────────────────────────────── */}
          <div
            className="absolute top-12 left-0 w-full overflow-hidden z-10 py-4 -rotate-2 scale-110 shadow-xl"
            style={{
              borderTop: "1px solid rgba(0,0,0,0.05)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              className="ritual-animate-marquee flex w-max text-xs font-bold tracking-[0.28em] uppercase"
            >
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* ── Center content ─────────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-4xl mx-auto">

            <h2
              ref={headingRef}
              className="ritual-text-glow text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-center mb-4"
              style={{ lineHeight: 1.05 }}
            >
              Ready to join<br />the ritual?
            </h2>

            <p
              className="text-center mb-10 text-sm md:text-base leading-relaxed"
              style={{ color: "rgba(29,29,31,0.5)", maxWidth: "480px" }}
            >
              Get exclusive offers from local cafes and be the first to know about new artisan partnerships.
            </p>

            <div ref={contentRef} className="flex flex-col items-center gap-5 w-full">

              {/* Phone form */}
              <form
                className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
                onSubmit={(e) => e.preventDefault()}
              >
                <div
                  className="flex-grow flex items-center rounded-full overflow-hidden"
                  style={{ height: "56px", background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <span
                    className="pl-5 pr-3 font-bold text-sm select-none flex items-center"
                    style={{
                      color: "rgba(29,29,31,0.45)",
                      borderRight: "1px solid rgba(0,0,0,0.08)",
                      height: "28px",
                    }}
                  >
                    +91
                  </span>
                  <input
                    className="flex-1 h-full px-4 bg-transparent text-sm focus:outline-none"
                    style={{ color: "#1d1d1f" }}
                    placeholder="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <MagneticButton
                  as="button"
                  type="submit"
                  className="ritual-glass-pill px-8 rounded-full font-bold text-sm whitespace-nowrap flex items-center justify-center"
                  style={{
                    height: "56px",
                    background: "#ff6b00",
                    border: "none",
                    color: "#fff",
                    boxShadow: "0 4px 24px rgba(255,107,0,0.35)",
                  }}
                >
                  Get Early Access
                </MagneticButton>
              </form>

              {/* Secondary pill links */}
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                <MagneticButton as="a" href="/privacy" className="ritual-glass-pill px-5 py-2.5 rounded-full text-xs font-semibold" style={{ color: "rgba(29,29,31,0.5)" }}>
                  Privacy
                </MagneticButton>
                <MagneticButton as="a" href="/terms" className="ritual-glass-pill px-5 py-2.5 rounded-full text-xs font-semibold" style={{ color: "rgba(29,29,31,0.5)" }}>
                  Terms
                </MagneticButton>
                <MagneticButton as="a" href="#cafe-search" onClick={(e: React.MouseEvent) => { e.preventDefault(); document.getElementById("cafe-search")?.scrollIntoView({ behavior: "smooth" }); }} className="ritual-glass-pill px-5 py-2.5 rounded-full text-xs font-semibold" style={{ color: "rgba(29,29,31,0.5)" }}>
                  Explore Cafes
                </MagneticButton>
              </div>

            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────────────────── */}
          <div
            className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {/* Copyright */}
            <p
              className="text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1"
              style={{ color: "rgba(29,29,31,0.35)" }}
            >
              © 2026 Grabit. All rights reserved.
            </p>

            {/* Crafted badge */}
            <div
              className="ritual-glass-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default"
            >
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(29,29,31,0.4)" }}>Crafted for the</span>
              <span className="ritual-animate-coffee text-sm md:text-base" style={{ display: "inline-block" }}>☕</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(29,29,31,0.4)" }}>Urban Alchemist</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="ritual-glass-pill w-11 h-11 rounded-full flex items-center justify-center group order-3"
              style={{ color: "rgba(29,29,31,0.45)" }}
            >
              <svg
                className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>

        </footer>
      </div>
    </>
  );
}
