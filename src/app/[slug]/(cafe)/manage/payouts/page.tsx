'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StaffChrome, Icon } from '@/components/ui/kit';

interface Payout {
  utr: string | null;
  amount: number;
  status: string;
  settled_at: string | null;
}

const inr = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function settledOn(iso: string | null) {
  if (!iso) return 'Date pending';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Cashfree settlement states, in words an owner can act on. */
function tone(status: string): { label: string; color: string; bg: string } {
  const s = status.toUpperCase();
  if (s.includes('SUCCESS') || s === 'PAID') return { label: 'Paid', color: '#1B7F4C', bg: 'rgba(27,127,76,.1)' };
  if (s.includes('FAIL') || s.includes('REVERS')) return { label: 'Failed', color: '#B3261E', bg: 'rgba(179,38,30,.1)' };
  return { label: 'On the way', color: '#8A5A00', bg: 'rgba(138,90,0,.1)' };
}

export default function PayoutsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await fetch('/api/proxy/grabit/auth/me');
      if (me.status === 401) { router.push(`/${slug}/manage/login`); return; }

      const res = await fetch('/api/proxy/grabit/vendor/settlements');
      // Payout data is owner-only. Say so plainly rather than showing an empty table.
      if (res.status === 403) { setForbidden(true); setPayouts([]); return; }
      setPayouts(res.ok ? await res.json() : []);
    }
    load().catch(() => setPayouts([]));
  }, [router, slug]);

  const total = (payouts ?? [])
    .filter((p) => tone(p.status).label === 'Paid')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <StaffChrome slug={slug} active="payouts" title="Payouts">
      <div style={{ maxWidth: 720, display: 'grid', gap: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.55 }}>
          Money Cashfree has sent to your bank account. Each payout covers the orders settled
          that day and carries a UTR you can match against your bank statement.
        </p>

        {forbidden && (
          <div style={{ padding: 16, borderRadius: 'var(--r-md)', background: 'var(--surface-variant)', fontSize: 14, fontWeight: 600 }}>
            Only the cafe owner can see payout details. Ask them to sign in if you need this.
          </div>
        )}

        {!forbidden && payouts !== null && payouts.length > 0 && (
          <div style={{ padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--primary-tint)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Paid out so far
            </div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{inr(total)}</div>
          </div>
        )}

        {!forbidden && payouts !== null && payouts.length === 0 && (
          <div style={{ padding: '28px 20px', borderRadius: 'var(--r-md)', background: 'var(--surface-variant)', textAlign: 'center' }}>
            <Icon.receipt size={26} />
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>No payouts yet</div>
            <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.5 }}>
              Your first payout arrives one working day after your first online order.
              Orders paid at the counter are not settled here, since that money never leaves your till.
            </div>
          </div>
        )}

        {(payouts ?? []).map((p, i) => {
          const t = tone(p.status);
          return (
            <div
              key={p.utr ?? i}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderRadius: 'var(--r-md)', background: 'var(--surface)', border: '1px solid var(--outline-variant)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tabular" style={{ fontSize: 17, fontWeight: 800 }}>{inr(Number(p.amount ?? 0))}</div>
                <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: 3 }}>
                  {settledOn(p.settled_at)}
                </div>
                {p.utr && (
                  <div className="tabular" style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 3, wordBreak: 'break-all' }}>
                    UTR {p.utr}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 11.5, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase',
                color: t.color, background: t.bg, padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap',
              }}>
                {t.label}
              </span>
            </div>
          );
        })}

        {payouts !== null && payouts.length > 0 && (
          <p style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
            A payout can take a few hours to appear on your statement after it shows as paid here,
            depending on your bank. If a UTR is missing from your account after a working day,
            send it to us and we will chase it.
          </p>
        )}
      </div>
    </StaffChrome>
  );
}
