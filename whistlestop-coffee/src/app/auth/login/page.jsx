'use client';

// Next.js client-side navigation components
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// React hook for handling loading and field-level error UI state
import { useState } from 'react';

// Reusable UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  // Router lets us redirect the user after login
  const router = useRouter();

  // Tracks whether the form is currently being submitted
  const [isLoading, setIsLoading] = useState(false);

  // Stores field-specific and general login errors
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  /**
   * Validates email using a simple practical email pattern.
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Handles form submission.
   * Prevents the default page reload, reads the email and password,
   * validates them on the client,
   * sends them to the backend login endpoint,
   * then redirects the user based on their role.
   */
  async function onContinue(e) {
    e.preventDefault();

    // Clear previous errors and begin loading state
    setErrors({
      email: '',
      password: '',
      general: '',
    });
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Get the entered values from the form
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    // Build client-side field errors
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

    // Validate email before sending to backend
    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate password length before sending to backend
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // Stop submission if any client-side errors exist
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Show backend field errors or general login error
      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors || {};

        setErrors({
          email: fieldErrors.email?.[0] || '',
          password: fieldErrors.password?.[0] || '',
          general: data.error || 'Login failed',
        });
        return;
      }

      const role = data?.user?.role;

      // Redirect staff/admin users to the staff dashboard
      if (role === 'STAFF' || role === 'ADMIN') {
        router.push('/staff/dashboard');
        return;
      }

      // Redirect customers to the customer menu
      router.push('/customer/menu');
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: 'Something went wrong. Please try again.',
      }));
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
                type="email"
                placeholder="name@email.com"
                autoComplete="email"
                required
              />
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email}</p>
              ) : null}
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
              {errors.password ? (
                <p className="text-sm text-red-500">{errors.password}</p>
              ) : null}
            </div>

            {/* General error shown only when it is not tied to one field */}
            {errors.general && !errors.email && !errors.password ? (
              <p className="text-sm text-red-500">{errors.general}</p>
            ) : null}

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
