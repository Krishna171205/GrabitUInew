'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MS } from '@/components/gb/kit';
import { StreakRulesSheet, MILESTONE_REWARDS } from '@/components/gb/StreakRulesSheet';
import type { StreakView, StreakWeekCell } from '@/types/grabbit';

/**
 * The weekly order streak, as a cafe stamp card.
 *
 * The metaphor is the paper card a counter punches: espresso stock against the cream
 * page, a serif numeral, and the weeks as stamps on a rail that visibly breaks where a
 * week was missed. It is the object the product is already about, which is why it reads
 * as ours rather than as a dashboard tile.
 *
 * Two rules carried over from the products that do streaks well:
 *
 * - Never a bare number. The same "0" was being used for "not yet this week" and "your
 *   run is over"; a customer reading the first as the second concludes the app is broken.
 *   Every state names itself and, where there is something to do, carries the action.
 * - Show the forgiveness. A frozen week is stamped in frost rather than hidden, so the
 *   save is legible after the fact.
 *
 * The ring is milestone progress, which turns a sentence into the shape of the card.
 */

const INK = '#0F172A';
const CREAM = '#F1F5F9';
const MARIGOLD = '#0055D4';
const FROST = '#9EC9EE';
const MUTED = '#94A3B8';

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function Stamp({ cell }: { cell: StreakWeekCell }) {
  const base: React.CSSProperties = {
    position: 'relative', zIndex: 1, flex: 1, aspectRatio: '1', maxWidth: 34,
    borderRadius: '50%', display: 'grid', placeItems: 'center',
    fontSize: 13, fontWeight: 800, lineHeight: 1,
  };
  switch (cell.state) {
    case 'ORDERED':
      return (
        <span title={cell.week} aria-label={`Ordered in week ${cell.week}`} style={{
          ...base, background: MARIGOLD, color: '#fff',
          // A pressed stamp, not a flat dot.
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.35)',
        }}>✓</span>
      );
    case 'FROZEN':
      return (
        <span title={`${cell.week}: a freeze covered this week`} aria-label={`Week ${cell.week} covered by a freeze`} style={{
          ...base, background: 'rgba(158,201,238,.22)', color: FROST,
          border: `1.5px solid ${FROST}`,
        }}>❄</span>
      );
    case 'CURRENT':
      return (
        <span className="gb-streak-now" title={`${cell.week}: this week`} aria-label="This week, still open" style={{
          ...base, background: 'transparent', border: `1.5px dashed ${MARIGOLD}`, color: MARIGOLD,
        }}>·</span>
      );
    default:
      return (
        <span title={cell.week} aria-label={`No order in week ${cell.week}`} style={{
          ...base, background: 'transparent', border: '1.5px solid rgba(241,245,249,.18)', color: 'transparent',
        }}>·</span>
      );
  }
}

