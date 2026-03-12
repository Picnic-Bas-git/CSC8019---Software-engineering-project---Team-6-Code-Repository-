import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Coffee,
  ClipboardList,
  Gift,
  LayoutDashboard,
  Archive,
  LogIn,
  UserPlus,
  Home as HomeIcon,
} from 'lucide-react';

function QuickCard({ href, title, subtitle, icon: Icon }) {
  return (
    <Link href={href} className="block">
      <Card className="border-border/60 bg-card/70 hover:bg-card/90 coffee-card transition">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-xl">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium">{title}</div>
            <div className="text-muted-foreground text-xs">{subtitle}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <QuickCard
            href="/customer/order"
            title="Start an order"
            subtitle="Pick your drinks and pickup time"
            icon={Coffee}
          />
          <QuickCard
            href="/customer/menu"
            title="Browse the menu"
            subtitle="See prices and sizes"
            icon={ClipboardList}
          />
          <QuickCard
            href="/customer/status"
            title="Track your order"
            subtitle="Accepted, in progress, ready"
            icon={HomeIcon}
          />
          <QuickCard
            href="/customer/loyalty"
            title="Loyalty"
            subtitle="9 stamps then 10th is free"
            icon={Gift}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Staff</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <QuickCard
            href="/staff/dashboard"
            title="Orders dashboard"
            subtitle="View and update statuses"
            icon={LayoutDashboard}
          />
          <QuickCard
            href="/staff/archive"
            title="Archive"
            subtitle="Collected and paid orders"
            icon={Archive}
          />

          <div className="border-border/60 bg-background/40 mt-2 rounded-2xl border p-4">
            <div className="text-muted-foreground text-xs font-medium">
              Authentication
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="bg-card/60 w-full justify-between"
                >
                  <span>Login</span>
                  <LogIn className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="bg-card/60 w-full justify-between"
                >
                  <span>Register</span>
                  <UserPlus className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
