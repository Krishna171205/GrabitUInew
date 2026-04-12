'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
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

      {/* ── Moving orange border ──────────────────────────────────────────
          CSS mask technique: the conic-gradient fills the element, but the
          mask punches out the content area, leaving only the 4px border ring
          visible. No inner fill div, no background-color matching needed.
      ─────────────────────────────────────────────────────────────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          borderRadius: 28,
          padding: 4,
          background:
            'conic-gradient(from 0deg, #ff6b00 0deg, #ffaa00 50deg, rgba(255,107,0,0.15) 90deg, transparent 130deg, transparent 300deg, rgba(255,107,0,0.15) 330deg, #ff6b00 360deg)',
          // Mask: show only the 4px padding ring, punch out the content centre
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: 10,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Subtle static base border so the shape is always visible */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          borderRadius: 28,
          border: '1.5px solid rgba(255,107,0,0.12)',
          zIndex: 9,
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
