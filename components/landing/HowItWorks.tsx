import { Building, QrCode, BarChart } from 'lucide-react';

const steps = [
  {
    icon: Building,
    title: 'Create Your Gym Account',
    description: 'Sign up, enter your gym details, and invite staff.',
    step: 1,
  },
  {
    icon: QrCode,
    title: 'Add Members & Generate QR Codes',
    description: 'Each member gets a unique QR code for check-in.',
    step: 2,
  },
  {
    icon: BarChart,
    title: 'Track Attendance & Renewals Automatically',
    description: 'Real-time attendance and renewal reminders — no manual work.',
    step: 3,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12 lg:px-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How Swole Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Get your gym digital in minutes — not days.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Mobile: Vertical timeline line */}
          <div className="md:hidden absolute left-8 top-0 h-full w-[2px] bg-primary/20" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative flex md:flex-col items-start md:items-center text-left md:text-center group hover:scale-105 transition-all duration-300"
                >
                  {/* Step Number Badge (Mobile) */}
                  <div className="md:hidden absolute -left-1 top-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary z-10">
                    {step.step}
                  </div>

                  {/* Icon Circle */}
                  <div className="ml-12 md:ml-0 mb-0 md:mb-6 flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-6 md:ml-0">
                    {/* Step Number (Desktop) */}
                    <div className="hidden md:block text-sm font-bold text-primary mb-2">
                      Step {step.step}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
