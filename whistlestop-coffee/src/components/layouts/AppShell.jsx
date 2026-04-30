'use client';

// Next.js components for navigation and route awareness
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// React hook for reading account and cart data on the client
import { useEffect, useState } from 'react';

// Theme toggle button component
import ThemeToggle from '@/components/theme-toggle';

// Reusable button component
import { Button } from '@/components/ui/button';

// Icons used in the layout and bottom navigation
import { User, Coffee, ClipboardList, Gift, ShoppingCart } from 'lucide-react';

/**
 * Reusable bottom navigation tab.
 * Displays an icon, label, and active state styling.
 */
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
      {/* Tab icon */}
      <Icon
        className={['h-5 w-5', isActive ? 'opacity-100' : 'opacity-80'].join(
          ' ',
        )}
      />

      {/* Tab label */}
      <span className={isActive ? 'font-medium' : ''}>{label}</span>

      {/* Small active indicator line */}
      <span
        className={[
          'mt-1 h-1 w-6 rounded-full transition',
          isActive ? 'bg-primary' : 'bg-transparent',
        ].join(' ')}
      />
    </Link>
  );
}

/**
 * Shared application shell used across customer, auth, and staff pages.
 * Handles the page header, customer cart shortcut,
 * mobile customer tabs, and the main content area.
 */
export default function AppShell({
  title,
  subtitle,
  showCustomerTabs = false,
  children,
}) {
  // Current pathname, used to detect which nav item is active
  const pathname = usePathname();

  // Holds the current logged-in user returned by the backend
  const [user, setUser] = useState(null);

  // Holds the total cart quantity returned from the backend cart
  const [cartCount, setCartCount] = useState(0);

  // Load the current user and cart once on mount from the real backend
  useEffect(() => {
    async function loadUser() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (userRes.ok) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    async function loadCartCount() {
      try {
        const cartRes = await fetch('/api/cart');
        const cartData = await cartRes.json();

        if (cartRes.ok) {
          const totalCount = (cartData.items || []).reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          setCartCount(totalCount);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    }

    function handleCartUpdated() {
      loadCartCount();
    }

    loadUser();
    loadCartCount();

    window.addEventListener('cart-updated', handleCartUpdated);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, [pathname]);

  /**
   * Returns true when the current route matches the given href
   * or is a nested route under it.
   * Example:
   * /customer/menu/latte is active for /customer/menu
   */
  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  // Determine where the account button should go
  const accountHref =
    user?.role === 'STAFF' || user?.role === 'ADMIN'
      ? '/staff/account'
      : user?.role === 'CUSTOMER'
        ? '/customer/account'
        : '/auth/login';

  const homeHref =
    user?.role === 'STAFF' || user?.role === 'ADMIN'
      ? '/staff/dashboard'
      : user
        ? '/customer/menu'
        : '/auth/login';

  return (
    <main className="coffee-bg min-h-screen">
      {/* Main page container */}
      <div
        className={[
          'mx-auto max-w-5xl px-4',
          // Adds extra bottom padding when fixed mobile tabs are shown
          showCustomerTabs ? 'pb-24' : 'pb-10',
        ].join(' ')}
      >
        {/* Page header */}
        <header className="bg-background/70 border-border/40 md:backdrop-blur-0 sticky top-0 z-10 -mx-4 border-b px-4 pt-6 pb-4 backdrop-blur-md md:static md:border-b-0 md:bg-transparent md:pt-8 md:pb-0">
          <div className="flex items-start justify-between gap-3">
            {/* Left side: location, title, subtitle */}
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">
                Cramlington Station
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                <Link href={homeHref} className="hover:opacity-90">
                  {title || 'Whistlestop Coffee Hut'}
                </Link>
              </h1>

              {/* subtitle under the title */}
              {subtitle ? (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              ) : null}
            </div>

            {/* Right side: cart button, account button, theme toggle */}
            <div className="flex items-center gap-2">
              {/* Cart shortcut shown only on customer-facing pages */}
              {showCustomerTabs && user?.role === 'CUSTOMER' ? (
                <Link href="/customer/cart" className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Cart"
                    className="bg-card/80 border-border shadow-sm backdrop-blur-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>

                  {/* Cart badge shown only when the cart has items */}
                  {cartCount > 0 ? (
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}

              {/* Account shortcut routes based on logged-in user role */}
              <Link href={accountHref}>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Account"
                  className="bg-card/80 border-border shadow-sm backdrop-blur-md"
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>

              {/* Light/dark theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main page content injected by the current route */}
        <section className="mt-6">{children}</section>
      </div>

      {/* Mobile-only bottom tab navigation for customer pages */}
      {showCustomerTabs && user?.role === 'CUSTOMER' ? (
        <nav className="border-border/60 bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-5xl">
            <Tab
              href="/customer/menu"
              label="Menu"
              icon={ClipboardList}
              isActive={isActive('/customer/menu')}
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
              icon={Coffee}
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
