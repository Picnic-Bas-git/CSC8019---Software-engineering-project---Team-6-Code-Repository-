'use client';

// React hook for handling loading and field-level error UI state
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

  // Stores field-specific validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
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
   * Validates phone numbers by checking that the input
   * contains at least 11 digits after removing non-digits.
   */
  function isValidPhone(phone) {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length >= 11;
  }

  /**
   * Handles account creation form submission.
   * Prevents page reload, reads the form values,
   * validates them on the client,
   * sends them to the backend register endpoint,
   * then redirects the user to login if successful.
   */
  async function onCreateAccount(e) {
    // Prevent page refresh
    e.preventDefault();

    // Clear old errors and show loading state
    setErrors({
      name: '',
      email: '',
      phone: '',
      password: '',
      general: '',
    });
    setIsLoading(true);

    // Read values entered into the form
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    // Build field-specific client-side errors
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      general: '',
    };

    if (name.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!isValidPhone(phone)) {
      newErrors.phone =
        'Please enter a valid phone number with at least 11 digits.';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // If any client-side validation failed, show field errors and stop
    if (
      newErrors.name ||
      newErrors.email ||
      newErrors.phone ||
      newErrors.password
    ) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

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

      // Show backend field errors if registration failed
      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors || {};

        setErrors({
          name: fieldErrors.name?.[0] || '',
          email: fieldErrors.email?.[0] || '',
          phone: fieldErrors.phone?.[0] || '',
          password: fieldErrors.password?.[0] || '',
          general: data.error || 'Registration failed',
        });

        return;
      }

      // Redirect user after successful registration
      router.push('/auth/login');
    } catch {
      // Fallback error if request completely fails
      setErrors((prev) => ({
        ...prev,
        general: 'Something went wrong. Please try again.',
      }));
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
                minLength={2}
              />
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name}</p>
              ) : null}
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
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email}</p>
              ) : null}
            </div>

            {/* Phone number input */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+44... [min 11 digits]"
                autoComplete="tel"
                required
              />
              {errors.phone ? (
                <p className="text-sm text-red-500">{errors.phone}</p>
              ) : null}
            </div>

            {/* Password input */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
              />
              {errors.password ? (
                <p className="text-sm text-red-500">{errors.password}</p>
              ) : null}
            </div>

            {/* General registration error for non-field-specific failures */}
            {errors.general &&
            !errors.name &&
            !errors.email &&
            !errors.phone &&
            !errors.password ? (
              <p className="text-sm text-red-500">{errors.general}</p>
            ) : null}

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