export function StreakCard({ streak, slug }: { streak: StreakView | null; slug?: string }) {
  const [rulesOpen, setRulesOpen] = useState(false);

  if (!streak) {
    return <div style={{ margin: '0 16px', borderRadius: 22, height: 168, background: 'rgba(15,23,42,.06)' }} />;
  }

  const s = streak;
  const orderHref = slug ? `/${slug}` : '/home';
  const reward = MILESTONE_REWARDS.find((m) => m.weeks === s.next_milestone)?.reward;
  const dormant = s.status === 'BROKEN' || s.status === 'NONE';

  const copy = (() => {
    switch (s.status) {
      case 'ACTIVE': return { line: 'Ordered this week. Streak safe.', tone: '#8FD69B' };
      case 'FROZEN': return { line: 'A freeze covered last week for you.', tone: FROST };
      case 'AT_RISK': {
        const d = daysLeft(s.week_ends_at);
        return { line: d <= 1 ? 'Ends tonight. Order to keep it.' : `${d} days left to keep it going.`, tone: MARIGOLD };
      }
      case 'BROKEN': return { line: s.earn_back ? `Your ${s.earn_back.weeks}-week run ended.` : 'Your run ended.', tone: MUTED };
      default: return { line: 'One order starts your streak.', tone: MUTED };
    }
  })();

  // Ring = progress to the next milestone. Full circle once every milestone is passed.
  const milestone = s.next_milestone ?? s.weeks;
  const progress = milestone > 0 ? Math.min(1, s.weeks / milestone) : 0;
  const ringDeg = `${Math.round(progress * 360)}deg`;

  return (
    <section
      aria-label={`Order streak: ${s.weeks} weeks, ${s.status.toLowerCase().replace('_', ' ')}`}
      style={{
        margin: '0 16px', borderRadius: 22, overflow: 'hidden',
        background: `linear-gradient(152deg, ${INK} 0%, #16213A 62%, #1B2942 100%)`,
        boxShadow: '0 14px 32px -18px rgba(15,23,42,.75)',
        color: CREAM,
      }}
    >
      <div style={{ position: 'relative', padding: '18px 18px 16px' }}>
        {/* Grain: the stock should feel printed, not rendered. */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35,
          backgroundImage: 'radial-gradient(rgba(241,245,249,.14) 1px, transparent 1px)',
          backgroundSize: '7px 7px',
        }} />

        <div className="gb-streak-head" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* The anchor: milestone progress drawn around the number itself. */}
          <div
            className="gb-streak-ring"
            style={{
              ['--gb-streak-deg' as string]: ringDeg,
              width: 76, height: 76, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center',
              background: dormant
                ? 'conic-gradient(rgba(241,245,249,.16) 0deg, rgba(241,245,249,.16) 360deg)'
                : `conic-gradient(${MARIGOLD} var(--gb-streak-deg), rgba(241,245,249,.14) 0)`,
            }}
          >
            <div style={{
              width: 62, height: 62, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: 'radial-gradient(circle at 30% 25%, #1E293B, #0F172A)',
            }}>
              <span className="gb-serif" style={{
                fontSize: 30, fontWeight: 600, lineHeight: 1,
                color: dormant ? MUTED : CREAM, fontVariantNumeric: 'tabular-nums',
              }}>{s.weeks}</span>
            </div>
          </div>

          <div className="gb-streak-copy" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setRulesOpen(true)}
                aria-label="How your streak works"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: MUTED,
                }}
              >
                Week streak
                <MS name="info" size={13} color={MUTED} />
              </button>
              {s.freezes_available > 0 && (
                <span title="A freeze covers one missed week" style={{
                  fontSize: 11, fontWeight: 800, color: FROST,
                  border: `1px solid rgba(158,201,238,.45)`, borderRadius: 999, padding: '2px 7px',
                }}>❄ {s.freezes_available}</span>
              )}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: copy.tone, marginTop: 6, lineHeight: 1.35 }}>
              {copy.line}
            </div>
            {s.next_milestone != null && !dormant && (
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, fontWeight: 600 }}>
                {s.weeks_to_milestone === 0
                  ? reward ? `${s.next_milestone} weeks reached: ${reward.toLowerCase()}` : `${s.next_milestone}-week milestone reached`
                  : reward
                    ? `${s.weeks_to_milestone} more ${s.weeks_to_milestone === 1 ? 'week' : 'weeks'} → ${reward.toLowerCase()}`
                    : `${s.weeks_to_milestone} more to the ${s.next_milestone}-week mark`}
              </div>
            )}
          </div>
        </div>

        {/* The stamp rail. The line behind the stamps is what makes a gap read as a break. */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <div aria-hidden style={{
            position: 'absolute', left: 6, right: 6, top: '50%', height: 2, transform: 'translateY(-1px)',
            background: 'rgba(241,245,249,.14)',
          }} />
          <div style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
            {s.recent_weeks.map((c) => <Stamp key={c.week} cell={c} />)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'rgba(198,179,160,.75)' }}>8 WEEKS AGO</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'rgba(198,179,160,.75)' }}>
            {s.longest_weeks > s.weeks ? `BEST ${s.longest_weeks}` : 'THIS WEEK'}
          </span>
        </div>
      </div>

      {s.status === 'FROZEN' && (
        <button
          onClick={() => setRulesOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px',
            background: 'rgba(158,201,238,.12)', border: 'none', borderTop: '1px solid rgba(158,201,238,.25)',
            color: FROST, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <MS name="ac_unit" size={16} color={FROST} />
          <span style={{ flex: 1 }}>
            A freeze was used to save this streak. {s.freezes_available} left.
          </span>
          <MS name="chevron_right" size={16} color={FROST} />
        </button>
      )}

      {/* One action, and only when there is one worth taking. */}
      {(s.status === 'BROKEN' && s.earn_back) && (
        <Link href={orderHref} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          background: MARIGOLD, color: '#fff', textDecoration: 'none',
        }}>
          <MS name="replay" size={19} color="#fff" />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>
            Order this week, get your {s.earn_back.weeks} weeks back
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.7 }}>{daysLeft(s.earn_back.expires_at)}d</span>
        </Link>
      )}

      {(s.status === 'AT_RISK' || s.status === 'NONE') && (
        <Link href={orderHref} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          background: MARIGOLD, color: '#fff', textDecoration: 'none',
        }}>
          <MS name="local_cafe" size={19} color="#fff" />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>
            {s.status === 'NONE' ? 'Start your streak' : 'Keep it going'}
          </span>
          <MS name="chevron_right" size={18} color="#fff" />
        </Link>
      )}
      {rulesOpen && <StreakRulesSheet streak={s} onClose={() => setRulesOpen(false)} />}
    </section>
  );
}
