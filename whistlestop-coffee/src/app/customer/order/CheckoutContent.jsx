import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function money(n) {
  return `£${n.toFixed(2)}`;
}

export default function CheckoutContent() {
  const router = useRouter();

  // Holds the current backend cart items
  const [items, setItems] = useState([]);

  // Holds the logged-in user from the backend
  const [user, setUser] = useState(null);

  // Use search params
  const searchParams = useSearchParams();

  const [pickupTime, setPickupTime] = useState(
    searchParams.get('pickupTime') || '',
  );

  // Pickup name entered by the customer
  const [pickupName, setPickupName] = useState(
    searchParams.get('pickupName') || '',
  );

  // checkout notes
  const [notes, setNotes] = useState(searchParams.get('notes') || '');

  // Tracks whether the page is still loading cart/user data
  const [isLoading, setIsLoading] = useState(true);

  // Tracks whether the order is being submitted
  const [submitting, setSubmitting] = useState(false);

  // Stores any loading or submit error
  const [error, setError] = useState('');

  /**
   * Loads the current user and current cart from the backend.
   * This replaces the old local session and local cart logic.
   */
  useEffect(() => {
    async function loadCheckoutData() {
      try {
        setError('');

        const [userRes, cartRes] = await Promise.all([
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/cart', { cache: 'no-store' }),
        ]);

        const userData = await userRes.json();
        const cartData = await cartRes.json();

        if (userRes.ok) {
          setUser(userData.user);

          // Prefill pickup name from the current user if available
          const prefill =
            userData.user?.name || userData.user?.email?.split('@')[0] || '';

          if (prefill) {
            setPickupName(prefill);
          }
        } else {
          setUser(null);
        }

        if (!cartRes.ok) {
          setError(cartData.error || 'Failed to load cart');
          setItems([]);
          return;
        }

        setItems(cartData.items || []);
      } catch {
        setError('Something went wrong while loading checkout.');
        setItems([]);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCheckoutData();
  }, []);

  // Calculate the subtotal from backend cart line totals
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items],
  );

  /**
   * Continue to payment
   */
  function handleContinueToPayment() {
    if (!items.length || !pickupName.trim() || !pickupTime) return;

    const params = new URLSearchParams({
      pickupName: pickupName.trim(),
      notes: notes.trim(),
      pickupTime,
    });

    router.push(`/customer/payment?${params.toString()}`);
  }

  // Loading state while waiting for checkout data
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-muted-foreground">Loading checkout...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty cart state, nothing to check out
  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {error ? <div className="text-sm text-red-500">{error}</div> : null}

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
              key={i.id}
              className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <div className="font-medium">{i.name}</div>
                <div className="text-muted-foreground text-xs">
                  Size: {i.size} · {money(i.unitPrice)} each · Qty {i.quantity}
                </div>
              </div>
              <div className="font-semibold">{money(i.lineTotal)}</div>
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
          {/* Show any checkout error */}
          {error ? <div className="text-sm text-red-500">{error}</div> : null}

          <div className="space-y-2">
            <Label htmlFor="pickup-name">Name for pickup *</Label>
            <Input
              id="pickup-name"
              value={pickupName}
              required
              onChange={(e) => setPickupName(e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-time">Pickup time *</Label>
            <Input
              id="pickup-time"
              type="time"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
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
              onClick={handleContinueToPayment}
              disabled={!pickupName.trim() || !pickupTime}
            >
              {`Continue to payment · ${money(subtotal)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
