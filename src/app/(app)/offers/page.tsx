'use client';
/** Every offer running right now, across cafes. Checkout applies the best one automatically. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MS, TopBar, NavSpacer } from '@/components/gb/kit';
import { offerHeadline, offerTerms, type GrabbitOffer } from '@/components/gb/offers';
import type { RealCafe } from '@/components/gb/cards';

interface CafeOffers { cafe: RealCafe; offers: GrabbitOffer[] }

function OfferCard({ offer, cafe }: { offer: GrabbitOffer; cafe: RealCafe }) {
  const terms = offerTerms(offer);
  return (
    <Link href={`/${cafe.slug}`} style={{ display: 'block', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 15, marginTop: 12, boxShadow: 'var(--gb-shadow-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', flex: 'none' }}>
          <MS name={offer.offer_type === 'FREE_ITEM' ? 'redeem' : 'local_offer'} size={21} fill color="var(--gb-primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500, color: 'var(--gb-text)', lineHeight: 1.1 }}>{offerHeadline(offer)}</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 3 }}>{cafe.name}</div>
        </div>
        <MS name="chevron_right" size={20} color="var(--gb-icon)" />
      </div>

      {offer.description && (
        <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 10, lineHeight: 1.4 }}>{offer.description}</div>
      )}

      {terms.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
          {terms.map((t) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: 'var(--gb-muted-2)', background: 'var(--gb-surface)', border: '1px solid var(--gb-line-2)', padding: '4px 9px', borderRadius: 999 }}>{t}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function OffersPage() {
  const [groups, setGroups] = useState<CafeOffers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Both calls go through the proxy: same origin, so no CORS to configure.
    fetch('/api/proxy/grabit/cafes')
      .then((r) => (r.ok ? r.json() : []))
      .then((cafes: RealCafe[]) => Promise.all(
        // One call per cafe: the offers API is per-slug and there are a handful of
        // cafes. Worth a single cross-cafe endpoint if that list ever gets long.
        cafes.map((cafe) =>
          fetch(`/api/proxy/grabit/offers/${cafe.slug}`)
            .then((r) => (r.ok ? r.json() : []))
            .then((offers: GrabbitOffer[]) => ({ cafe, offers }))
            .catch(() => ({ cafe, offers: [] as GrabbitOffer[] }))),
      ))
      .then((all: CafeOffers[]) => setGroups(all.filter((g) => g.offers.length > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = groups.reduce((n, g) => n + g.offers.length, 0);

  return (
    <div className="gb-shell">
      <TopBar title="Offers" />

      {loading ? (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>Loading…</div>
      ) : total === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <MS name="local_offer" size={40} color="var(--gb-line-3)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', marginTop: 10 }}>No offers running right now</div>
          <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 4 }}>New ones show up here as cafes launch them.</div>
          <Link href="/explore" style={{ display: 'inline-block', marginTop: 16, background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '11px 22px', borderRadius: 12 }}>Browse cafés</Link>
        </div>
      ) : (
        <div style={{ padding: '10px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--gb-surface)', border: '1px solid var(--gb-line-2)', borderRadius: 12, padding: '10px 12px' }}>
            <MS name="auto_awesome" size={17} fill color="var(--gb-primary)" />
            <span style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600 }}>The best offer you qualify for is applied at checkout, no code needed.</span>
          </div>
          {groups.map((g) => g.offers.map((o) => <OfferCard key={o.id} offer={o} cafe={g.cafe} />))}
        </div>
      )}

      <NavSpacer />
    </div>
  );
}
