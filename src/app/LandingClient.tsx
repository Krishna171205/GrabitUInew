'use client';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import TrustBand from '@/components/landing/TrustBand';
import HowItWorks from '@/components/landing/HowItWorks';
import TimeSaved from '@/components/landing/TimeSaved';
import CafeDiscovery from '@/components/landing/CafeDiscovery';
import ProductPreview from '@/components/landing/ProductPreview';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';
import PartnerPitch from '@/components/landing/PartnerPitch';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import { ReadyToJoinRitual } from '@/components/ReadyToJoinRitual';

export default function LandingClient() {
  return (
    <div className="gb-app bg-[#FDFBF7] text-[#1A1311] font-sans antialiased min-h-screen">
      <LandingNav />
      <main data-landing-root>
        <Hero />
        <TrustBand />
        <HowItWorks />
        <TimeSaved />
        <CafeDiscovery />
        <ProductPreview />
        <TestimonialsCarousel />
        <PartnerPitch />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
      {/* ReadyToJoinRitual carries policy links & footer curtain */}
      <ReadyToJoinRitual />
    </div>
  );
}
