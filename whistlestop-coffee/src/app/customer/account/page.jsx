'use client';

// React hooks for managing component state and side effects
import { useEffect, useState } from 'react';

// Next.js router for client-side navigation
import { useRouter } from 'next/navigation';

// Session utilities for reading and clearing the current user session
import { getSession, clearSession } from '@/lib/session';

// Reusable UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  // Router used for client-side page navigation
  const router = useRouter();

  // Holds the current session data for the signed-in user
  const [session, setSessionState] = useState(null);

  // Load the session once when the page first renders
  useEffect(() => {
    setSessionState(getSession());
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Main account card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        {/* Card heading */}
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Displays the user's email if signed in */}
          <div>
            <div className="text-muted-foreground text-xs">Email</div>
            <div className="font-medium">
              {session?.email || 'Not signed in'}
            </div>
          </div>

          {/* Displays the current user role */}
          <div>
            <div className="text-muted-foreground text-xs">Role</div>
            <div className="font-medium">{session?.role || '-'}</div>
          </div>

          {/* Extra navigation options shown only for staff users */}
          {session?.role === 'staff' ? (
            <div className="grid gap-2">
              <Button onClick={() => router.push('/staff/dashboard')}>
                Go to staff dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/customer/menu')}
              >
                View as customer
              </Button>
            </div>
          ) : null}

          {/* Logs the user out, clears session state, and redirects to login */}
          <Button
            variant="outline"
            onClick={() => {
              clearSession();
              setSessionState(null);
              router.push('/auth/login');
            }}
            className="w-full"
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
