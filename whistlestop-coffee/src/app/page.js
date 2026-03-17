'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/auth/login');
    }, 900);

    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="coffee-bg flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-primary/15 coffee-card flex h-20 w-20 items-center justify-center rounded-3xl">
          <span className="text-3xl">☕</span>
        </div>
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
