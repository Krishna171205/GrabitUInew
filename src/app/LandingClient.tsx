// grabbit/src/app/LandingClient.tsx
'use client';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import AppShowcase from '@/components/landing/AppShowcase';
import FinalCTA from '@/components/landing/FinalCTA';
import ScrollProgress from '@/components/landing/ScrollProgress';
import ScrollQuickNav from '@/components/landing/ScrollQuickNav';
import ScrollParallaxBackground from '@/components/landing/ScrollParallaxBackground';
import LandingFooter from '@/components/landing/LandingFooter';
import SmoothScrollProvider from '@/components/SmoothScroll';

export default function LandingClient() {
  return (
    <SmoothScrollProvider>
      <div className="gb-app relative min-h-screen selection:bg-blue-500 selection:text-white" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
        {/* Radiant Glowing Top Scroll Progress Bar */}
        <ScrollProgress />

        {/* Floating Modern Quick-Nav and Scroll-to-Top Capsule */}
        <ScrollQuickNav />

        {/* Navigation Header */}
        <LandingNav />

        {/* Main Landing Flow with 3D Parallax Background */}
        <main data-landing-root className="relative overflow-hidden">
          <ScrollParallaxBackground />

          <Hero />
          <AppShowcase />
          <FinalCTA />
        </main>

        <LandingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
