'use client';

// Created this so that we can leave page.jsx under [slug] as a server component

// React hooks for memoizing derived values, managing local component state,
// and handling backend cart actions
import { useEffect, useMemo, useState } from 'react';

// Reusable button component
import { Button } from '@/components/ui/button';

export default function AddToCartPanel({ item }) {
  // Check whether this menu item also supports a large size
  const hasLarge = item.prices.large != null;

  // Tracks whether the add-to-cart request is in progress
  const [isLoading, setIsLoading] = useState(false);

  // Stores any backend error while adding to cart
  const [error, setError] = useState('');

  // Stores a short success message after adding to cart
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  const isCustomer = user?.role === 'CUSTOMER';

  /**
   * Build the available size options for this item.
   * Memoized so the array is only recalculated when the item pricing changes.
   */
  const sizeOptions = useMemo(() => {
    const opts = [
      { key: 'REGULAR', label: 'Regular', price: item.prices.regular },
    ];

    // Add a large option only when a large price exists
    if (hasLarge) {
      opts.push({ key: 'LARGE', label: 'Large', price: item.prices.large });
    }

    return opts;
  }, [hasLarge, item.prices.large, item.prices.regular]);

  // Currently selected size, defaulting to regular
  const [size, setSize] = useState('REGULAR');

  // Currently selected quantity, defaulting to 1
  const [qty, setQty] = useState(1);

  // Find the selected size's unit price
  // Fallback to regular price if something unexpected happens
  const unitPrice =
    sizeOptions.find((o) => o.key === size)?.price ?? item.prices.regular;

  // Calculate the total price based on selected size and quantity
  const total = unitPrice * qty;

  /**
   * Adds the chosen item to the real backend cart.
   * Sends one request with menu item id, selected size, and quantity.
   */
  async function addToCart() {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: item.id,
          size,
          quantity: qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add item to cart');
        return;
      }

      setSuccess('Added to cart');
    } catch {
      setError('Something went wrong while adding to cart.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Instruction text */}
      <div className="text-muted-foreground text-sm">
        Choose a size and quantity, then add to cart.
      </div>

      {/* Size selection */}
      <div className="grid gap-2">
        <div className="text-sm font-medium">Size</div>
        <div className="flex gap-2">
          {sizeOptions.map((o) => (
            <Button
              key={o.key}
              type="button"
              disabled={!isCustomer || isLoading}
              variant={size === o.key ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setSize(o.key)}
            >
              {o.label} · £{o.price.toFixed(2)}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity selection */}
      <div className="grid gap-2">
        <div className="text-sm font-medium">Quantity</div>
        <div className="border-border/60 bg-background/40 flex items-center justify-between rounded-xl border px-3 py-2">
          {/* Decrease quantity, but never below 1 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isCustomer || isLoading}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            -
          </Button>

          {/* Current quantity */}
          <div className="font-medium">{qty}</div>

          {/* Increase quantity */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isCustomer || isLoading}
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Shows backend error if add-to-cart fails */}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      {/* Shows success feedback after item is added */}
      {success ? <div className="text-sm text-green-600">{success}</div> : null}

      {/* Add selected item(s) to cart and show total price */}
      {isCustomer ? (
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={addToCart}
        >
          {isLoading ? 'Adding...' : `Add to cart · £${total.toFixed(2)}`}
        </Button>
      ) : (
        <div className="border-border/60 text-muted-foreground rounded-xl border py-2 text-center text-sm">
          Staff view only. Ordering is disabled.
        </div>
      )}
    </div>
  );
}
