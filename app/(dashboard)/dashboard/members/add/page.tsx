'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  membership_start: z.string().min(1, 'Start date is required'),
  membership_duration: z.enum(['1', '3', '6', '12']),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [membershipEnd, setMembershipEnd] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      membership_duration: '1',
    },
  });

  const startDate = watch('membership_start');
  const duration = watch('membership_duration');

  // Auto-calculate membership end date
  useEffect(() => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const months = parseInt(duration);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      setMembershipEnd(end.toISOString().split('T')[0]);
    }
  }, [startDate, duration]);

  const onSubmit = async (data: MemberFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          membership_start: data.membership_start,
          membership_end: membershipEnd,
          notes: data.notes || '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/members');
        }, 1500);
      } else {
        alert(result.error || 'Failed to add member');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-white/10 bg-card/50 backdrop-blur max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Member Added!</h2>
            <p className="text-muted-foreground">
              Redirecting to members list...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
          <p className="text-muted-foreground mt-2">
            Enter member details to add them to your gym.
          </p>
        </div>
      </div>

      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Doe"
                  className="focus:ring-2 focus:ring-primary"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="9876543210"
                  maxLength={10}
                  className="focus:ring-2 focus:ring-primary"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="membership_start">Membership Start *</Label>
                <Input
                  id="membership_start"
                  type="date"
                  {...register('membership_start')}
                  className="focus:ring-2 focus:ring-primary"
                />
                {errors.membership_start && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.membership_start.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="membership_duration">Duration *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue('membership_duration', value as any)
                  }
                  defaultValue="1"
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
                {errors.membership_duration && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.membership_duration.message}
                  </p>
                )}
              </div>
            </div>

            {membershipEnd && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm">
                  <span className="font-semibold">Membership End Date:</span>{' '}
                  {new Date(membershipEnd).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional notes about the member..."
                className="focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Member...
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
              <Link href="/dashboard/members" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
