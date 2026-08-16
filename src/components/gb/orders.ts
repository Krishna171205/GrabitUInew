/** Shared "did this actually become an order?" rule, used by the Orders tab and the profile stats. */
export interface OrderLike {
  status: string;
  payment_method: string;
  payment_status: string;
}

/**
 * An online order whose payment never resolved (pending) or failed never became a
 * real order to the customer: the row exists server-side only so Cashfree has
 * something to attach a payment session to. Cancelled orders don't count either.
 */
export function isRealOrder(o: OrderLike): boolean {
  if (o.status === 'cancelled') return false;
  if (o.payment_method === 'online' && (o.payment_status === 'pending' || o.payment_status === 'failed')) return false;
  return true;
}
