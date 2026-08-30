'use client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';

/**
 * Uber-style post-order review. After a customer's order is completed and handed
 * over, the next time they open the GravitUI app this bottom sheet slides up
 * (covering ~65% of the screen over a faded backdrop) and asks them to review
 * that last order. Two parts:
 *   1. The cafe/order experience - star rating, quick tags, optional comment.
 *   2. A small "Report an issue with the app" section whose feedback is emailed
 *      to the product team (backend sends it to hello@unifiednexgrade.com).
 *
 * Timing (which order to review, whether to nag again) is resolved by the Gate and
 * tracked in localStorage so a dismissed order isn't asked about on every open.
 */

interface PendingItem { name: string; quantity: number; }
export interface PendingReview {
  orderId: number;
  cafeId: number;
  totalAmount: number;
  items: PendingItem[];
}

const TAGS = ['Taste', 'Food quality', 'Preparation', 'Packaging', 'Portion', 'Value', 'Timeliness'];
const FEEDBACK_CATEGORIES = ['Bug', 'Broken flow', 'Payment issue', 'Order issue', 'Other'];

const KEY_DISMISSED = 'grabit.review.dismissed';
const KEY_DONE = 'grabit.review.done';

function readSet(key: string): Set<number> {
  try {
    return new Set<number>(JSON.parse(localStorage.getItem(key) ?? '[]'));
  } catch {
    return new Set();
  }
}
function remember(key: string, orderId: number) {
  const set = readSet(key);
  set.add(orderId);
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}

/* ------------------------------ Star rating ------------------------------ */
function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, outline: 'none' }}
        >
          <span className="gb-ms gb-fill" style={{ fontSize: 40, color: n <= value ? 'var(--gb-gold)' : 'var(--gb-line-3)' }}>
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function Cta({
  children, onClick, disabled, primary, busy,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: 13, cursor: disabled || busy ? 'default' : 'pointer',
        background: primary ? 'var(--gb-primary)' : 'var(--gb-surface)',
        color: primary ? '#fff' : 'var(--gb-text)',
        border: primary ? 'none' : '1px solid var(--gb-line-2)',
        fontSize: 15, fontWeight: 800, opacity: disabled || busy ? 0.6 : 1, boxShadow: primary ? '0 12px 24px -10px rgba(177,90,50,.6)' : 'none',
      }}
    >
      {busy ? 'Submitting…' : children}
    </button>
  );
}

