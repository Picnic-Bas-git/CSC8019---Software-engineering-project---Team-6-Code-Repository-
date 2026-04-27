'use client';

// Next.js client-side navigation components
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// React hook for handling loading and error UI state
import { useState } from 'react';

// Reusable UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  // Router lets us redirect the user after login
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles form submission.
   * Prevents the default page reload, reads the email input,
   * determines whether the user is staff or customer,
   * stores the session, then redirects to the correct page.
   */
  async function onContinue(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Get the entered email from the form, fallback to empty string
    const email = formData.get('email')?.toString().trim() || '';

    const password = formData.get('password')?.toString() || '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors;
        const firstFieldError =
          fieldErrors &&
          Object.values(fieldErrors).flat().filter(Boolean)[0];
        setError(firstFieldError || data.error || 'Login failed');
        return;
      }

      const role = data?.user?.role;

      if (role === 'STAFF' || role === 'ADMIN') {
        router.push('/staff/dashboard');
        return;
      }

      router.push('/customer/menu');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Main login card */}
      <Card className="border-border/60 bg-card/70 coffee-card overflow-hidden">
        {/* Decorative top banner */}
        <div className="bg-primary/10 relative h-24 w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
        </div>

        {/* Card heading */}
        <CardHeader className="pb-2">
          <CardTitle>Welcome back</CardTitle>
          <p className="text-muted-foreground text-sm">
            Login to place orders and track status.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Login form */}
          <form className="grid gap-4" onSubmit={onContinue}>
            {/* Email field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@email.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Password field */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {/*error displayed if there's a mistake*/}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Continue'}
            </Button>
          </form>

          {/* Link for users who do not have an account yet */}
          <div className="text-muted-foreground text-center text-xs">
            New here?{' '}
            <Link href="/auth/register" className="underline">
              Register
            </Link>
          </div>

          {/* Shortcut for users who want to browse without logging in */}
          <div className="text-muted-foreground text-center text-xs">
            <Link href="/customer/menu" className="underline">
              Just browsing
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
