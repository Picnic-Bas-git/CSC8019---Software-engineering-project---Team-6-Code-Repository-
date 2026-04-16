'use client';

// Enables client-side navigation between pages
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Reusable UI components for consistent styling
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Session utility used to store the registered user locally
import { setSession } from '@/lib/session';

export default function RegisterPage() {
  // Router is used to redirect the user after registration
  const router = useRouter();

  /**
   * Handles account creation form submission.
   * Prevents page reload, gets the email value from the form,
   * saves a customer session, then redirects the user
   * to the customer menu page.
   */
  function onCreateAccount(e) {
    //Prevent redirection
    e.preventDefault();

    // Read the entered email from the form
    const email = e.currentTarget.email?.value || '';

    // Save a basic session for the new customer
    // Need to work on this. How dores a staff register?
    setSession({ email, role: 'customer' });

    // Redirect user after successful registration
    router.push('/customer/menu');
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
              <Input id="name" placeholder="Your name" autoComplete="name" />
            </div>

            {/* Email input */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@email.com"
                autoComplete="email"
              />
            </div>

            {/* Phone number input */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="+44..." autoComplete="tel" />
            </div>

            {/*Password Input*/}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
              />
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Create account
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
