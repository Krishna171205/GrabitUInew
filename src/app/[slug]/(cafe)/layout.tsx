export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--g-surface)' }}>
      {children}
    </div>
  );
}
