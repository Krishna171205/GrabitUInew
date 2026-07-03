import { MS, TopBar, Eyebrow } from '@/components/gb/kit';
import { NOTIFICATIONS, type GbNotif } from '@/components/gb/data';

function Row({ n }: { n: GbNotif }) {
  return (
    <div style={{ display: 'flex', gap: 13, padding: '13px 18px', background: n.unread ? '#FCF3EC' : 'transparent' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <MS name={n.icon} size={22} fill color={n.iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
        <div style={{ fontSize: 11, color: 'var(--gb-faint-2)', fontWeight: 700, marginTop: 5 }}>{n.time}</div>
      </div>
      {n.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C1502E', flex: 'none', marginTop: 4 }} />}
    </div>
  );
}

export default function NotificationsPage() {
  const groups: GbNotif['group'][] = ['Today', 'Earlier'];
  return (
    <div className="gb-shell">
      <TopBar
        title="Notifications"
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-primary)' }}>Mark all read</span>}
      />
      {groups.map((g) => {
        const items = NOTIFICATIONS.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <div key={g}>
            <Eyebrow style={{ padding: '16px 20px 6px' }}>{g}</Eyebrow>
            {items.map((n) => <Row key={n.title} n={n} />)}
          </div>
        );
      })}
    </div>
  );
}
