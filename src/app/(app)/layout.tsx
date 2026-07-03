/**
 * Grabit consumer app shell. Applies the warm editorial theme (.gb-app).
 * Width is owned per-page via .gb-shell (narrow, always) or .gb-shell-wide
 * (expands on desktop) — see globals.css.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gb-app">
      <div style={{ minHeight: '100dvh', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
