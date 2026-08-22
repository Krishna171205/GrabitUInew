'use client';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import AppShowcase from '@/components/landing/AppShowcase';
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
    <div className="gb-app bg-[#F8FAFC] text-[#0F172A] font-sans antialiased min-h-screen w-full overflow-x-clip">
      <LandingNav />
      <main data-landing-root className="relative z-10 w-full overflow-x-clip">
        <Hero />
        <TrustBand />
        <HowItWorks />
        <AppShowcase />
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
