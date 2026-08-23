'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MS } from '@/components/gb/kit';
import type { StreakView } from '@/types/grabbit';

/**
 * What a streak is, how it survives a miss, and what it earns.
 *
 * The card can only ever say what is true right now. Nothing told a customer what counts
 * as a week, that freezes exist at all, or that a broken run can be reclaimed - so the
 * mechanic was invisible until it worked in your favour, which is the wrong way round.
 */

/**
 * COPY ONLY. Nothing in the system grants these yet: the streak service knows the
 * milestone a customer has reached, but there is no offer wired to it, so a cafe has to
 * honour the reward at the counter. Confirm these with the cafes before this ships, or
 * they will be asked for a chai they never agreed to give.
 */
export const MILESTONE_REWARDS: Array<{ weeks: number; reward: string }> = [
  { weeks: 4, reward: 'A free chai on the house' },
  { weeks: 12, reward: 'A free coffee, any size' },
  { weeks: 26, reward: '₹150 off an order' },
  { weeks: 52, reward: 'A free drink every month' },
];

const RULES: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: 'local_cafe',
    title: 'One order a week keeps it',
    body: 'Any order between Monday and Sunday counts. A second one in the same week does not add to the streak, it just means the week is safe.',
  },
  {
    icon: 'schedule',
    title: 'This week is still open',
    body: 'Your streak does not drop the moment a new week starts. It stands on the weeks you have completed, and this week can extend it right up to Sunday night.',
  },
  {
    icon: 'ac_unit',
    title: 'A freeze covers one missed week',
    body: 'Earn one freeze for every four weeks you order, and hold up to two. If you miss a week, a freeze is used automatically and we tell you afterwards.',
  },
  {
    icon: 'replay',
    title: 'Seven days to get it back',
    body: 'If a run does end, one order within the next week brings the whole streak back instead of starting again from zero.',
  },
];

export function StreakRulesSheet({ streak, onClose }: { streak: StreakView | null; onClose: () => void }) {
  const weeks = streak?.weeks ?? 0;
  // Rendered into body: at z-index 60 the sheet still sat under the bottom bar, because
  // an ancestor of the card opens its own stacking context and traps it. A modal has to
  // escape the tree it was declared in, not out-number it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // The page behind a sheet should not scroll with it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal((
    <div
      // The palette lives on .gb-app, and a portal lands outside it: without this class
      // every --gb-* token resolves to nothing and the sheet renders unpainted.
      className="gb-app"
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How your streak works"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{ alignSelf: 'center', marginBottom: 14, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
      >
        <MS name="close" size={22} color="var(--gb-ink)" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="om-enter"
        style={{ background: 'var(--gb-surface)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '78vh', overflowY: 'auto', padding: '20px 18px calc(28px + env(safe-area-inset-bottom))' }}
      >
        <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--gb-text)' }}>
          How your streak works
        </div>
        <div style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 4, fontWeight: 600 }}>
          Order once a week, every week.
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {RULES.map((r) => (
            <div key={r.title} style={{ display: 'flex', gap: 12 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center',
                background: 'var(--gb-primary-pale)',
              }}>
                <MS name={r.icon} size={19} color="var(--gb-ink)" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', marginTop: 3, lineHeight: 1.45, fontWeight: 500 }}>{r.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, borderTop: '1px solid var(--gb-line-2)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gb-muted-2)' }}>
            What you earn
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MILESTONE_REWARDS.map((m) => {
              const reached = weeks >= m.weeks;
              return (
                <div key={m.weeks} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 13,
                  background: reached ? 'var(--gb-primary-pale)' : '#fff',
                  border: `1px solid ${reached ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`,
                }}>
                  <span className="mono" style={{
                    fontSize: 13, fontWeight: 800, color: reached ? 'var(--gb-ink)' : 'var(--gb-muted)',
                    minWidth: 58,
                  }}>{m.weeks} weeks</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--gb-text)' }}>{m.reward}</span>
                  {reached
                    ? <MS name="check_circle" size={19} color="var(--gb-green)" />
                    : <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gb-muted-2)' }}>{m.weeks - weeks} to go</span>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', marginTop: 10, lineHeight: 1.45 }}>
            Rewards are claimed at the counter. Show this screen to the café.
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}
