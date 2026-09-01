import Image from 'next/image';

/**
 * A faint cup-in-hand silhouette bleeding off the hero's edge - the brand
 * object as background texture, the way the login hero uses two soft circles.
 * Sized and positioned to clear both the avatar above it and the search bar
 * below - the source art is taller than it is wide, so it runs out of room
 * fast in the gap between them. next/image handles format negotiation (the
 * source PNG is ~240KB; served as WebP/AVIF at the ~160px this actually
 * renders at, it's a fraction of that) and this being a background decoration
 * on the app's highest-traffic screen makes that worth having over a plain
 * <img>.
 */
export function HeroCupWatermark({ top = '17%', maxWidth = 160 }: { top?: string; maxWidth?: number }) {
  return (
    <Image
      src="/hero/cup-watermark.png"
      alt=""
      aria-hidden="true"
      width={700}
      height={822}
      sizes="(max-width: 480px) 35vw, 160px"
      style={{ position: 'absolute', top, right: '-4%', width: '35%', maxWidth, height: 'auto', opacity: 0.14 }}
    />
  );
}
