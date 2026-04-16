'use client';

// Next.js link component for client-side navigation
import Link from 'next/link';

// Zustand cart store hooks for reading and updating cart state
import { useCartStore } from '@/lib/cart-store';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Formats a number into GBP currency.
 * Example: 3.5 -> £3.50
 */
function money(n) {
  return `£${n.toFixed(2)}`;
}

export default function CartPage() {
  // Get cart items from the global cart store
  const items = useCartStore((s) => s.items);

  // Cart actions from the store
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  // Calculate the subtotal by summing item price × quantity
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Main cart card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        {/* Cart header with optional clear button */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cart</CardTitle>

          {/* Only show the clear button when the cart has items */}
          {items.length ? (
            <Button variant="outline" onClick={clear}>
              Clear
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Empty cart state */}
          {items.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              Your cart is empty.{' '}
              <Link href="/customer/menu" className="underline">
                Browse the menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Render each cart item */}
              {items.map((i) => (
                <div
                  key={`${i.menuItemId}-${i.size}`}
                  className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  {/* Item details */}
                  <div className="min-w-0">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-muted-foreground text-xs">
                      Size: {i.size} · {money(i.unitPrice)} each
                    </div>
                  </div>

                  {/* Quantity controls and remove action */}
                  <div className="flex items-center gap-2">
                    {/* Decrease quantity by 1 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQty(i.menuItemId, i.size, i.qty - 1)}
                    >
                      -
                    </Button>

                    {/* Current quantity */}
                    <div className="w-8 text-center font-medium">{i.qty}</div>

                    {/* Increase quantity by 1 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQty(i.menuItemId, i.size, i.qty + 1)}
                    >
                      +
                    </Button>

                    {/* Remove item completely from the cart */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(i.menuItemId, i.size)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {/* Cart subtotal */}
              <div className="border-border/60 flex items-center justify-between border-t pt-3">
                <div className="text-muted-foreground text-sm">Subtotal</div>
                <div className="font-semibold">{money(subtotal)}</div>
              </div>

              {/* Proceed to checkout */}
              <Link href="/customer/order" className="block">
                <Button className="w-full">Continue to checkout</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
