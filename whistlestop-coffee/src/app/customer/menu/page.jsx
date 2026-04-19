'use client';

// React hooks for loading menu data from the backend
// and handling quick add state
import { useEffect, useState } from 'react';

// Reusable UI components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Next.js link component for navigation to item detail pages
import Link from 'next/link';

/**
 * Displays the price text for a menu item.
 * Shows either a single price or both regular and large prices.
 */
function PriceLine({ prices }) {
  const r = prices.regular;
  const l = prices.large;

  // If there is no large size, show only one price
  if (l == null) {
    return <div className="text-muted-foreground text-sm">£{r.toFixed(2)}</div>;
  }

  // If both sizes exist, show both prices
  return (
    <div className="text-muted-foreground text-sm">
      Regular £{r.toFixed(2)} · Large £{l.toFixed(2)}
    </div>
  );
}

/**
 * Shows small visual size badges on the menu card.
 * R = Regular
 * L = Large
 */
function SizePills({ hasLarge }) {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2">
      {/* Regular size badge */}
      <div className="border-border/60 bg-background/70 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur">
        R
      </div>

      {/* Large size badge, shown only when available */}
      {hasLarge ? (
        <div className="border-border/60 bg-background/70 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur">
          L
        </div>
      ) : null}
    </div>
  );
}

export default function MenuPage() {
  // Holds menu items returned from the backend
  const [items, setItems] = useState([]);

  // Tracks whether menu items are still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any loading error so it can be shown in the UI
  const [error, setError] = useState('');

  // Tracks which item is currently being added to cart
  const [addingId, setAddingId] = useState(null);

  // Stores a short success message for quick add feedback
  const [success, setSuccess] = useState('');

  /**
   * Loads menu items from the backend when the page first renders.
   * The backend response is mapped into the shape the current UI expects.
   */
  useEffect(() => {
    async function loadMenu() {
      try {
        setError('');

        const res = await fetch('/api/menu');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load menu');
          return;
        }

        // Convert backend menu item shape into the structure
        // this page already uses, so the rest of the UI can stay simple
        const mappedItems = (data.items || []).map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          prices: {
            regular: item.priceRegular,
            large: item.priceLarge,
          },
        }));

        setItems(mappedItems);
      } catch {
        setError('Something went wrong while loading the menu.');
      } finally {
        setIsLoading(false);
      }
    }

    loadMenu();
  }, []);

  /**
   * Quick add action for the menu card.
   * Adds one regular-size item to the backend cart.
   */
  async function handleQuickAdd(item) {
    try {
      setAddingId(item.id);
      setError('');
      setSuccess('');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: item.id,
          size: 'REGULAR',
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add item to cart');
        return;
      }

      setSuccess(`${item.name} added to cart`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      setError('Something went wrong while adding to cart.');
    } finally {
      setAddingId(null);
    }
  }

  // Loading state while waiting for the backend response
  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading menu...</div>;
  }

  // Error state if the menu request fails
  if (error && items.length === 0) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  // Empty state if no menu items are available
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No menu items available right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Shows page-level feedback for quick add actions */}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      {success ? <div className="text-sm text-green-600">{success}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Render one card for each menu item */}
        {items.map((item) => (
          <Card
            key={item.id}
            className="border-border/60 bg-card/70 coffee-card overflow-hidden"
          >
            {/* Clickable top area linking to the individual menu item page */}
            <Link href={`/customer/menu/${item.slug}`} className="block">
              <div className="bg-primary/10 relative h-28 w-full">
                {/* Decorative background, add image later if needed */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />

                {/* Small helper text showing available size options */}
                <div className="text-muted-foreground absolute bottom-3 left-3 text-xs">
                  {item.prices.large != null
                    ? 'Regular and Large'
                    : 'Single size'}
                </div>

                {/* Visual size badges */}
                <SizePills hasLarge={item.prices.large != null} />
              </div>
            </Link>

            <CardContent className="space-y-3 p-4">
              {/* Item name and pricing */}
              <div className="space-y-1">
                <div className="font-medium">{item.name}</div>
                <PriceLine prices={item.prices} />
              </div>

              {/* Quick add button
                 Adds one regular-size item to the real backend cart. */}
              <Button
                variant="outline"
                className="w-full"
                disabled={addingId === item.id}
                onClick={() => handleQuickAdd(item)}
              >
                {addingId === item.id ? 'Adding...' : 'Add to cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
