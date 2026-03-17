'use client';

// Next.js client-side navigation components
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Reusable UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Session helper used to store the logged-in user locally, used in dev mode to start
import { setSession } from '@/lib/session';

export default function LoginPage() {
  // Router lets us redirect the user after login
  const router = useRouter();

  /**
   * Handles form submission.
   * Prevents the default page reload, reads the email input,
   * determines whether the user is staff or customer,
   * stores the session, then redirects to the correct page.
   */
  function onContinue(e) {
    e.preventDefault();

    // Get the entered email from the form, fallback to empty string
    const email = e.currentTarget.email.value || '';

    // Simple role detection:
    // if email contains "staff", treat user as staff, otherwise customer
    // Can change to perhaps whistlestop ie app domain
    const isStaff = email.toLowerCase().includes('staff');
    const role = isStaff ? 'staff' : 'customer';

    // Save the user session so the app can remember who is logged in
    setSession({ email, role });

    // Redirect based on role
    router.push(isStaff ? '/staff/dashboard' : '/customer/menu');
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
              />
            </div>

            {/* Password field
               Note: password is currently collected but not validated yet.
               This is only UI till authentication logic is added by backend team. */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Continue
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
