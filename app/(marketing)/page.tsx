import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { DemoRequest } from '@/components/landing/DemoRequest';

export default function MarketingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Swole Gym Management Software',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://swole.in',
    description: 'Gym management software with QR attendance, automated reminders, and membership tracking.',
    offers: {
      '@type': 'Offer',
      price: '4999',
      priceCurrency: 'INR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <DemoRequest />
      </main>
    </>
  );
}
