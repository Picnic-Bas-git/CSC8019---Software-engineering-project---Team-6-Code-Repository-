'use client';

import { useEffect, useState } from 'react';
import { getSession, clearSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    setSessionState(getSession());
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Email</div>
            <div className="font-medium">
              {session?.email || 'Not signed in'}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-xs">Role</div>
            <div className="font-medium">{session?.role || '-'}</div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              clearSession();
              setSessionState(null);
              window.location.href = '/auth/login';
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
