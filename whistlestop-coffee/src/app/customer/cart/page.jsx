'use client';

// React hooks for loading and updating cart data from the backend
import { useEffect, useMemo, useState } from 'react';

// Next.js link component for client-side navigation
import Link from 'next/link';

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
  // Holds the cart items returned by the backend
  const [items, setItems] = useState([]);

  // Tracks whether the cart is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any cart loading or action error
  const [error, setError] = useState('');

  // Tracks whether a cart action is currently running
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Loads the current signed-in user's cart from the backend.
   */
  async function loadCart() {
    try {
      setError('');

      const res = await fetch('/api/cart', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load cart');
        setItems([]);
        return;
      }

      setItems([...data.items]);
    } catch {
      setError('Something went wrong while loading the cart.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load the cart once when the page first renders
  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Updates the quantity of a cart item.
   * If the new quantity is 0 or less, the item is removed instead.
   */

  async function handleSetQty(item, newQty) {
    if (newQty <= 0) {
      await handleRemove(item.id);
      return;
    }

    const previousItems = items;

    // Update UI immediately
    setItems((current) =>
      current.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: newQty,
              lineTotal: cartItem.unitPrice * newQty,
            }
          : cartItem,
      ),
    );

    try {
      setIsUpdating(true);
      setError('');

      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setItems(previousItems);
        setError(data.error || 'Failed to update cart item');
        return;
      }

      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      setItems(previousItems);
      setError('Something went wrong while updating the cart.');
    } finally {
      setIsUpdating(false);
    }
  }

  /**
   * Removes one cart item completely from the backend cart.
   */
  async function handleRemove(cartItemId) {
    const previousItems = items;

    // Remove item from UI immediately, even though action still happening in backfround
    setItems((current) => current.filter((item) => item.id !== cartItemId));

    try {
      setIsUpdating(true);
      setError('');

      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        // Restore previous cart if delete fails
        setItems(previousItems);
        setError(data.error || 'Failed to remove cart item');
        return;
      }

      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      // Restore previous cart if request fails
      setItems(previousItems);
      setError('Something went wrong while removing the item.');
    } finally {
      setIsUpdating(false);
    }
  }

  /**
   * Clears the cart by deleting all current items one by one.
   */
  async function handleClear() {
    const previousItems = items;

    // Clear the UI immediately, since async takes some time
    setItems([]);

    try {
      setIsUpdating(true);
      setError('');

      for (const item of previousItems) {
        const res = await fetch(`/api/cart/${item.id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json();
          // Restore previous cart if any delete fails
          setItems(previousItems);
          setError(data.error || 'Failed to clear cart');
          return;
        }
      }

      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      // Restore previous cart if request fails
      setItems(previousItems);
      setError('Something went wrong while clearing the cart.');
    } finally {
      setIsUpdating(false);
    }
  }

  // Calculate the subtotal by summing line totals from backend items
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items],
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Main cart card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        {/* Cart header with clear button */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cart</CardTitle>

          {/* Only show the clear button when the cart has items */}
          {items.length ? (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isUpdating}
            >
              Clear
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Loading state while cart data is being fetched */}
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading cart...</div>
          ) : null}

          {/* Error state if loading or updating the cart fails */}
          {!isLoading && error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : null}

          {/* Empty cart state */}
          {!isLoading && items.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              Your cart is empty.{' '}
              <Link href="/customer/menu" className="underline">
                Browse the menu
              </Link>
            </div>
          ) : null}

          {/* Populated cart state */}
          {!isLoading && items.length > 0 ? (
            <div className="space-y-3">
              {/* Render each cart item */}
              {items.map((i) => (
                <div
                  key={i.id}
                  className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  {/* Left side: product image and item details */}
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Small thumbnail area */}
                    <div className="bg-primary/10 relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      {/* Show the real product image if one exists */}
                      {i.imageUrl ? (
                        <img
                          src={i.imageUrl}
                          alt={i.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        /* Fallback decorative background when no image is available */
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
                      )}
                    </div>

                    {/* Item text details */}
                    <div className="min-w-0">
                      {/* Product name */}
                      <div className="font-medium">{i.name}</div>

                      {/* Size and single-item price */}
                      <div className="text-muted-foreground text-xs">
                        Size: {i.size} · {money(i.unitPrice)} each
                      </div>
                    </div>
                  </div>

                  {/* Right side: quantity controls and remove button */}
                  <div className="flex items-center gap-2">
                    {/* Decrease quantity by 1 */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleSetQty(i, i.quantity - 1)}
                    >
                      -
                    </Button>

                    {/* Current quantity */}
                    <div className="w-8 text-center font-medium">
                      {i.quantity}
                    </div>

                    {/* Increase quantity by 1 */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleSetQty(i, i.quantity + 1)}
                    >
                      +
                    </Button>

                    {/* Remove the item completely from the cart */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleRemove(i.id)}
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
                <Button className="w-full" disabled={isUpdating}>
                  Continue to checkout
                </Button>
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
