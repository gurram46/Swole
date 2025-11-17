'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Owner, FitZone Gym, Mumbai',
    content: 'Swole transformed how we manage our gym. QR attendance is a game-changer - no more manual registers!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Manager, PowerHouse Fitness, Delhi',
    content: 'The automated reminders saved us so much time. Members love the QR codes, and we love the dashboard.',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Owner, Iron Paradise, Bangalore',
    content: 'Best investment for our gym. Setup was easy, support is great, and our members are happier.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">
            Loved by Gym Owners Across India
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            See what gym owners are saying about Swole
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="hover:scale-105 transition-all duration-300 hover:shadow-lg touch-manipulation"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <CardContent className="pt-5 md:pt-6 px-5 md:px-6">
                {/* Stars */}
                <div className="flex gap-1 mb-3 md:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="border-t pt-3 md:pt-4">
                  <div className="font-semibold text-sm md:text-base text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
