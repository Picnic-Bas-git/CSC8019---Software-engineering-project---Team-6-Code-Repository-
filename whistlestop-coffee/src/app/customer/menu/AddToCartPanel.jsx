'use client';
// Created this so that we can leave page.jsx under [id] as a server component
// React hooks for memoizing derived values and managing local component state
import { useMemo, useState } from 'react';

// Reusable button component
import { Button } from '@/components/ui/button';

// Zustand cart store hook for adding items to the cart
import { useCartStore } from '@/lib/cart-store';

export default function AddToCartPanel({ item }) {
  // Cart action used to add a selected item into the cart
  const addItem = useCartStore((s) => s.addItem);

  // Check whether this menu item also supports a large size
  const hasLarge = item.prices.large != null;

  /**
   * Build the available size options for this item.
   * Memoized so the array is only recalculated when the item pricing changes.
   */
  const sizeOptions = useMemo(() => {
    const opts = [
      { key: 'regular', label: 'Regular', price: item.prices.regular },
    ];

    // Add a large option only when a large price exists
    if (hasLarge) {
      opts.push({ key: 'large', label: 'Large', price: item.prices.large });
    }

    return opts;
  }, [hasLarge, item.prices.large, item.prices.regular]);

  // Currently selected size, defaulting to regular
  const [size, setSize] = useState('regular');

  // Currently selected quantity, defaulting to 1
  const [qty, setQty] = useState(1);

  // Find the selected size's unit price
  // Fallback to regular price if something unexpected happens
  const unitPrice =
    sizeOptions.find((o) => o.key === size)?.price ?? item.prices.regular;

  // Calculate the total price based on selected size and quantity
  const total = unitPrice * qty;

  /**
   * Adds the chosen item to the cart.
   * Since the store adds one item at a time, this loops based on quantity.
   */
  function addToCart() {
    for (let i = 0; i < qty; i += 1) {
      addItem({
        menuItemId: item.id,
        name: item.name,
        size,
        unitPrice,
      });
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
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add selected item(s) to cart and show total price */}
      <Button type="button" className="w-full" onClick={addToCart}>
        Add to cart · £{total.toFixed(2)}
      </Button>
    </div>
  );
}
