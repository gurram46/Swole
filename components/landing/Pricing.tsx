import { Sparkles, Dumbbell, ShieldCheck, Building2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const pricingTiers = [
  {
    name: 'Free Trial',
    icon: Sparkles,
    price: '15 days free',
    description: 'Try everything before you commit',
    features: [
      'All features included',
      'No credit card required',
      'Full access for 15 days',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Starter',
    icon: Dumbbell,
    price: '₹3,500',
    period: '/month',
    description: 'For gyms with < 50 members',
    features: [
      'QR attendance',
      'Staff access',
      'Reminder automation',
      'Member management',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Standard',
    icon: ShieldCheck,
    price: '₹5,000',
    period: '/month',
    description: 'For gyms with 50–150 members',
    features: [
      'QR attendance',
      'Staff access',
      'Reminder automation',
      'Member management',
      'Analytics dashboard',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: ShieldCheck,
    price: '₹8,000',
    period: '/month',
    description: 'For gyms with 150–300 members',
    features: [
      'Everything in Standard',
      'Multi-branch support',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    description: 'For gyms with 300+ members',
    features: [
      'Dedicated onboarding',
      'Custom integrations',
      'SLA-backed support',
      'Feature expansion',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            No hidden fees. No long-term contracts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.highlighted
                    ? 'border-primary shadow-lg shadow-primary/20 hover:shadow-primary/30'
                    : 'hover:border-primary/50'
                } transition-all duration-300`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
