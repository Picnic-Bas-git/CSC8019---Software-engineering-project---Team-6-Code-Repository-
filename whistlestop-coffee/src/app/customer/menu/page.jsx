'use client';

// Gets the list of available menu items
import { getMenuItems } from '@/lib/menu';

// Zustand cart store hook for adding items to the cart
import { useCartStore } from '@/lib/cart-store';

// Reusable UI components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Next.js link component for navigation to item detail pages
import Link from 'next/link';

// Load menu items once for this page
const items = getMenuItems();

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
  // Cart action for adding an item
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* Render one card for each menu item */}
      {items.map((item) => (
        <Card
          key={item.id}
          className="border-border/60 bg-card/70 coffee-card overflow-hidden"
        >
          {/* Clickable top area linking to the individual menu item page */}
          <Link href={`/customer/menu/${item.id}`} className="block">
            <div className="bg-primary/10 relative h-28 w-full">
              {/* Decorative background, add image! */}
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
               Adds the item to the cart using the regular size by default */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  menuItemId: item.id,
                  name: item.name,
                  size: 'regular',
                  unitPrice: item.prices.regular,
                });
              }}
            >
              Add to cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
