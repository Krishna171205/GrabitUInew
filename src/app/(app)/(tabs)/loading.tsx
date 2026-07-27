/**
 * Shared skeleton for all four bottom-nav tabs. These routes are dynamic, so
 * without a loading boundary a tab tap shows the previous screen frozen until
 * the server responds. This turns that dead time into instant feedback.
 */
const SHIMMER = '#F3E8D4';

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gb-surface)' }} className="animate-pulse">
      {/* header */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ width: 132, height: 13, borderRadius: 6, background: SHIMMER }} />
        <div style={{ width: 196, height: 24, borderRadius: 8, background: SHIMMER, marginTop: 10 }} />
      </div>

      {/* search bar */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ height: 46, borderRadius: 30, background: SHIMMER }} />
      </div>

      {/* category row */}
      <div style={{ display: 'flex', gap: 14, padding: '20px 20px 0', overflow: 'hidden' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 66, height: 66, borderRadius: 20, background: SHIMMER }} />
            <div style={{ width: 44, height: 9, borderRadius: 5, background: SHIMMER }} />
          </div>
        ))}
      </div>

      {/* card list */}
      <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 96, borderRadius: 18, background: SHIMMER }} />
        ))}
      </div>
    </div>
  );
}
