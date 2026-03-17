'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  User,
  Coffee,
  ClipboardList,
  Gift,
  Home as HomeIcon,
  ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import { useCartStore } from '@/lib/cart-store';

function Tab({ href, label, icon: Icon, isActive }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition',
        isActive ? 'text-foreground' : 'text-muted-foreground',
      ].join(' ')}
    >
      <Icon
        className={['h-5 w-5', isActive ? 'opacity-100' : 'opacity-80'].join(
          ' ',
        )}
      />
      <span className={isActive ? 'font-medium' : ''}>{label}</span>
      <span
        className={[
          'mt-1 h-1 w-6 rounded-full transition',
          isActive ? 'bg-primary' : 'bg-transparent',
        ].join(' ')}
      />
    </Link>
  );
}

export default function AppShell({
  title,
  subtitle,
  showCustomerTabs = false,
  children,
}) {
  const pathname = usePathname();
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.qty, 0),
  );

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <main className="coffee-bg min-h-screen">
      <div
        className={[
          'mx-auto max-w-5xl px-4',
          showCustomerTabs ? 'pb-24' : 'pb-10',
        ].join(' ')}
      >
        <header className="bg-background/70 border-border/40 md:backdrop-blur-0 sticky top-0 z-10 -mx-4 border-b px-4 pt-6 pb-4 backdrop-blur-md md:static md:border-b-0 md:bg-transparent md:pt-8 md:pb-0">
          <div className="flex items-start justify-between gap-3">
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
              {showCustomerTabs ? (
                <Link href="/customer/cart" className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Cart"
                    className="bg-card/80 border-border shadow-sm backdrop-blur-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>

                  {cartCount > 0 ? (
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
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
          </div>
        </header>

        <section className="mt-6">{children}</section>
      </div>

      {showCustomerTabs ? (
        <nav className="border-border/60 bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-5xl">
            <Tab
              href="/customer/menu"
              label="Menu"
              icon={ClipboardList}
              isActive={isActive('/customer/menu')}
            />
            <Tab
              href="/customer/order"
              label="Order"
              icon={Coffee}
              isActive={isActive('/customer/order')}
            />
            <Tab
              href="/customer/cart"
              label="Cart"
              icon={ShoppingCart}
              isActive={isActive('/customer/cart')}
            />
            <Tab
              href="/customer/status"
              label="Status"
              icon={HomeIcon}
              isActive={isActive('/customer/status')}
            />
            <Tab
              href="/customer/loyalty"
              label="Loyalty"
              icon={Gift}
              isActive={isActive('/customer/loyalty')}
            />
          </div>
        </nav>
      ) : null}
    </main>
  );
}
