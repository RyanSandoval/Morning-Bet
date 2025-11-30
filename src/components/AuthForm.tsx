'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData(formRef.current!);
      const email = (formData.get('email') as string)?.trim();
      const password = formData.get('password') as string;
      const name = (formData.get('name') as string)?.trim();

      // Manual validation (browser validation disabled for password manager compatibility)
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (mode === 'register' && (!name || name.length < 2)) {
        throw new Error('Name must be at least 2 characters');
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Sign in to your account to continue'
            : 'Get started with Morning Bet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="on" noValidate>
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect="off"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              inputMode="email"
              placeholder="you@example.com"
              autoComplete={mode === 'login' ? 'username' : 'email'}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Link
          href="/guest"
          className="flex h-10 w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Continue as Guest
        </Link>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
