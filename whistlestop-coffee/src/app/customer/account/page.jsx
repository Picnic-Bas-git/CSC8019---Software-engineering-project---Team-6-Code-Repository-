'use client';

// React hooks for managing component state and side effects
import { useEffect, useState } from 'react';

// Next.js router for client-side navigation
import { useRouter } from 'next/navigation';

// Reusable UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  // Router used for client-side page navigation
  const router = useRouter();

  // Holds the current logged-in user from the backend
  const [user, setUser] = useState(null);

  // Tracks whether account data is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores an error if loading the account fails
  const [error, setError] = useState('');

  // Load the current logged-in user from the backend once on page load
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok) {
          setUser(null);
          setError(data.error || 'Unable to load account');
          return;
        }

        setUser(data.user);
      } catch {
        setError('Something went wrong while loading your account');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Logs the user out using the backend route, then redirects to login
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      setUser(null);
      router.push('/auth/login');
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Main account card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        {/* Card heading */}
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {/* Loading state while waiting for backend account data */}
          {isLoading ? (
            <div className="text-muted-foreground">Loading account...</div>
          ) : null}

          {/* Shows error message if account data could not be loaded */}
          {!isLoading && error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : null}

          {/* Account details shown only when user is logged in */}
          {!isLoading && user ? (
            <>
              {/* Displays the user's name if signed in */}
              <div>
                <div className="text-muted-foreground text-xs">Name</div>
                <div className="font-medium">{user.name || '-'}</div>
              </div>

              {/* Displays the user's email if signed in */}
              <div>
                <div className="text-muted-foreground text-xs">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>

              {/* Displays the user's phone if signed in */}
              <div>
                <div className="text-muted-foreground text-xs">Phone</div>
                <div className="font-medium">{user.phone || '-'}</div>
              </div>

              {/* Displays the current user role */}
              <div>
                <div className="text-muted-foreground text-xs">Role</div>
                <div className="font-medium">{user.role || '-'}</div>
              </div>

              {/* Displays loyalty information for signed-in users */}
              <div>
                <div className="text-muted-foreground text-xs">
                  Loyalty points
                </div>
                <div className="font-medium">{user.loyaltyPoints ?? 0}</div>
              </div>

              <div>
                <div className="text-muted-foreground text-xs">
                  Loyalty stamps
                </div>
                <div className="font-medium">{user.loyaltyStamps ?? 0}</div>
              </div>

              {/* Quick actions for signed-in customers */}
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/status')}
                >
                  View order status
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/loyalty')}
                >
                  View loyalty
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/menu')}
                >
                  Browse menu
                </Button>
              </div>

              {/* Extra navigation options shown only for staff or admin users */}
              {user.role === 'STAFF' || user.role === 'ADMIN' ? (
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

              {/* Logs the user out and redirects to login */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                Log out
              </Button>
            </>
          ) : null}

          {/* Fallback shown when no user is logged in */}
          {!isLoading && !user ? (
            <div className="grid gap-3">
              <div className="text-muted-foreground">Not signed in</div>
              <Button onClick={() => router.push('/auth/login')}>
                Go to login
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
