'use client';

import { Users, Building2, QrCode, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    value: '100+',
    label: 'Gyms Using Swole',
  },
  {
    icon: Users,
    value: '10,000+',
    label: 'Members Managed',
  },
  {
    icon: QrCode,
    value: '50,000+',
    label: 'QR Scans Daily',
  },
  {
    icon: TrendingUp,
    value: '99.9%',
    label: 'Uptime',
  },
];

export function Stats() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center group hover:scale-105 transition-transform duration-300 touch-manipulation"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground px-2">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
