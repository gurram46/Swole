'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function DemoRequest() {
  const [formData, setFormData] = useState({
    fullName: '',
    gymName: '',
    phone: '',
    city: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.gymName || !formData.phone || !formData.city) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    // Validate phone number
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      showNotification('error', 'Phone number must be 10-13 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Demo request submitted! We\'ll contact you soon.');
        setFormData({
          fullName: '',
          gymName: '',
          phone: '',
          city: '',
          message: '',
        });
      } else {
        showNotification('error', data.error || 'Something went wrong');
      }
    } catch (error) {
      showNotification('error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Request a Free Live Demo
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            We'll show you how Swole can automate your gym in minutes.
          </p>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-destructive/10 border-destructive text-destructive'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Fill in your details and we'll reach out</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Your name"
                    className="focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gymName">
                    Gym Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gymName"
                    value={formData.gymName}
                    onChange={(e) =>
                      setFormData({ ...formData, gymName: e.target.value })
                    }
                    placeholder="Your gym name"
                    className="focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    className="focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Your city"
                    className="focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us about your gym..."
                    className="focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Demo'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Contact Card */}
          <div className="space-y-6">
            <Card className="border-border shadow-lg">
              <CardHeader>
                <CardTitle>Prefer Talking Directly?</CardTitle>
                <CardDescription>
                  Reach us on WhatsApp anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="https://wa.me/9491628410"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                >
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-muted-foreground">
                      +91 94916 28410
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:contact@quantumworks.services"
                  className="flex items-center gap-3 p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors border border-secondary/20"
                >
                  <Mail className="w-6 h-6 text-secondary" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm text-muted-foreground">
                      contact@quantumworks.services
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Quick Response:</strong> We
                  typically respond within 2 hours during business hours (9 AM - 7 PM
                  IST).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
