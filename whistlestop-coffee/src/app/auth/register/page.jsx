'use client';

// React hook for handling loading and error UI state
import { useState } from 'react';

// Enables client-side navigation between pages
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Reusable UI components for consistent styling
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  // Router is used to redirect the user after registration
  const router = useRouter();

  // Tracks whether the form is currently being submitted
  const [isLoading, setIsLoading] = useState(false);

  // Stores any error message returned during registration
  const [error, setError] = useState('');

  /**
   * Handles account creation form submission.
   * Prevents page reload, reads the form values,
   * sends them to the backend register endpoint,
   * then redirects the user to login if successful.
   */
  async function onCreateAccount(e) {
    // Prevent page refresh
    e.preventDefault();

    // Clear old errors and show loading state
    setError('');
    setIsLoading(true);

    // Read values entered into the form
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    try {
      // Send registration request to backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      // Show backend error if registration failed
      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors;
        const firstFieldError =
          fieldErrors &&
          Object.values(fieldErrors).flat().filter(Boolean)[0];
        setError(firstFieldError || data.error || 'Registration failed');
        return;
      }

      // Redirect user after successful registration
      router.push('/auth/login');
    } catch {
      // Fallback error if request completely fails
      setError('Something went wrong. Please try again.');
    } finally {
      // Always stop loading state when request finishes
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Main registration card */}
      <Card className="border-border/60 bg-card/70 coffee-card overflow-hidden">
        {/* Decorative top section */}
        <div className="bg-primary/10 relative h-24 w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
        </div>

        {/* Card header with title and supporting text */}
        <CardHeader className="pb-2">
          <CardTitle>Create account</CardTitle>
          <p className="text-muted-foreground text-sm">
            Track orders and collect loyalty stamps.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Registration form */}
          <form className="grid gap-4" onSubmit={onCreateAccount}>
            {/* Full name input */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            {/* Email input */}
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
            </div>

            {/* Phone number input */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+44...[min 11 digits]"
                autoComplete="tel"
                required
              />
            </div>

            {/* Password Input */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Shows registration error if one exists */}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Link for users who already have an account */}
          <div className="text-muted-foreground text-center text-xs">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>

          {/* Shortcut for browsing without creating an account */}
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
