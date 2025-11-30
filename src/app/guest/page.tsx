'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function GuestLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState('');

  const loginAsGuest = async () => {
    setIsLoading(true);
    setError('');
    setDetails('');

    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Get response text first to see what we're dealing with
      const text = await response.text();
      setDetails(`Status: ${response.status}, Response: ${text.substring(0, 200)}`);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  useEffect(() => {
    loginAsGuest();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {error ? 'Error' : 'Creating Guest Account'}
          </CardTitle>
          <CardDescription className="break-words">
            {error ? error : 'Please wait...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {isLoading && !error && <Loader2 className="w-8 h-8 animate-spin text-primary" />}

          {error && (
            <>
              {details && (
                <p className="text-xs text-muted-foreground break-all max-w-full">
                  {details}
                </p>
              )}
              <Button onClick={loginAsGuest} className="mt-4">
                Try Again
              </Button>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to Login
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
