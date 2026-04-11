import Link from 'next/link';

export function BottomTabs({ slug, active }: { slug: string; active: 'queue' | 'menu' | 'slots' }) {
  const tabs = [
    { id: 'queue', label: 'Queue', icon: '⚡', href: `/${slug}/manage` },
    { id: 'menu',  label: 'Menu',  icon: '🍽', href: `/${slug}/manage/menu` },
    { id: 'slots', label: 'Slots', icon: '🕐', href: `/${slug}/manage/slots` },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--g-text)',
      borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0
    }}>
      {tabs.map(tab => (
        <Link key={tab.id} href={tab.href} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '3px', padding: '10px 4px',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', textDecoration: 'none',
          color: active === tab.id ? 'var(--g-amber)' : 'rgba(255,255,255,0.35)'
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
