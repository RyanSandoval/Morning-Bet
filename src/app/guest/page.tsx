'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function GuestLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const loginAsGuest = async () => {
      try {
        const response = await fetch('/api/auth/guest', {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create guest account');
        }

        router.push('/dashboard');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    };

    loginAsGuest();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {error ? 'Error' : 'Creating Guest Account'}
          </CardTitle>
          <CardDescription>
            {error ? error : 'Please wait...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {!error && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
        </CardContent>
      </Card>
    </div>
  );
}
