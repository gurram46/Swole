'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Building, Mail, Phone, User, Lock, Loader2, Check, X, AlertTriangle, Download } from 'lucide-react';

interface GymData {
  gym_name: string;
  gym_slug: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

interface AdminData {
  email: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [gymData, setGymData] = useState<GymData>({
    gym_name: '',
    gym_slug: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
  });
  
  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [gymLoading, setGymLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [gymRes, adminRes] = await Promise.all([
        fetch('/api/settings/gym'),
        fetch('/api/settings/admin'),
      ]);

      const gymResult = await gymRes.json();
      const adminResult = await adminRes.json();

      if (gymResult.success && gymResult.gym) {
        setGymData({
          gym_name: gymResult.gym.name,
          gym_slug: gymResult.gym.slug,
          owner_name: gymResult.gym.owner_name,
          owner_email: gymResult.gym.owner_email,
          owner_phone: gymResult.gym.owner_phone,
        });
        setOriginalSlug(gymResult.gym.slug);
      }

      if (adminResult.success && adminResult.admin) {
        setAdminData({
          email: adminResult.admin.email,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (slug === originalSlug) {
      setSlugAvailable(true);
      return;
    }

    if (!slug || slug.length < 2) {
      setSlugAvailable(false);
      return;
    }

    setSlugChecking(true);
    try {
      const response = await fetch('/api/gym/check-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();
      setSlugAvailable(data.available);
    } catch (error) {
      console.error('Slug check error:', error);
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setGymData(prev => ({ ...prev, gym_slug: cleanSlug }));
    setSlugAvailable(null);
  };

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!gymData.gym_name || !gymData.gym_slug || !gymData.owner_name || !gymData.owner_email || !gymData.owner_phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{10}$/.test(gymData.owner_phone)) {
      toast({
        title: 'Invalid Phone',
        description: 'Phone must be exactly 10 digits',
        variant: 'destructive',
      });
      return;
    }

    if (gymData.gym_slug !== originalSlug && slugAvailable !== true) {
      toast({
        title: 'Slug Unavailable',
        description: 'Please check if the slug is available',
        variant: 'destructive',
      });
      return;
    }

    setGymLoading(true);
    try {
      const response = await fetch('/api/settings/gym', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gymData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Gym settings updated successfully',
        });
        setOriginalSlug(gymData.gym_slug);
        setSlugAvailable(null);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update gym settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Update gym error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update gym settings',
        variant: 'destructive',
      });
    } finally {
      setGymLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch('/api/settings/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Admin email updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update admin email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Update admin error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin email',
        variant: 'destructive',
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'New password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'New password and confirmation must match',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Password changed successfully',
        });
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to change password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your gym profile and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gym Information */}
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-500" />
              Gym Information
            </CardTitle>
            <CardDescription>Update your gym details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGymSubmit} className="space-y-4">
              <div>
                <Label htmlFor="gym-name">Gym Name *</Label>
                <Input
                  id="gym-name"
                  value={gymData.gym_name}
                  onChange={(e) => setGymData(prev => ({ ...prev, gym_name: e.target.value }))}
                  placeholder="Your Gym Name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gym-slug">Gym Slug *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="gym-slug"
                    value={gymData.gym_slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="your-gym-slug"
                    required
                  />
                  {gymData.gym_slug !== originalSlug && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => checkSlugAvailability(gymData.gym_slug)}
                      disabled={slugChecking}
                    >
                      {slugChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                    </Button>
                  )}
                </div>
                {slugAvailable === true && gymData.gym_slug !== originalSlug && (
                  <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                    <Check className="w-4 h-4" /> Slug is available
                  </p>
                )}
                {slugAvailable === false && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <X className="w-4 h-4" /> Slug is not available
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="owner-name">Owner Name *</Label>
                <Input
                  id="owner-name"
                  value={gymData.owner_name}
                  onChange={(e) => setGymData(prev => ({ ...prev, owner_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="owner-email">Owner Email *</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={gymData.owner_email}
                  onChange={(e) => setGymData(prev => ({ ...prev, owner_email: e.target.value }))}
                  placeholder="owner@gym.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="owner-phone">Owner Phone *</Label>
                <Input
                  id="owner-phone"
                  value={gymData.owner_phone}
                  onChange={(e) => setGymData(prev => ({ ...prev, owner_phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="9876543210"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={gymLoading}>
                {gymLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Gym Settings'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Profile */}
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Admin Profile
            </CardTitle>
            <CardDescription>Update your admin account email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Admin Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ email: e.target.value })}
                  placeholder="admin@gym.com"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Changing your email will require you to log in again
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={adminLoading}>
                {adminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Admin Email'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            Security Settings
          </CardTitle>
          <CardDescription>Change your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="old-password">Current Password *</Label>
              <Input
                id="old-password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm-new-password">Confirm New Password *</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" disabled className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            <Button variant="destructive" disabled className="flex-1">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Deactivate Gym
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            These features are coming soon. Contact support if you need assistance.
          </p>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
