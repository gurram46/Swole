import { redirect } from 'next/navigation';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Sparkles, Users, QrCode, Settings, ArrowRight } from 'lucide-react';

export default async function OnboardingPage() {
  const session = await getSessionFromRequest();

  if (!session) {
    redirect('/login');
  }

  // Get gym details
  const gym = await prisma.gym.findUnique({
    where: { id: session.gym_id },
    select: {
      name: true,
      slug: true,
      owner_name: true,
      created_at: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!gym) {
    redirect('/login');
  }

  const hasMembers = gym._count.members > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Swole, {gym.owner_name}! 🎉
          </h1>
          <p className="text-xl text-gray-400">
            Your gym <span className="text-purple-400 font-semibold">{gym.name}</span> is ready to go
          </p>
          <p className="text-sm text-gray-500 mt-2">
            15-day free trial started • No credit card required
          </p>
        </div>

        {/* Setup Checklist */}
        <Card className="border-white/10 bg-card/50 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Get Started in 3 Easy Steps</CardTitle>
            <CardDescription>
              Complete these steps to start managing your gym efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Add Members */}
            <div className="flex items-start space-x-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {hasMembers ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Add Your First Member
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Start by adding your gym members. Each member gets a unique QR code for easy check-ins.
                </p>
                <Link href="/dashboard/members/add">
                  <Button size="sm" variant={hasMembers ? "outline" : "default"}>
                    {hasMembers ? 'Add More Members' : 'Add First Member'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 2: Test QR Scanner */}
            <div className="flex items-start space-x-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <Circle className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  Test the QR Scanner
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Try scanning a member's QR code to mark attendance. It's instant and hassle-free!
                </p>
                <Link href="/dashboard/scanner">
                  <Button size="sm" variant="outline">
                    Open Scanner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 3: Configure Settings */}
            <div className="flex items-start space-x-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <Circle className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  Customize Your Settings
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Set up email reminders, update gym details, and configure your preferences.
                </p>
                <Link href="/dashboard/settings">
                  <Button size="sm" variant="outline">
                    Go to Settings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-white/10 bg-card/50 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle>Your Gym at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-3xl font-bold text-purple-400">{gym._count.members}</div>
                <div className="text-sm text-gray-400 mt-1">Members</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400">15</div>
                <div className="text-sm text-gray-400 mt-1">Trial Days</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-3xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-400 mt-1">Members Limit</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-3xl font-bold text-orange-400">✓</div>
                <div className="text-sm text-gray-400 mt-1">All Features</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Need help? Check out our{' '}
            <a href="#" className="text-purple-400 hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="#" className="text-purple-400 hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
