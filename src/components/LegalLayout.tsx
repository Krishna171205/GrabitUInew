import Link from 'next/link';
import { GrabbitLogo } from '@/components/ui/kit';

// Shared shell for public policy pages (Contact, Terms, Refunds, Privacy).
// Server component, no client hooks, so these pages are fully crawlable.
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-black/5 bg-surface/80 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-6 h-20 w-full max-w-4xl mx-auto">
          <Link href="/" aria-label="Grabbit home">
            <GrabbitLogo height={40} />
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-on-surface hover:opacity-70 transition-opacity"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-3">
          {title}
        </h1>
        {updated && (
          <p className="text-sm text-on-surface-variant mb-10">Last updated: {updated}</p>
        )}
        <div className="legal-prose text-on-surface-variant leading-relaxed">
          {children}
        </div>
      </main>

      <style>{`
        .legal-prose > * + * { margin-top: 1.1rem; }
        .legal-prose h2 {
          font-family: var(--font-headline, var(--font-inter), sans-serif);
          font-size: 1.4rem; font-weight: 700; line-height: 1.3;
          color: var(--color-on-surface, #1b1c1c);
          margin-top: 2.4rem; margin-bottom: 0.2rem;
        }
        .legal-prose h3 {
          font-weight: 700; font-size: 1.05rem;
          color: var(--color-on-surface, #1b1c1c);
          margin-top: 1.4rem;
        }
        .legal-prose ul { list-style: disc; padding-left: 1.3rem; }
        .legal-prose li { margin-top: 0.4rem; }
        .legal-prose a { color: var(--color-on-surface, #0F172A); font-weight: 700; text-decoration: underline; text-decoration-color: var(--color-primary, #0055D4); text-underline-offset: 2px; }
        .legal-prose a:hover { text-decoration-thickness: 2px; }
        .legal-prose strong { color: var(--color-on-surface, #1b1c1c); font-weight: 700; }
      `}</style>

      {/* Footer */}
      <footer className="w-full border-t border-black/5 py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant/60">
            © 2026 Unified Nexgrade Private Limited
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-on-surface-variant">
            <Link href="/contact" className="hover:text-on-surface transition-colors">Contact Us</Link>
            <Link href="/terms" className="hover:text-on-surface transition-colors">Terms &amp; Conditions</Link>
            <Link href="/refunds" className="hover:text-on-surface transition-colors">Refunds &amp; Cancellations</Link>
            <Link href="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
