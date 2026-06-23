'use client';

import { useMemo } from 'react';
import { CircularGallery, type GalleryItem } from '@/components/ui/circular-gallery-2';

export type CafeEntry =
  | { type: 'live'; id: number; slug: string; name: string; location: string }
  | { type: 'soon'; id: string; name: string; location: string };

interface Props {
  items: CafeEntry[];
}

// Real cafe / coffee shop images from Unsplash — cycled across all cafes
const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

export default function CafeCircularGallery({ items }: Props) {
  const galleryItems = useMemo<GalleryItem[]>(
    () =>
      items.map((item, i) => ({
        image: CAFE_IMAGES[i % CAFE_IMAGES.length],
        text: item.name,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length],
  );

  return (
    <div className="relative w-full h-[340px] sm:h-[440px] lg:h-[520px]">

      {/* ── Rotating orange border around the whole component ─────────── */}
      {/* @property lets us animate the conic-gradient start angle directly —
          the element itself never rotates, so no diagonal overflow at corners */}
      <style>{`
        @property --gallery-sweep {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes gallery-border-spin {
          to { --gallery-sweep: 360deg; }
        }
        .gallery-border-ring {
          animation: gallery-border-spin 6s linear infinite;
        }
      `}</style>
      <div
        className="gallery-border-ring absolute pointer-events-none"
        style={{
          inset: 0,
          borderRadius: 28,
          padding: 2,
          background:
            'conic-gradient(from var(--gallery-sweep), #b7122a 0deg, #ffaa00 40deg, rgba(183,18,42,0.12) 80deg, transparent 120deg, transparent 290deg, rgba(183,18,42,0.12) 320deg, #b7122a 360deg)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: 10,
        }}
      />

      {/* ── OGL WebGL gallery ─────────────────────────────────────────── */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        <CircularGallery
          items={galleryItems}
          bend={3}
          borderRadius={0.1}
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </div>
    </div>
  );
}
