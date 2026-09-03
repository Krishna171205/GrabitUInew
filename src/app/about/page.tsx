import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import AboutPeppermintSection from '@/components/landing/AboutPeppermintSection';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Grabbit | Pre-Order from Campus Cafes in Minutes',
  description: 'Skip the line, grab food in seconds. Discover how Grabbit eliminates campus queue friction with instant pre-ordering and honest live prep times.',
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="gb-app min-h-screen bg-[#0A0F1E] text-white">
      <LandingNav />
      <main>
        <AboutPeppermintSection />
      </main>
      <LandingFooter />
    </div>
  );
}
