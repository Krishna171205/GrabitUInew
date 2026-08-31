'use client';

import { useEffect } from 'react';

const NEW_DOMAIN = 'https://letsgrabbit.com';
const REDIRECT_DELAY_MS = 4200;

export default function MovedPage() {
  useEffect(() => {
    // /moved is our own internal rewrite target, never a real page on the new
    // domain — only reachable here by testing it directly, so send that case home.
    const path = window.location.pathname === '/moved' ? '' : window.location.pathname;
    const target = NEW_DOMAIN + path + window.location.search;
    const timer = setTimeout(() => window.location.replace(target), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface">
      <div className="moved-reveal absolute inset-0 bg-primary" />
      <div className="moved-content relative z-10 flex flex-col items-center gap-3 px-6 text-center text-on-primary">
        <h1 className="font-display text-3xl font-bold">We&apos;ve moved!</h1>
        <p className="text-base">
          Grabit is now at <strong>letsgrabbit.com</strong>. Taking you there now&hellip;
        </p>
        <a href={NEW_DOMAIN} className="text-sm underline underline-offset-2 opacity-80">
          Click here if you&apos;re not redirected
        </a>
      </div>
      <style>{`
        .moved-reveal {
          clip-path: circle(0% at 50% 50%);
          animation: moved-iris-open 2.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }
        .moved-content {
          opacity: 0;
          transform: scale(0.96);
          animation: moved-content-in 0.7s cubic-bezier(0.23, 1, 0.32, 1) 1.7s forwards;
        }
        @keyframes moved-iris-open {
          to { clip-path: circle(105% at 50% 50%); }
        }
        @keyframes moved-content-in {
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .moved-reveal { animation: none; clip-path: none; }
          .moved-content { animation: moved-fade-only 0.3s ease forwards; transform: none; }
        }
        @keyframes moved-fade-only {
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
