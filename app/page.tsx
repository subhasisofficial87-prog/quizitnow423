'use client';

import { LandingNav } from '@/components/layout/LandingNav';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { BoardSelector } from '@/components/landing/BoardSelector';
import { PricingSection } from '@/components/landing/PricingSection';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <AboutSection />
        <BoardSelector />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
