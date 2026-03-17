'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setSession } from '@/lib/session';

export default function RegisterPage() {
  const router = useRouter();

  function onCreateAccount(e) {
    e.preventDefault();

    const email = e.currentTarget.email?.value || '';
    setSession({ email, role: 'customer' });

    router.push('/customer/menu');
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Card className="border-border/60 bg-card/70 coffee-card overflow-hidden">
        <div className="bg-primary/10 relative h-24 w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
        </div>

        <CardHeader className="pb-2">
          <CardTitle>Create account</CardTitle>
          <p className="text-muted-foreground text-sm">
            Track orders and collect loyalty stamps.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={onCreateAccount}>
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Your name" autoComplete="name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@email.com"
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="+44..." autoComplete="tel" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <div className="text-muted-foreground text-center text-xs">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>

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
