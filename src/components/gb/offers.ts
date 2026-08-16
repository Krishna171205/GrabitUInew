/** Live cafe offers, as returned by GET /api/grabit/offers/{slug}. */
export interface GrabbitOffer {
  id: number;
  cafe_id: number;
  title: string;
  description: string | null;
  offer_type: 'PERCENT' | 'FLAT' | 'FIRST_ORDER' | 'FREE_ITEM';
  percent_off: number | null;
  flat_off: number | null;
  max_discount: number | null;
  min_order_value: number | null;
  ends_at: string | null;
  free_item_menu_item_id: number | null;
  free_item_name: string | null;
  free_item_price: number | null;
}

/** Short "what you get" line, e.g. "20% off" or "Free Cold Coffee". */
export function offerHeadline(o: GrabbitOffer): string {
  switch (o.offer_type) {
    case 'PERCENT': return `${o.percent_off ?? 0}% off`;
    case 'FLAT': return `₹${o.flat_off ?? 0} off`;
    case 'FREE_ITEM': return `Free ${o.free_item_name ?? 'item'}`;
    // FIRST_ORDER is a percent offer that only applies to a customer's first order
    // at that cafe, so say both rather than falling back to the cafe's own title.
    case 'FIRST_ORDER': return o.percent_off != null ? `${o.percent_off}% off your first order` : o.title;
    default: return o.title;
  }
}

/** The conditions worth showing up front, in the order a customer reads them. */
export function offerTerms(o: GrabbitOffer): string[] {
  const terms: string[] = [];
  if (o.min_order_value != null) terms.push(`On orders above ₹${o.min_order_value}`);
  if (o.offer_type === 'PERCENT' && o.max_discount != null) terms.push(`Up to ₹${o.max_discount} off`);
  if (o.ends_at) {
    const till = new Date(o.ends_at);
    if (!Number.isNaN(till.getTime())) {
      terms.push(`Valid till ${till.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
    }
  }
  return terms;
}
