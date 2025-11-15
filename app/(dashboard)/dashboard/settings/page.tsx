import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building, Mail, Phone, User } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your gym profile and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Gym Information
            </CardTitle>
            <CardDescription>Update your gym details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gym-name">Gym Name</Label>
              <Input
                id="gym-name"
                placeholder="Your Gym Name"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="gym-slug">Gym Slug</Label>
              <Input
                id="gym-slug"
                placeholder="your-gym-slug"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Owner Information
            </CardTitle>
            <CardDescription>Update owner contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input
                id="owner-name"
                placeholder="John Doe"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="owner-email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="owner-email"
                type="email"
                placeholder="owner@gym.com"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="owner-phone">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </Label>
              <Input
                id="owner-phone"
                type="tel"
                placeholder="+91 9876543210"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-card/50 backdrop-blur border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full md:w-auto">
            Delete Gym Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
