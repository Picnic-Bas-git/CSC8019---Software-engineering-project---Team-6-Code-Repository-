'use client';

// React hooks for loading menu data from the backend
// and handling quick add state
import { useEffect, useState } from 'react';

// Imports useRouter
import { useRouter } from 'next/navigation';

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
 * Shows clickable size buttons on the menu image.
 * Selecting R or L updates the quick-add size for that item.
 */
function SizePills({ hasLarge, selectedSize, onSelectSize }) {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2">
      <button
        type="button"
        className={`border-border/60 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur ${
          selectedSize === 'REGULAR'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/70'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectSize('REGULAR');
        }}
      >
        R
      </button>

      {hasLarge ? (
        <button
          type="button"
          className={`border-border/60 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur ${
            selectedSize === 'LARGE'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/70'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectSize('LARGE');
          }}
        >
          L
        </button>
      ) : null}
    </div>
  );
}

export default function MenuPage() {
  // Allows the page to send users to the full item detail page
  // when they click "Choose a size" without selecting R or L first.
  const router = useRouter();

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

  // Holds the current logged-in user so staff cannot place orders
  const [user, setUser] = useState(null);

  // Implemented after trade fair; fixes the size selection issue.
  // Stores the selected size for each menu item.
  const [selectedSizes, setSelectedSizes] = useState({});

  /**
   * Loads menu items from the backend when the page first renders.
   * The backend response is mapped into the shape the current UI expects.
   */
  useEffect(() => {
    async function loadMenu() {
      try {
        setError('');

        // 1. Load user
        const userRes = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        const userData = await userRes.json();

        if (userRes.ok) {
          setUser(userData.user);
        } else {
          setUser(null);
        }

        // 2. Load menu
        const res = await fetch('/api/menu');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load menu');
          return;
        }

        // 3. Map items
        const mappedItems = (data.items || []).map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
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
   * Adds the selected item size to the cart.
   *
   * If no size has been selected, the user is sent to the full item detail page,
   * where they can review the drink and choose a size.
   */
  async function handleQuickAdd(item) {
    // Get the selected size for this specific item card.
    const selectedSize = selectedSizes[item.id];

    // If the customer has not selected R or L yet,
    // treat the button as "Choose a size" and send them to the item page.
    if (!selectedSize) {
      router.push(`/customer/menu/${item.slug}`);
      return;
    }

    try {
      // Track which item is being added so only that button shows loading.
      setAddingId(item.id);

      // Clear old feedback before a new cart request.
      setError('');
      setSuccess('');

      // Send the selected size to the backend cart API.
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: item.id,
          size: selectedSize,
          quantity: 1,
        }),
      });

      const data = await res.json();

      // Show the backend error if the cart request fails.
      if (!res.ok) {
        setError(data.error || 'Failed to add item to cart');
        return;
      }

      // Show a short success message after the item is added.
      setSuccess(`${item.name} added to cart`);

      // Notify any cart badge/header component to refresh its count.
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      setError('Something went wrong while adding to cart.');
    } finally {
      // Reset loading state after the request finishes.
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

  // Check if the logged-in user is allowed to add items to cart
  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

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
              <div className="bg-primary/10 relative h-28 w-full overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
                )}

                <div className="text-muted-foreground absolute bottom-3 left-3 text-xs">
                  {item.prices.large != null
                    ? 'Regular and Large'
                    : 'Single size'}
                </div>

                <SizePills
                  hasLarge={item.prices.large != null}
                  selectedSize={selectedSizes[item.id]}
                  onSelectSize={(size) =>
                    setSelectedSizes((prev) => ({
                      ...prev,
                      [item.id]: size,
                    }))
                  }
                />
              </div>
            </Link>

            <CardContent className="space-y-3 p-4">
              {/* Item name and pricing */}
              <div className="space-y-1">
                <div className="font-medium">{item.name}</div>
                <PriceLine prices={item.prices} />
              </div>

              {/* Size selection for quick add.
              The customer must choose R or L before the card button becomes "Add to cart". */}
              {isCustomer ? (
                <div className="space-y-2">
                  {/* Quick add button.
                  If no size is selected, it acts as a "Choose a size" button.
                  If R or L is selected, it adds that selected size to the cart. */}
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={addingId === item.id}
                    onClick={() => handleQuickAdd(item)}
                  >
                    {addingId === item.id
                      ? 'Adding...'
                      : selectedSizes[item.id]
                        ? 'Add to cart'
                        : 'Choose a size'}
                  </Button>
                </div>
              ) : isStaff ? (
                <div className="border-border/60 text-muted-foreground rounded-xl border py-2 text-center text-sm">
                  Staff view only
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Sign in to order
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
