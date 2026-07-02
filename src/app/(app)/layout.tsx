/**
 * Grabit consumer app shell. Applies the warm editorial theme (.gb-app)
 * and centers a mobile-width column on larger viewports.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
