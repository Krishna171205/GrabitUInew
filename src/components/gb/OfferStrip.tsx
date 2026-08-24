'use client';
/**
 * The cafe's live offers as one line that rotates: the current offer slides up and
 * out while the next comes in from below. Tapping the strip expands the full list.
 */
import { useState } from 'react';
import { MS } from './kit';
import { offerHeadline, offerTerms, type GrabbitOffer } from './offers';
import { useOfferRotation, OFFER_SLIDE_MS } from './useOfferRotation';

/** Line box height. The track slides by exactly this, so it must match the row. */
const ROW = 20;

/** "Free Peach Iced Tea above ₹400", the one line a customer needs. */
function offerLine(o: GrabbitOffer): string {
  const head = offerHeadline(o);
  return o.min_order_value != null ? `${head} above ₹${o.min_order_value}` : head;
}

export function OfferStrip({ offers }: { offers: GrabbitOffer[] }) {
  const [expanded, setExpanded] = useState(false);
  // An open list should stay still while it's being read.
  const { index, sliding } = useOfferRotation(offers.length, expanded);

  if (offers.length === 0) return null;

  const track = [...offers, offers[0]];

  return (
    <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 14px', border: 'none', background: 'transparent', cursor: offers.length > 1 ? 'pointer' : 'default', textAlign: 'left' }}
      >
        <MS name="local_offer" size={19} fill color="var(--gb-primary)" />

        <div style={{ flex: 1, minWidth: 0, height: ROW, overflow: 'hidden' }}>
          <div style={{ transform: `translateY(-${index * ROW}px)`, transition: sliding ? `transform ${OFFER_SLIDE_MS}ms cubic-bezier(.4,0,.2,1)` : 'none' }}>
            {track.map((o, i) => (
              <div
                key={`${o.id}-${i}`}
                style={{ height: ROW, lineHeight: `${ROW}px`, fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {offerLine(o)}
              </div>
            ))}
          </div>
        </div>

        {offers.length > 1 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flex: 'none', fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted-2)' }}>
            {offers.length} offers
            <MS name={expanded ? 'expand_less' : 'expand_more'} size={18} />
          </span>
        )}
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--gb-line)', padding: '4px 14px 12px' }}>
          {offers.map((o) => {
            const terms = offerTerms(o);
            return (
              <div key={o.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gb-line)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)' }}>{offerHeadline(o)}</div>
                {o.description && (
                  <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{o.description}</div>
                )}
                {terms.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                    {terms.map((t) => (
                      <span key={t} style={{ fontSize: 11, fontWeight: 700, color: 'var(--gb-muted-2)', background: 'var(--gb-surface)', border: '1px solid var(--gb-line-2)', padding: '3px 8px', borderRadius: 999 }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 10 }}>
            The best offer you qualify for is applied at checkout, no code needed.
          </div>
        </div>
      )}
    </div>
  );
}
