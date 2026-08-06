import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import { ph } from '@/components/gb/data';

const PERKS = [
  { icon: 'bolt', title: 'Live in a day', body: 'Business details, KYC and menu, done in one sitting, no paperwork back-and-forth.' },
  { icon: 'payments', title: 'Get paid directly', body: 'Payouts go straight to your bank account, split automatically per order.' },
  { icon: 'storefront', title: 'Skip the queue, not the sale', body: 'Customers order ahead and pick up at the counter, no delivery fleet to manage.' },
];

export default function PartnerLandingPage() {
  return (
    <div className="gb-app">
      <div style={{ maxWidth: 560, margin: '0 auto', minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        <div style={{ position: 'relative', height: 280 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ph('photo-1521017432531-fbd92d768814', 900, 700)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,12,6,.35) 0%,rgba(20,12,6,.15) 40%,var(--gb-surface) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 26, right: 26, color: '#fff' }}>
            <div className="gb-serif" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>Partner with Grabbit</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6, color: 'rgba(255,255,255,.9)' }}>Bring your café online for order-ahead pickup.</div>
          </div>
        </div>

        <div style={{ padding: '8px 26px 0' }}>
          {PERKS.map((p) => (
            <div key={p.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--gb-line)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <MS name={p.icon} size={22} color="var(--gb-primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{p.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 26px 40px' }}>
          <Link
            href="/partner/signup"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--gb-primary)', color: '#fff', height: 56, borderRadius: 14, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)' }}
          >
            Get started<MS name="arrow_forward" size={20} />
          </Link>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 14 }}>
            Already onboarding? <Link href="/partner/signup" style={{ color: 'var(--gb-primary)', fontWeight: 700 }}>Continue where you left off</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
