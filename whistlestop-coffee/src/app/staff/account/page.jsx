'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/*
  This page providesstaff account navigation.

  Staff users can:
  - open the staff dashboard
  - view the customer menu in read-only/staff mode
  - log out of the application
*/

export default function StaffAccountPage() {
  // Allows the page to redirect staff after logout
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Logs the current staff user out and redirects them to the login page.
   */
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
          {/* Link to the staff dashboard where active orders are managed */}
          <Link href="/staff/dashboard">
            <Button className="w-full">Staff Dashboard</Button>
          </Link>

          {/* Allows staff to view the customer menu without placing orders */}
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
