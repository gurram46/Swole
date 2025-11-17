'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[85vh] flex items-center justify-center md:justify-start overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black/50" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl px-6 md:px-12 lg:px-16">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Swole
          </span>
          <br />
          <span className="text-foreground">
            Gym Management Software for Indian Fitness Centers
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          QR-based attendance, membership tracking, renewals, and automated reminders — built for Indian gyms that want to run smarter, not harder.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" aria-label="Start your free trial of Swole gym management software">
            <Button size="lg" className="text-base">
              Start Free Trial
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="ghost" 
            className="text-base" 
            onClick={scrollToHowItWorks}
            aria-label="Learn how Swole gym management software works"
          >
            See How It Works
          </Button>
          <Link href="/login" aria-label="Login to your Swole gym management account">
            <Button size="lg" variant="outline" className="text-base">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
