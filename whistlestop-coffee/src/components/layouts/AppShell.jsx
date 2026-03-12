import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  User,
  Coffee,
  ClipboardList,
  Gift,
  Home as HomeIcon,
} from 'lucide-react';

function Tab({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs"
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

export default function AppShell({
  title,
  subtitle,
  showCustomerTabs = false,
  children,
}) {
  return (
    <main className="coffee-bg min-h-screen">
      <div
        className={`mx-auto max-w-5xl px-4 pt-8 ${showCustomerTabs ? 'pb-24' : 'pb-10'}`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">
              Cramlington Station
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <Link href="/" className="hover:opacity-90">
                {title || 'Whistlestop Coffee Hut'}
              </Link>
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="icon"
                aria-label="Account"
                className="bg-card/80 border-border shadow-sm backdrop-blur-md"
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-6">{children}</section>
      </div>

      {showCustomerTabs ? (
        <nav className="border-border/60 bg-background/80 fixed right-0 bottom-0 left-0 border-t backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-5xl">
            <Tab href="/customer/menu" label="Menu" icon={ClipboardList} />
            <Tab href="/customer/order" label="Order" icon={Coffee} />
            <Tab href="/customer/status" label="Status" icon={HomeIcon} />
            <Tab href="/customer/loyalty" label="Loyalty" icon={Gift} />
          </div>
        </nav>
      ) : null}
    </main>
  );
}
