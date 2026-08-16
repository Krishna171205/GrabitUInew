/**
 * What to offer alongside what is already in the cart: a dip with fries, cheese on a
 * burger or maggi, a drink with a meal that has none. Pure so the rules can be checked
 * without a browser.
 */
import type { GrabbitMenuItem } from '@gradient365/gradient-commons';

export interface Pairing {
  /** Line shown on the collapsed strip, phrased as the question it is. */
  prompt: string;
  items: GrabbitMenuItem[];
}

/** Max drinks offered, so the sheet stays a suggestion and not a second menu. */
const MAX_DRINKS = 6;

const isDrink = (i: GrabbitMenuItem) => i.category === 'drinks';
const inSub = (i: GrabbitMenuItem, sub: string) =>
  (i.subcategory_name ?? '').toLowerCase() === sub || i.name.toLowerCase().includes(sub);

const isFries = (i: GrabbitMenuItem) => inSub(i, 'fries');
const isBurger = (i: GrabbitMenuItem) => inSub(i, 'burger');
const isMaggi = (i: GrabbitMenuItem) => inSub(i, 'maggi');

/** The add-on items themselves, matched by name inside the addons category. */
const addon = (items: GrabbitMenuItem[], match: RegExp) =>
  items.find((i) => i.category === 'addons' && match.test(i.name) && i.is_available);

export function pairingsFor(items: GrabbitMenuItem[], cartItemIds: number[]): Pairing[] {
  const inCart = new Set(cartItemIds);
  if (inCart.size === 0) return [];

  const cart = items.filter((i) => inCart.has(i.id));
  const suggest = (i: GrabbitMenuItem | undefined): i is GrabbitMenuItem =>
    !!i && i.is_available && !inCart.has(i.id);

  const out: Pairing[] = [];

  // A meal with nothing to drink. First, because it is the biggest gap on the order.
  if (cart.some((i) => !isDrink(i)) && !cart.some(isDrink)) {
    const drinks = items
      .filter((i) => isDrink(i) && i.is_available && !inCart.has(i.id))
      .sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller))
      .slice(0, MAX_DRINKS);
    const water = addon(items, /water/i);
    const withWater = suggest(water) ? [...drinks, water] : drinks;
    if (withWater.length > 0) {
      out.push({ prompt: 'Something to drink with your meal?', items: withWater });
    }
  }

  const dip = addon(items, /dip/i);
  if (cart.some(isFries) && suggest(dip)) {
    out.push({ prompt: 'Add a dip for your fries?', items: [dip] });
  }

  const cheese = addon(items, /cheese/i);
  if (cart.some((i) => isBurger(i) || isMaggi(i)) && suggest(cheese)) {
    out.push({ prompt: 'Add extra cheese?', items: [cheese] });
  }

  return out;
}
