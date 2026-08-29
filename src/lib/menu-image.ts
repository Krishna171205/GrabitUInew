/**
 * What to show for a menu item the cafe has not photographed.
 *
 * Grabit used to stand a stock Unsplash photo in by category, so an unphotographed
 * item appeared with a professional picture of some other cafe's food. A customer
 * cannot tell that apart from a real photo of what they are ordering, which is the
 * one thing a menu photo is for. The shared fallback is visibly a placeholder.
 *
 * Same asset the Omega POS uses, so a cafe sees one consistent stand-in whether it
 * is looking at its own till or its Grabit storefront.
 *
 * The filename is versioned on purpose: the object is served with a one-year
 * immutable cache-control, so replacing the artwork means a new key. Changing the
 * art again means -v3, not a re-upload over the top of this one.
 */
export const MENU_IMAGE_FALLBACK =
  'https://d1k5bio7n5wlqi.cloudfront.net/shared/menu-fallback-v2.png';

/** An item's own photo, or the fallback. Blank strings count as absent. */
export function menuImageSrc(imageUrl: string | null | undefined): string {
  const url = imageUrl?.trim();
  return url ? url : MENU_IMAGE_FALLBACK;
}
