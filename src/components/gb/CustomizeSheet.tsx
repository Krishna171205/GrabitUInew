'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { MS, Veg } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';

import type { GrabbitMenuAddon, GrabbitMenuItem, GrabbitMenuOptionGroup, GrabbitMenuVariation } from '@gradient365/gradient-commons';
import { menuImageSrc } from '@/lib/menu-image';

// Fallback for a combo whose per-component prices can't all be resolved: the cafe-authored
// "(MRP 220)" at the end of the description - a real number, just not one that updates as
// the guest swaps which drink/side they're taking.
function parseMrp(description: string | null): number | null {
  const m = description?.match(/\(mrp\s*[:.]?\s*(\d+)\)/i);
  return m ? Number(m[1]) : null;
}

// A combo option is sometimes typed slightly differently than the standalone item it
// actually is (confirmed against the printed menu, not guessed) - name-match first, fall
// back to this short, explicit list rather than fuzzy-matching every combo site-wide.
const OPTION_NAME_ALIASES: Record<string, string> = {
  'spicy potato wrap': 'hot spiced potato wrap',
};

// A combo side sometimes isn't sold as its own menu item at all - "Classic Fries (small)"
// is a smaller portion than the standalone "French Fries" (₹130), not the same item at a
// different name, so it can't alias there. Price confirmed directly by the cafe.
const KNOWN_OPTION_PRICES: Record<string, number> = {
  'classic fries (small)': 70,
};

export interface CustomizeSelection {
  variation?: { id: number; name: string; price: number };
  options: { id: number; name: string; price: number }[];
  addons: { id: number; name: string; price: number }[];
  quantity: number;
}

interface Props {
  item: GrabbitMenuItem;
  variations: GrabbitMenuVariation[];
  groups: GrabbitMenuOptionGroup[];
  /** Legacy subcategory add-ons, authored in Grabit rather than pushed from Omega. */
  addons: GrabbitMenuAddon[];
  /** Full live menu, for looking up what a bundled combo option costs on its own. */
  items: GrabbitMenuItem[];
  onClose: () => void;
  onAdd: (selection: CustomizeSelection) => void;
}

/** One pickable row, whatever section it belongs to. */
interface Choice {
  id: number;
  name: string;
  /** What the row costs: absolute for a variation, a delta for an extra. */
  priceLabel: string;
  selected: boolean;
  onSelect: () => void;
}

