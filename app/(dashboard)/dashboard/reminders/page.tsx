'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Bell,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
} from 'lucide-react';

interface ReminderStatus {
  expiringSoonCount: number;
  expiredTodayCount: number;
  lastRunAt: string | null;
  lastRunManual: boolean;
}

export default function RemindersPage() {
  const [status, setStatus] = useState<ReminderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reminders/status');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load reminder status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reminder status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      setSending(true);
      const response = await fetch('/api/reminders/run?manual=1', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Reminder Sent',
          description: `Successfully sent ${data.summary.emailsSent} reminder email(s)`,
        });
        await fetchStatus();
      } else {
        toast({
          title: 'Failed',
          description: data.error || 'Failed to send reminders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminders',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const hasExpiringMembers =
    (status?.expiringSoonCount || 0) + (status?.expiredTodayCount || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membership Reminders</h1>
        <p className="text-muted-foreground mt-2">
          Automated email reminders for expiring memberships
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired Today</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.expiredTodayCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Memberships that expired today
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.expiringSoonCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expiring in next 3 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Trigger Card */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Reminder Email
              </CardTitle>
              <CardDescription className="mt-2">
                Manually trigger a reminder email to be sent to your registered email
              </CardDescription>
            </div>
            {hasExpiringMembers && (
              <Badge variant="destructive" className="ml-4">
                {(status?.expiringSoonCount || 0) + (status?.expiredTodayCount || 0)} Members
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasExpiringMembers ? (
            <>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-500">Action Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have {status?.expiredTodayCount || 0} member(s) whose membership
                      expired today and {status?.expiringSoonCount || 0} member(s) expiring in
                      the next 3 days.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendReminder}
                disabled={sending}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reminder...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder Now
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-sm text-muted-foreground">
                No memberships expiring in the next 3 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Run Info */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Reminder History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.lastRunAt ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Last Reminder Sent</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(status.lastRunAt), 'PPP p')}
                    </p>
                  </div>
                </div>
                <Badge variant={status.lastRunManual ? 'default' : 'secondary'}>
                  {status.lastRunManual ? 'Manual' : 'Automatic'}
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-500">Automated Reminders</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reminders are automatically sent every day at 7:00 AM IST via Vercel Cron.
                      You can also send manual reminders anytime using the button above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No reminders have been sent yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Automated Reminder Setup</CardTitle>
          <CardDescription>
            Configure Vercel Cron for daily automated reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                To enable daily automated reminders at 7:00 AM IST, add this configuration to
                your <code className="text-xs bg-primary/10 px-2 py-1 rounded">vercel.json</code>{' '}
                file:
              </p>
              <pre className="bg-black/50 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "crons": [
    {
      "path": "/api/reminders/run",
      "schedule": "0 7 * * *",
      "timezone": "Asia/Kolkata"
    }
  ]
}`}
              </pre>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm">
                <strong>Note:</strong> Vercel Cron is available on Pro and Enterprise plans.
                Manual reminders work on all plans.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