/* ------------------------------ Main sheet ------------------------------ */
export function ReviewSheet({ pending, cafeName, onClose, onReviewed }: {
  pending: PendingReview;
  cafeName?: string;
  onClose: () => void;
  onReviewed: (orderId: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // App feedback (small secondary section)
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [category, setCategory] = useState('Bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const itemsLabel = useMemo(
    () => pending.items.map((i) => (i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name)).join(', ') || 'Pickup order',
    [pending.items],
  );

  async function submitReview() {
    if (!rating) return;
    setSubmitting(true);
    try {
      await fetch(`/api/proxy/grabit/orders/${pending.orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, tags: [...tags], comment: comment.trim() || null }),
      });
      remember(KEY_DONE, pending.orderId);
      setSubmitted(true);
      onReviewed(pending.orderId);
    } catch {
      setSubmitting(false);
    }
  }

  async function submitFeedback() {
    if (!feedbackText.trim()) return;
    setFeedbackBusy(true);
    try {
      await fetch('/api/proxy/grabit/feedback/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message: feedbackText.trim() }),
      });
      setFeedbackSent(true);
    } catch {
      setFeedbackBusy(false);
    }
  }

  function dismiss() {
    remember(KEY_DISMISSED, pending.orderId);
    onClose();
  }

  return (
    <motion.div
      className="gb-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(24,14,5,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={dismiss}
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 110) dismiss(); }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="gb-review-sheet"
        style={{
          width: '100%', height: '68dvh', background: 'var(--gb-surface)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0 -18px 48px rgba(30,15,5,.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
        }}
      >
        {/* grab handle */}
        <div style={{ padding: '10px 0 4px' }}>
          <div style={{ width: 44, height: 5, borderRadius: 999, background: 'var(--gb-line-3)', margin: '0 auto', cursor: 'grab' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 18px 12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <MS name="star" size={22} fill color="var(--gb-primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.2 }}>How was your order?</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{cafeName ?? `Cafe #${pending.cafeId}`} · {itemsLabel}</div>
          </div>
          <button onClick={dismiss} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <MS name="close" size={22} color="var(--gb-icon)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 18px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <MS name="check" size={34} fill color="var(--gb-green)" />
              </div>
              <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, marginTop: 16 }}>Thanks for the review</div>
              <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 6 }}>It helps the cafe and the Gravit team improve.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted-2)', textAlign: 'center', marginBottom: 6 }}>Rate your experience</div>
              <Stars value={rating} onChange={setRating} />



              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 14 }}>
                {TAGS.map((t) => {
                  const on = tags.has(t);
                  return (
                    <button
                      key={t}
                      onClick={() => setTags((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; })}
                      style={{
                        border: on ? '1.5px solid var(--gb-primary)' : '1.5px solid var(--gb-line-3)',
                        background: on ? 'var(--gb-primary-soft)' : '#fff',
                        color: on ? 'var(--gb-primary)' : 'var(--gb-muted-2)',
                        fontSize: 12.5, fontWeight: 700, padding: '8px 13px', borderRadius: 999, cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Anything else? How was the taste, the food quality... (optional)"
                style={{
                  width: '100%', marginTop: 14, border: '1px solid var(--gb-line-2)', borderRadius: 12,
                  padding: '12px 13px', fontSize: 13.5, fontWeight: 500, color: 'var(--gb-text)',
                  background: '#fff', outline: 'none', resize: 'vertical', minHeight: 72, lineHeight: 1.5,
                  fontFamily: 'var(--gb-sans)', boxSizing: 'border-box',
                }}
              />

              <div style={{ marginTop: 14 }}>
                <Cta primary disabled={!rating} busy={submitting} onClick={submitReview}>
                  {rating ? 'Submit review' : 'Tap the stars above'}
                </Cta>
              </div>

              {/* App feedback - secondary, small button */}
              <div style={{ marginTop: 18, borderTop: '1px solid var(--gb-line)', paddingTop: 12 }}>
                {!feedbackOpen && (
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, color: 'var(--gb-muted-2)', fontSize: 12.5, fontWeight: 700, padding: 6 }}
                  >
                    <MS name="feedback" size={17} color="var(--gb-muted-2)" />Report an issue with the app
                  </button>
                )}

                {feedbackOpen && (
                  feedbackSent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gb-green)', fontSize: 13, fontWeight: 700, padding: '4px 0' }}>
                      <MS name="check_circle" size={19} fill color="var(--gb-green)" />Thanks - your feedback has been sent to the team.
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted-2)', marginBottom: 8 }}>
                        Report an issue with the app - it goes straight to our team.
                      </div>
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                        {FEEDBACK_CATEGORIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => setCategory(c)}
                            style={{
                              border: category === c ? '1.5px solid var(--gb-primary)' : '1.5px solid var(--gb-line-3)',
                              background: category === c ? 'var(--gb-primary-soft)' : '#fff',
                              color: category === c ? 'var(--gb-primary)' : 'var(--gb-muted-2)',
                              fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us what went wrong with the app..."
                        style={{
                          width: '100%', border: '1px solid var(--gb-line-2)', borderRadius: 12, padding: '11px 13px',
                          fontSize: 13, fontWeight: 500, color: 'var(--gb-text)', background: '#fff', outline: 'none',
                          resize: 'vertical', minHeight: 64, lineHeight: 1.5, fontFamily: 'var(--gb-sans)', boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ marginTop: 10 }}>
                        <Cta disabled={!feedbackText.trim()} busy={feedbackBusy} onClick={submitFeedback}>Send feedback</Cta>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------ Gate ------------------------------ */
interface CafeInfo { id: number; name: string; slug: string; }

export function ReviewGate() {
  const [pending, setPending] = useState<PendingReview | null>(null);
  const [cafeName, setCafeName] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [pendingRes, cafeRes] = await Promise.all([
          fetch('/api/proxy/grabit/reviews/pending'),
          fetch('/api/proxy/grabit/cafes').then((r) => (r.ok ? r.json() : [])),
        ]);
        if (cancelled) return;
        if (pendingRes.status === 204 || !pendingRes.ok) return; // nothing to review, or guest (401)
        const data = await pendingRes.json();
        if (!data?.orderId) return;

        const list = (cafeRes as CafeInfo[]) ?? [];
        const cafe = list.find((c) => c.id === data.cafeId);
        if (cafe) setCafeName(cafe.name);

        if (readSet(KEY_DISMISSED).has(data.orderId) || readSet(KEY_DONE).has(data.orderId)) return;
        setPending({ orderId: data.orderId, cafeId: data.cafeId, totalAmount: data.totalAmount, items: data.items ?? [] });
      } catch {
        // network/API hiccup - never block the app over a review prompt
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <AnimatePresence>
      {pending && (
        <ReviewSheet
          pending={pending}
          cafeName={cafeName}
          onClose={() => setPending(null)}
          onReviewed={() => setPending(null)}
        />
      )}
    </AnimatePresence>
  );
}
