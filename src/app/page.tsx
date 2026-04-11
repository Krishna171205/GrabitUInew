import Link from 'next/link';

async function getCafes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function RootPage() {
  const cafes = await getCafes();
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--g-white)' }}>
      {/* Nav */}
      <nav style={{
        height: '52px', display: 'flex', alignItems: 'center', padding: '0 20px',
        borderBottom: '1px solid var(--g-border)',
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <img src="/grabit-logo.svg" alt="Grabit" style={{ height: '28px' }} />
      </nav>

      {/* Hero */}
      <div style={{ padding: '28px 20px 20px' }}>
        <p style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.13em',
          textTransform: 'uppercase', color: 'var(--g-amber)', marginBottom: '8px'
        }}>Near You</p>
        <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.06 }}>
          Pick your cafe
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--g-muted)', marginTop: '4px' }}>
          Order ahead, skip the queue.
        </p>
      </div>

      {/* Cafe list */}
      <div>
        {cafes.map((cafe: { id: number; name: string; slug: string; address: string | null; city: string | null }) => (
          <Link key={cafe.id} href={`/${cafe.slug}`} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px 20px', borderBottom: '1px solid var(--g-border)',
            textDecoration: 'none', color: 'inherit'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'var(--g-amber-tint)', border: '1px solid rgba(255,107,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', flexShrink: 0
            }}>☕</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>{cafe.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginTop: '2px' }}>
                {cafe.address ?? cafe.city ?? 'India'}
              </p>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 8px',
              borderRadius: '980px', background: '#e3f9e5', color: '#1a7f37'
            }}>Open</span>
          </Link>
        ))}

        {cafes.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--g-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>☕</p>
            <p style={{ fontSize: '15px', fontWeight: 600 }}>No cafes available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