export function CustomizeSheet({ item, variations, groups, addons, items, onClose, onAdd }: Props) {
  // An item with variations has no meaningful "plain" price, so the first one is the
  // opening position - same as every aggregator sheet, and the guest can move off it.
  const [variationId, setVariationId] = useState<number | null>(variations[0]?.id ?? null);
  // A required group with exactly one option isn't a real decision - pre-pick it so the
  // guest doesn't have to tap through a "choice" that was never actually optional.
  const [optionIds, setOptionIds] = useState<Set<number>>(() => new Set(
    groups.filter(g => g.min_select > 0 && g.options.length === 1).map(g => g.options[0].id),
  ));
  const [addonIds, setAddonIds] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);

  const priceByName = useMemo(
    () => new Map(items.filter(i => i.id !== item.id).map(i => [i.name.toLowerCase().trim(), i.price])),
    [items, item.id],
  );
  function standalonePrice(name: string): number | null {
    const key = name.toLowerCase().trim();
    return priceByName.get(key) ?? priceByName.get(OPTION_NAME_ALIASES[key] ?? '') ?? KNOWN_OPTION_PRICES[key] ?? null;
  }

  // A "bundle" group swaps in a whole separate item (this wrap, or that drink) at no extra
  // charge - every option price_delta is 0, and it's required, unlike a real add-on group
  // ("extra cheese +20") where price_delta reflects money actually changing hands. Only
  // bundle groups have a meaningful standalone value to show or sum.
  const bundleGroups = variations.length === 0
    ? groups.filter(g => g.min_select > 0 && g.options.every(o => o.price_delta === 0))
    : [];
  const selectedBundlePrices = bundleGroups.map(g => {
    const selected = g.options.find(o => optionIds.has(o.id));
    return selected ? standalonePrice(selected.name) : null;
  });
  const itemizedTotal = bundleGroups.length > 0 && selectedBundlePrices.every((p): p is number => p !== null)
    ? selectedBundlePrices.reduce((s, p) => s + p, 0)
    : null;

  const staticMrp = parseMrp(item.description);
  const mrp = itemizedTotal ?? staticMrp;
  const showMrp = mrp !== null && mrp > item.price;
  const cleanDescription = staticMrp !== null
    ? item.description!.replace(/\s*\(mrp\s*[:.]?\s*\d+\)/i, '').trim()
    : item.description;

  const variation = variations.find(v => v.id === variationId) ?? null;
  const basePrice = variation ? variation.price : item.price;

  const chosenOptions = useMemo(
    () => groups.flatMap(g => g.options.filter(o => optionIds.has(o.id))),
    [groups, optionIds],
  );
  const chosenAddons = useMemo(() => addons.filter(a => addonIds.has(a.id)), [addons, addonIds]);

  const extrasTotal =
    chosenOptions.reduce((s, o) => s + o.price_delta, 0) + chosenAddons.reduce((s, a) => s + a.price, 0);
  const lineTotal = (basePrice + extrasTotal) * quantity;

  // The same rule the server enforces on order creation: an unmet group is the one thing
  // that can make this item unorderable, so say which group instead of failing at checkout.
  const unmetGroup = groups.find(
    g => g.min_select > 0 && g.options.filter(o => optionIds.has(o.id)).length < g.min_select,
  );

  function toggleOption(group: GrabbitMenuOptionGroup, optionId: number) {
    setOptionIds(prev => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
        return next;
      }
      const inGroup = group.options.filter(o => next.has(o.id));
      // A full group swaps rather than refuses: tapping a third topping on a "pick 2" group
      // silently doing nothing reads as a broken button.
      if (inGroup.length >= group.max_select) next.delete(inGroup[0].id);
      next.add(optionId);
      return next;
    });
  }

  return (
    <div className="gb-scrim-in" style={S.scrim} onClick={onClose}>
      <div className="gb-sheet-in" style={S.sheet} onClick={e => e.stopPropagation()}>
        <div style={S.body}>
          <div style={S.hero}>
            <Image
              src={menuImageSrc(item.image_url)}
              alt=""
              fill
              sizes="448px"
              style={{ objectFit: 'cover' }}
            />
            <button onClick={onClose} aria-label="Close" className="gb-press" style={S.heroClose}>
              <MS name="close" size={18} />
            </button>
          </div>

          <div style={S.contentWrap}>
            <div>
              <div style={S.nameRow}>
                <Veg veg={item.is_veg} />
                <span style={S.name}>{item.name}</span>
              </div>
              {showMrp && (
                <div style={S.mrpRow}>
                  <span style={S.mrpStrike}>{inr(mrp!)}</span>
                  <span style={S.mrpNow}>{inr(item.price)}</span>
                  <span style={S.mrpSaved}>{Math.round((1 - item.price / mrp!) * 100)}% OFF</span>
                </div>
              )}
              {item.is_bestseller && (
                <div style={S.bestseller}>
                  <MS name="local_fire_department" size={12} fill color="#FFD27A" />
                  BESTSELLER
                </div>
              )}
              {cleanDescription && <div style={S.description}>{cleanDescription}</div>}
            </div>

            {variations.length > 0 && (
            <Section title="Customized" rule="Select any 1">
              {variations.map(v => (
                <Row
                  key={v.id}
                  choice={{
                    id: v.id,
                    name: v.name,
                    priceLabel: inr(v.price),
                    selected: v.id === variationId,
                    onSelect: () => setVariationId(v.id),
                  }}
                  veg={item.is_veg}
                  single
                />
              ))}
            </Section>
          )}

          {groups.map((g, i) => {
            const isBundleGroup = bundleGroups.includes(g);
            // A required group with exactly one option has nothing to contrast a price
            // against - "Free" implies a paid alternative that doesn't exist here, so
            // it's just noise there. A bundle group's standalone value is worth showing
            // even with one option, though: "this wrap alone is worth ₹130" is real info.
            const soleRequiredChoice = !isBundleGroup && g.options.length === 1 && g.min_select > 0;
            return (
              <Section
                key={g.id}
                title={g.name}
                // A single option is nothing to "select any 1" of - there's no choice
                // being offered, so the instruction has no real referent.
                rule={g.options.length === 1 ? '' : (g.min_select > 0 ? `Select any ${g.min_select}` : `Select upto ${g.max_select}`)}
              >
                {g.options.map(o => {
                  const bundlePrice = isBundleGroup ? standalonePrice(o.name) : null;
                  const priceLabel = isBundleGroup
                    ? (bundlePrice !== null ? inr(bundlePrice) : '')
                    : (soleRequiredChoice ? '' : (o.price_delta > 0 ? `+ ${inr(o.price_delta)}` : 'Free'));
                  return (
                    <Row
                      key={o.id}
                      choice={{
                        id: o.id,
                        name: o.name,
                        priceLabel,
                        selected: optionIds.has(o.id),
                        onSelect: () => toggleOption(g, o.id),
                      }}
                      veg={item.is_veg}
                      single={g.max_select === 1}
                    />
                  );
                })}
              </Section>
            );
          })}

          {addons.length > 0 && (
            <Section title="Extras" rule="Add as many as you like">
              {addons.map(a => (
                <Row
                  key={a.id}
                  choice={{
                    id: a.id,
                    name: a.name,
                    priceLabel: `+ ${inr(a.price)}`,
                    selected: addonIds.has(a.id),
                    onSelect: () =>
                      setAddonIds(prev => {
                        const next = new Set(prev);
                        if (next.has(a.id)) next.delete(a.id); else next.add(a.id);
                        return next;
                      }),
                  }}
                  veg={item.is_veg}
                />
              ))}
            </Section>
          )}
          </div>
        </div>

        <footer style={S.footer}>
          <div style={S.stepper}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Reduce quantity" style={S.stepBtn}>
              <MS name="remove" size={19} />
            </button>
            <span style={S.stepCount}>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(99, q + 1))} aria-label="Increase quantity" style={S.stepBtn}>
              <MS name="add" size={19} />
            </button>
          </div>
          <button
            className="gb-press"
            onClick={() =>
              onAdd({
                variation: variation ? { id: variation.id, name: variation.name, price: variation.price } : undefined,
                options: chosenOptions.map(o => ({ id: o.id, name: o.name, price: o.price_delta })),
                addons: chosenAddons.map(a => ({ id: a.id, name: a.name, price: a.price })),
                quantity,
              })
            }
            disabled={!!unmetGroup}
            style={{ ...S.cta, ...(unmetGroup ? S.ctaOff : null) }}
          >
            {unmetGroup ? (
              <span>Choose from {unmetGroup.name}</span>
            ) : (
              <>
                <span>Add Item</span>
                <span style={S.ctaDivider} />
                <span style={S.ctaTotal}>{inr(lineTotal)}</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * A titled card of choices. The grouping is what keeps four variations, two add-on groups
 * and the extras from reading as one undifferentiated column.
 */
function Section({ title, rule, children }: {
  title: string;
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={S.sectionHead}>
        <div style={S.sectionTitle}>{title}</div>
        {rule && <div style={S.rule}>{rule}</div>}
      </div>
      <div style={S.card}>{children}</div>
    </section>
  );
}

/**
 * Native input kept for keyboard and screen readers, visually replaced by a marigold
 * control - the browser default was the one piece of stock chrome in a custom app.
 */
function Row({ choice, veg, single }: { choice: Choice; veg?: boolean | null; single?: boolean }) {
  const { name, priceLabel, selected, onSelect } = choice;
  return (
    <label style={S.row}>
      <input type={single ? 'radio' : 'checkbox'} checked={selected} onChange={onSelect} style={S.srOnly} />
      <Veg veg={veg} />
      <span style={S.rowName}>{name}</span>
      {priceLabel && (
        <span style={{ ...S.rowPrice, ...(priceLabel === 'Free' ? S.rowFree : null) }}>{priceLabel}</span>
      )}
      {/* Thumb reaches the control last, so it sits on the edge it is tapped from. */}
      <span
        aria-hidden
        style={{ ...S.control, borderRadius: single ? 999 : 6, ...(selected ? S.controlOn : null) }}
      >
        {selected && (single
          ? <span style={S.dot} />
          : <MS name="check" size={13} color="var(--gb-on-primary)" />)}
      </span>
    </label>
  );
}

/**
 * Measured off the reference screenshot rather than derived from our tokens: the ask was an
 * exact copy of that sheet, so the greys, the green button and the red selection are its
 * palette, not Grabit's marigold and ink. Swapping back is a change to this block alone.
 */
const C = {
  scrim: 'rgba(0,0,0,.45)',
  page: '#F0F0F5',        // sheet body behind the cards
  card: '#FFFFFF',
  ink: '#1C1C1C',         // titles and option names
  sub: '#7E808C',         // "Select any 1"
  strike: '#9C9C9C',
  line: '#E2E2E7',
  pick: '#EF4F5F',        // selected radio
  pickOff: '#D0D0D5',     // unselected radio
  // Add Item is ours, not the reference's green: it is the same marigold as every other
  // add-to-cart in the app, so the one button that commits money stays on brand.
  go: 'var(--gb-primary)',
  goInk: 'var(--gb-on-primary)',
  goOff: '#D9DADE',
  step: '#267E3E',        // stepper glyphs
};

const S: Record<string, React.CSSProperties> = {
  scrim: {
    position: 'fixed', inset: 0, zIndex: 50, background: C.scrim,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  sheet: {
    width: '100%', maxWidth: 448, maxHeight: '92vh', display: 'flex', flexDirection: 'column',
    background: C.page, borderRadius: '20px 20px 0 0', overflow: 'hidden',
  },

  body: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  // Square, not 4:3: the no-photo fallback illustration (menuImageSrc) is composed for a
  // square object-fit:cover box - a wider/shorter box crops more off the top and cuts its
  // "No image" text off. Matches the aspect every menu card already uses for the same asset.
  hero: { position: 'relative', width: '100%', aspectRatio: '1 / 1', flex: 'none', background: C.page },
  heroClose: {
    position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderRadius: '50%',
    border: 'none', background: 'rgba(0,0,0,.45)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  contentWrap: { padding: '18px 15px 22px', display: 'flex', flexDirection: 'column', gap: 24 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8 },
  name: { fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: '-.01em', lineHeight: 1.25 },
  mrpRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  mrpStrike: { fontSize: 14, fontWeight: 600, color: C.strike, textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' },
  mrpNow: { fontSize: 16, fontWeight: 800, color: C.ink, fontVariantNumeric: 'tabular-nums' },
  mrpSaved: { fontSize: 11.5, fontWeight: 800, color: C.step },
  bestseller: {
    display: 'inline-flex', alignItems: 'center', gap: 3, width: 'fit-content', marginTop: 8,
    background: 'rgba(30,22,14,.86)', color: '#FFD27A', fontSize: 10, fontWeight: 800,
    padding: '4px 8px 4px 6px', borderRadius: 999, letterSpacing: 0.3,
  },
  description: { fontSize: 13.5, color: C.sub, lineHeight: 1.5, marginTop: 8 },
  sectionHead: { padding: '0 1px 14px' },
  sectionTitle: { fontSize: 15.5, fontWeight: 700, color: C.ink, letterSpacing: '-.005em' },
  rule: { fontSize: 13.5, fontWeight: 400, color: C.sub, marginTop: 3 },
  card: { background: C.card, borderRadius: 12, padding: '0 15px' },

  row: { display: 'flex', alignItems: 'center', gap: 13, minHeight: 54, padding: '9px 0', cursor: 'pointer' },
  rowName: { flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 500, color: C.ink, lineHeight: 1.35 },
  rowPrice: { fontSize: 14.5, fontWeight: 700, color: C.ink, flex: 'none', fontVariantNumeric: 'tabular-nums' },
  rowFree: { color: C.sub, fontWeight: 500 },
  // Ring, not a filled dot: the reference keeps a white gap between rim and centre.
  control: {
    width: 19, height: 19, flex: 'none', border: `2px solid ${C.pickOff}`, background: C.card,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 140ms ease',
  },
  controlOn: { border: `2px solid ${C.pick}` },
  dot: { width: 9, height: 9, borderRadius: 999, background: C.pick },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' },

  footer: {
    display: 'flex', alignItems: 'center', gap: 11, background: C.card, flex: 'none',
    padding: '10px 15px calc(14px + env(safe-area-inset-bottom))',
  },
  stepper: {
    display: 'flex', alignItems: 'center', border: `1px solid ${C.line}`,
    borderRadius: 9, overflow: 'hidden', flex: 'none', height: 46,
  },
  stepBtn: {
    width: 40, height: 44, color: C.step, border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepCount: { minWidth: 26, textAlign: 'center', fontSize: 15.5, fontWeight: 700, color: C.step },
  cta: {
    flex: 1, height: 46, borderRadius: 9, border: 'none', background: C.go, color: C.goInk,
    fontSize: 15.5, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaDivider: { width: 1, height: 15, background: 'rgba(36,22,18,.3)', flex: 'none' },
  ctaTotal: { fontSize: 15.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  ctaOff: { background: C.goOff, color: '#8A8B91', cursor: 'not-allowed' },
};
