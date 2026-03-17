'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function money(n) {
  return `£${n.toFixed(2)}`;
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cart</CardTitle>
          {items.length ? (
            <Button variant="outline" onClick={clear}>
              Clear
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              Your cart is empty.{' '}
              <Link href="/customer/menu" className="underline">
                Browse the menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={`${i.menuItemId}-${i.size}`}
                  className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-muted-foreground text-xs">
                      Size: {i.size} · {money(i.unitPrice)} each
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQty(i.menuItemId, i.size, i.qty - 1)}
                    >
                      -
                    </Button>

                    <div className="w-8 text-center font-medium">{i.qty}</div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQty(i.menuItemId, i.size, i.qty + 1)}
                    >
                      +
                    </Button>

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

              <div className="border-border/60 flex items-center justify-between border-t pt-3">
                <div className="text-muted-foreground text-sm">Subtotal</div>
                <div className="font-semibold">{money(subtotal)}</div>
              </div>

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
