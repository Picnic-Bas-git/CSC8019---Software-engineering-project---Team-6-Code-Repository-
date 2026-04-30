'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StaffAccountPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Staff Account</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Link href="/staff/dashboard">
            <Button className="w-full">Staff Dashboard</Button>
          </Link>

          <Link href="/customer/menu">
            <Button variant="outline" className="w-full">
              View Menu
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
