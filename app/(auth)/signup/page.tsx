'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, ArrowRight, Building2, User, Shield, Loader2, Check, X } from 'lucide-react';

interface FormData {
  gym_name: string;
  gym_slug: string;
  gym_address: string;
  city: string;
  state: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
  confirm_password: string;
}

const initialFormData: FormData = {
  gym_name: '',
  gym_slug: '',
  gym_address: '',
  city: '',
  state: '',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  password: '',
  confirm_password: '',
};

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast} = useToast();
  const router = useRouter();

  // Auto-generate slug from gym name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleGymNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gym_name: value,
      gym_slug: generateSlug(value),
    }));
    setSlugAvailable(null);
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 2) {
      toast({
        title: 'Invalid Slug',
        description: 'Slug must be at least 2 characters',
        variant: 'destructive',
      });
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
      
      if (!data.available) {
        toast({
          title: 'Slug Unavailable',
          description: 'This gym URL is already taken. Please choose another.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Slug check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to check slug availability',
        variant: 'destructive',
      });
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, gym_slug: cleanSlug }));
    setSlugAvailable(null);
  };

  const validateStep1 = () => {
    const { gym_name, gym_slug, city, state } = formData;
    if (!gym_name.trim() || !gym_slug.trim() || !city.trim() || !state.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(gym_slug)) {
      toast({
        title: 'Invalid Slug',
        description: 'Slug can only contain lowercase letters, numbers, and hyphens',
        variant: 'destructive',
      });
      return false;
    }
    
    if (slugAvailable === false) {
      toast({
        title: 'Slug Unavailable',
        description: 'Please choose a different gym slug',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { owner_name, owner_email, owner_phone, password, confirm_password } = formData;
    if (!owner_name.trim() || !owner_email.trim() || !owner_phone.trim() || !password || !confirm_password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }
    
    // RFC 5322 basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(owner_email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }
    
    // 10-digit phone validation
    if (!/^\d{10}$/.test(owner_phone)) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return false;
    }
    
    // Password validation
    if (password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return false;
    }
    
    // Password match validation
    if (password !== confirm_password) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please ensure both passwords are identical',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      // Check slug if not already checked
      if (slugAvailable === null) {
        await checkSlugAvailability(formData.gym_slug);
        return;
      }
      
      if (slugAvailable) {
        setStep(2);
      }
    } else if (step === 2) {
      if (!validateStep2()) return;
      await sendOTP();
    }
  };

  const sendOTP = async (isResend = false) => {
    if (resendCooldown > 0 && isResend) {
      toast({
        title: 'Please Wait',
        description: `You can resend OTP in ${resendCooldown} seconds`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.owner_email }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (!isResend) {
          setStep(3);
        }
        toast({
          title: isResend ? 'OTP Resent' : 'OTP Sent',
          description: 'Please check your email for the verification code',
        });
        
        // Start 30-second cooldown
        setResendCooldown(30);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Check if it's a duplicate email error
        if (response.status === 409) {
          toast({
            title: 'Email Already Registered',
            description: 'This email is already registered. Please use the login page or try a different email.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to send OTP',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // First verify OTP
      const verifyResponse = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.owner_email, 
          otp 
        }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        // Handle specific error cases
        if (verifyResponse.status === 410) {
          toast({
            title: 'OTP Expired',
            description: 'Your OTP has expired. Please request a new one.',
            variant: 'destructive',
          });
        } else if (verifyResponse.status === 400) {
          toast({
            title: 'Invalid OTP',
            description: 'The OTP you entered is incorrect. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Verification Failed',
            description: verifyData.error || 'Invalid OTP',
            variant: 'destructive',
          });
        }
        setLoading(false);
        return;
      }

      // Now finalize registration
      const registerResponse = await fetch('/api/auth/register-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const registerData = await registerResponse.json();
      
      if (registerData.success) {
        toast({
          title: 'Success!',
          description: 'Your gym has been created. Welcome to Swole!',
        });
        
        // Clear form data
        setFormData(initialFormData);
        setOtp('');
        setSlugAvailable(null);
        
        // Redirect to onboarding
        setTimeout(() => {
          router.push('/dashboard/onboarding');
        }, 1000);
      } else {
        // Handle specific registration errors
        if (registerResponse.status === 409) {
          toast({
            title: 'Email or Slug Already Taken',
            description: registerData.error || 'This email or gym slug is already registered.',
            variant: 'destructive',
          });
        } else if (registerResponse.status === 410) {
          toast({
            title: 'Verification Expired',
            description: 'Your verification has expired. Please start the signup process again.',
            variant: 'destructive',
          });
          // Reset to step 1
          setStep(1);
          setOtp('');
        } else {
          toast({
            title: 'Registration Failed',
            description: registerData.error || 'Failed to create gym',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // Reset OTP when going back from step 3
      if (step === 3) {
        setOtp('');
      }
      setStep(step - 1);
    }
  };

  const handleChangeEmail = () => {
    setStep(2);
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i < step
                      ? 'bg-green-600 text-white'
                      : i === step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-20 h-1 mx-2 transition-all ${
                      i < step ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-400">
            Step {step} of 3
          </div>
        </div>

        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {step === 1 && <Building2 className="w-12 h-12 text-purple-500" />}
              {step === 2 && <User className="w-12 h-12 text-purple-500" />}
              {step === 3 && <Shield className="w-12 h-12 text-purple-500" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === 1 && 'Gym Information'}
              {step === 2 && 'Owner Details'}
              {step === 3 && 'Verify Email'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about your gym'}
              {step === 2 && 'Your contact information'}
              {step === 3 && 'Enter the verification code sent to your email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1: Gym Information */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gym_name">Gym Name *</Label>
                  <Input
                    id="gym_name"
                    value={formData.gym_name}
                    onChange={(e) => handleGymNameChange(e.target.value)}
                    placeholder="Enter your gym name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gym_slug">Gym URL Slug *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="gym_slug"
                      value={formData.gym_slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="your-gym-name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => checkSlugAvailability(formData.gym_slug)}
                      disabled={slugChecking || !formData.gym_slug}
                    >
                      {slugChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                    </Button>
                  </div>
                  {slugAvailable === true && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Slug is available
                    </p>
                  )}
                  {slugAvailable === false && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <X className="w-4 h-4" /> Slug is not available
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    This will be your gym's unique URL: swole.gym/{formData.gym_slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gym_address">Address (Optional)</Label>
                  <Input
                    id="gym_address"
                    value={formData.gym_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, gym_address: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Owner Information */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Full Name *</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_email">Email Address *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Phone Number *</Label>
                  <Input
                    id="owner_phone"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="10-digit phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    placeholder="Re-enter your password"
                  />
                </div>
              </>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-400">
                    We've sent a 6-digit verification code to:
                  </p>
                  <p className="font-medium text-purple-400">{formData.owner_email}</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleChangeEmail}
                    className="text-xs text-gray-500 hover:text-purple-400"
                  >
                    Wrong email? Change it
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={verifyAndRegister}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Your Gym...
                    </>
                  ) : (
                    'Verify & Create Gym'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendOTP(true)}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Didn\'t receive code? Resend'}
                  </Button>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      {step === 2 ? 'Send OTP' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:underline">
              Sign in
            </Link>
          </p>
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(1);
                setFormData(initialFormData);
                setOtp('');
                setSlugAvailable(null);
              }}
              className="text-xs text-gray-500"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
