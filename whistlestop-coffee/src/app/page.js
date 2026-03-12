import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const customerLinks = [
  { href: '/customer/menu', label: 'Menu' },
  { href: '/customer/order', label: 'Place Order' },
  { href: '/customer/status', label: 'Order Status' },
  { href: '/customer/loyalty', label: 'Loyalty' },
];

const staffLinks = [
  { href: '/staff/dashboard', label: 'Dashboard' },
  { href: '/staff/archive', label: 'Archive' },
];

const authLinks = [
  { href: '/auth/login', label: 'Login' },
  { href: '/auth/register', label: 'Register' },
];

function LinkButton({ href, label }) {
  return (
    <Link href={href} className="block">
      <Button
        variant="outline"
        className="bg-background/40 w-full justify-between backdrop-blur-sm"
      >
        <span>{label}</span>
        <span className="text-xs opacity-70">Open</span>
      </Button>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="coffee-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Whistlestop Coffee Hut
            </h1>
            <p className="text-muted-foreground text-sm">
              Customer ordering and staff order management scaffold.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur-md">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {customerLinks.map((l) => (
                <LinkButton key={l.href} href={l.href} label={l.label} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur-md">
            <CardHeader>
              <CardTitle>Staff</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {staffLinks.map((l) => (
                <LinkButton key={l.href} href={l.href} label={l.label} />
              ))}

              <div className="border-border/60 mt-4 border-t pt-4">
                <div className="text-muted-foreground mb-2 text-xs font-medium">
                  Authentication
                </div>
                <div className="grid gap-2">
                  {authLinks.map((l) => (
                    <LinkButton key={l.href} href={l.href} label={l.label} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
