'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCartStore } from '@/lib/cart-store';
import { useOrdersStore } from '@/lib/orders-store';
import { getSession } from '@/lib/session';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function money(n) {
  return `£${n.toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const addOrder = useOrdersStore((s) => s.addOrder);

  const [pickupName, setPickupName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prefill pickup name from the current session, if available.
  // Read after mount to avoid SSR/localStorage mismatch.
  useEffect(() => {
    const session = getSession();
    const prefill = session?.name || session?.email?.split('@')[0] || '';
    if (prefill) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPickupName(prefill);
    }
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  const handlePlaceOrder = () => {
    if (!items.length || submitting) return;
    setSubmitting(true);

    const session = getSession();
    const order = addOrder({
      items,
      subtotal,
      customerEmail: session?.email ?? null,
      pickupName: pickupName.trim(),
      notes: notes.trim(),
    });

    clearCart();
    router.push(`/customer/status?placed=${order.id}`);
  };

  // Empty cart state — nothing to check out
  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              Your cart is empty.{' '}
              <Link href="/customer/menu" className="underline">
                Browse the menu
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Order summary */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((i) => (
            <div
              key={`${i.menuItemId}-${i.size}`}
              className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <div className="font-medium">{i.name}</div>
                <div className="text-muted-foreground text-xs">
                  Size: {i.size} · {money(i.unitPrice)} each · Qty {i.qty}
                </div>
              </div>
              <div className="font-semibold">{money(i.unitPrice * i.qty)}</div>
            </div>
          ))}

          <div className="border-border/60 flex items-center justify-between border-t pt-3">
            <div className="text-muted-foreground text-sm">Subtotal</div>
            <div className="font-semibold">{money(subtotal)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup details */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Pickup details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup-name">Name for pickup</Label>
            <Input
              id="pickup-name"
              value={pickupName}
              onChange={(e) => setPickupName(e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Oat milk, extra hot, etc."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Link href="/customer/cart" className="sm:order-1">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to cart
              </Button>
            </Link>
            <Button
              className="sm:order-2"
              onClick={handlePlaceOrder}
              disabled={submitting || !pickupName.trim()}
            >
              {submitting ? 'Placing…' : `Place order · ${money(subtotal)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
