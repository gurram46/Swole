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
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-24 md:-left-48 w-64 h-64 md:w-96 md:h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 md:-right-48 w-64 h-64 md:w-96 md:h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-b from-transparent to-black/50" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left">
          <div className="inline-block mb-4 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-xs md:text-sm font-medium text-primary">🚀 Trusted by 100+ Gyms Across India</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent animate-gradient">
              Swole
            </span>
            <br />
            <span className="text-foreground">
              Gym Management Software for Indian Fitness Centers
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            QR-based attendance, membership tracking, renewals, and automated reminders — built for Indian gyms that want to run smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Link href="/signup" aria-label="Start your free trial of Swole gym management software" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base group touch-manipulation">
                Start Free Trial
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="ghost" 
              className="w-full sm:w-auto text-base border border-border hover:border-primary touch-manipulation" 
              onClick={scrollToHowItWorks}
              aria-label="Learn how Swole gym management software works"
            >
              See How It Works
            </Button>
            <Link href="/login" aria-label="Login to your Swole gym management account" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base touch-manipulation">
                Login
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-xs sm:text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>15-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
