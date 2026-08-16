'use client';
/**
 * The cooking instruction for one cart line.
 *
 * The line itself only ever shows a text link or the chosen note. Choosing happens in a
 * sheet over the cart, so the list never reflows while she is deciding, and dismissing it
 * leaves the order exactly as it was.
 */
import { useEffect, useState } from 'react';
import { MS } from './kit';

/** Matches grabit_order_items.notes. */
const MAX = 120;

const ENTER_MS = 320;
const EXIT_MS = 200;
/** iOS drawer curve: quick off the mark, settles without a bounce. */
const EASE_DRAWER = 'cubic-bezier(.32,.72,0,1)';
/** Frosted panel. Saturation is what keeps the blur from reading as grey fog. */
const GLASS = 'saturate(160%) blur(28px)';

/**
 * Quick notes, by what the dish is. A coffee cannot lose its cabbage and a wrap cannot be
 * brewed strong, so offering the wrong list is worse than offering none.
 */
const DRINK_CHIPS = ['Extra strong', 'Less sugar', 'No sugar', 'No ice', 'Extra hot'];
const FOOD_CHIPS = ['No onion', 'No cabbage', 'Less spicy', 'Extra spicy', 'No mayo'];

export function LineNote({ note, dish, category, onChange }: {
  note?: string;
  /** Dish name, so the sheet says which line it is about. */
  dish: string;
  /** Menu category of the dish, as the API sends it ('drinks' | 'food' | ...). */
  category?: string | null;
  onChange: (note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // `shown` drives the transition. It flips a frame after mount so the panel animates
  // from below rather than appearing there, and flips back before unmount so the exit
  // animates too. Exit is faster than entry: the system responding should feel quicker
  // than the customer deciding.
  const [shown, setShown] = useState(false);
  const [draft, setDraft] = useState('');
  const chips = category === 'drinks' ? DRINK_CHIPS : FOOD_CHIPS;
  // Reduced motion keeps the fade, which aids comprehension, and drops the travel.
  const still = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The draft starts from whatever is on the line each time it opens, and is thrown away
  // on dismiss: nothing half-typed survives a sheet she closed.
  function openSheet() {
    setDraft(note ?? '');
    setOpen(true);
  }

  function dismiss() {
    setShown(false);
    setTimeout(() => setOpen(false), EXIT_MS);
  }

  function choose(value: string) {
    onChange(value.slice(0, MAX));
    dismiss();
  }

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      {/* Marigold on soft amber measured 1.5:1, which is why this was hard to read.
          Ink on the same amber is 14.4:1 and needs no colour outside the palette. */}
      {note ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, maxWidth: '100%', background: 'var(--gb-primary-soft)', borderRadius: 9, padding: '4px 6px 4px 9px', fontSize: 11.5, fontWeight: 700, color: 'var(--gb-ink)' }}>
          <MS name="edit_note" size={13} color="var(--gb-ink)" style={{ opacity: .55, flex: 'none' }} />
          <button
            onClick={openSheet}
            style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}
          >
            {note}
          </button>
          <button
            onClick={() => onChange('')}
            aria-label={`Remove instruction for ${dish}`}
            style={{ display: 'grid', placeItems: 'center', width: 17, height: 17, borderRadius: '50%', border: 'none', background: 'rgba(36,22,18,.14)', flex: 'none', cursor: 'pointer', padding: 0 }}
          >
            <MS name="close" size={12} color="var(--gb-ink)" />
          </button>
        </span>
      ) : (
        <button
          onClick={openSheet}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4, background: 'none', border: 'none', padding: 0, fontSize: 11, fontWeight: 700, color: 'var(--gb-muted-2)', cursor: 'pointer' }}
        >
          <MS name="edit_note" size={14} />Add note
        </button>
      )}

      {open && (
        <div
          onClick={dismiss}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,12,8,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: shown ? 1 : 0, transition: `opacity ${shown ? ENTER_MS : EXIT_MS}ms ease` }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 448, borderRadius: '22px 22px 0 0',
              padding: '14px 20px calc(20px + env(safe-area-inset-bottom))',
              // Sits on a scrim, so it carries more of its own colour than a bar would:
              // at bar opacity the dim bleeds through and the panel reads muddy.
              background: 'rgba(255,251,243,.92)',
              backdropFilter: GLASS, WebkitBackdropFilter: GLASS,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), 0 -20px 50px -24px rgba(46,32,25,.5)',
              transform: shown || still ? 'translateY(0)' : 'translateY(100%)',
              transition: still ? 'none' : `transform ${shown ? ENTER_MS : EXIT_MS}ms ${EASE_DRAWER}`,
            }}
          >
            <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--gb-line-3)', margin: '0 auto 14px' }} />

            <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--gb-text)' }}>Add a note</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>
              For {dish}. The kitchen sees it against this dish.
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '14px 0 0' }}>
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => choose(c)}
                  // Selected reads as ink on amber with a marigold edge, for the same
                  // contrast reason as the tag: marigold text on this fill is unreadable.
                  style={{ background: c === note ? 'var(--gb-primary-soft)' : '#fff', border: `1.5px solid ${c === note ? 'var(--gb-primary)' : 'var(--gb-line-3)'}`, borderRadius: 999, padding: '7px 13px', fontSize: 12.5, fontWeight: 700, color: 'var(--gb-text)', cursor: 'pointer' }}
                >
                  {c}
                </button>
              ))}
            </div>

            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
              onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) choose(draft); }}
              placeholder="Or write your own"
              style={{ width: '100%', marginTop: 14, border: '1px solid #EEE4D6', borderRadius: 12, padding: '11px 13px', fontSize: 13.5, fontFamily: 'var(--gb-sans)', fontWeight: 500, color: 'var(--gb-text)', background: 'var(--gb-surface)', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={dismiss}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid var(--gb-line-2)', background: '#fff', color: 'var(--gb-text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => choose(draft)}
                disabled={!draft.trim() && !note}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: draft.trim() || note ? 'var(--gb-ink)' : 'var(--gb-line-2)', color: draft.trim() || note ? '#fff' : 'var(--gb-muted-2)', fontSize: 14, fontWeight: 800, cursor: draft.trim() || note ? 'pointer' : 'default' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
