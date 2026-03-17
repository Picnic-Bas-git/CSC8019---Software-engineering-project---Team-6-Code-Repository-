'use client';

// React hook for running side effects after the component mounts
import { useEffect } from 'react';

// Next.js router for client-side navigation
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  // Router instance used to redirect the user after the splash screen
  const router = useRouter();

  useEffect(() => {
    // Start a short timer, then replace the current route with the login page
    const t = setTimeout(() => {
      router.replace('/auth/login');
    }, 900);

    // Clear the timer if the component unmounts before it finishes
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="coffee-bg flex min-h-screen items-center justify-center">
      {/* Centered splash content */}
      <div className="flex flex-col items-center gap-4">
        {/* Coffee icon badge */}
        <div className="bg-primary/15 coffee-card flex h-20 w-20 items-center justify-center rounded-3xl">
          <span className="text-3xl">☕</span>
        </div>

        {/* App name and loading text */}
        <div className="text-center">
          <div className="text-xl font-semibold tracking-tight">
            Whistlestop Coffee Hut
          </div>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    </main>
  );
}
