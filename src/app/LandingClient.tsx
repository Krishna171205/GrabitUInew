// grabbit/src/app/LandingClient.tsx
'use client';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import TrustBand from '@/components/landing/TrustBand';
import HowItWorks from '@/components/landing/HowItWorks';
import AppShowcase from '@/components/landing/AppShowcase';
import ProductPreview from '@/components/landing/ProductPreview';
import PartnerPitch from '@/components/landing/PartnerPitch';
import FinalCTA from '@/components/landing/FinalCTA';
import { ReadyToJoinRitual } from '@/components/ReadyToJoinRitual';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingClient() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <LandingNav />
      <main data-landing-root>
        <Hero />
        <TrustBand />
        <HowItWorks />
        <AppShowcase />
        <ProductPreview />
        <PartnerPitch />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
