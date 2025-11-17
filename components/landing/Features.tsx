import { QrCode, BellRing, Users, BarChart3, Smartphone, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: QrCode,
    title: 'QR Attendance',
    description: 'Members scan on entry. No registers, no manual work.',
  },
  {
    icon: BellRing,
    title: 'Auto Renewals',
    description: 'Send reminders before membership expires.',
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'Add, track, renew, and deactivate members easily.',
  },
  {
    icon: BarChart3,
    title: 'Attendance Dashboard',
    description: 'See daily check-ins, trends, and performance.',
  },
  {
    icon: Smartphone,
    title: 'Multi-Device Support',
    description: 'Works on any phone, tablet, or laptop.',
  },
  {
    icon: ShieldCheck,
    title: 'Staff Access',
    description: 'Give staff limited access with secure role-based control.',
  },
];

export function Features() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 bg-background" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything Your Gym Needs
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple tools that help you manage members, attendance, renewals, and operations — without the headache.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:scale-[1.02] transition-all duration-200"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl" role="heading" aria-level={3}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
