'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDevLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Dev login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Swole</CardTitle>
          <CardDescription>Development Login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Dev Bypass Login
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Development only - bypasses OTP authentication
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
