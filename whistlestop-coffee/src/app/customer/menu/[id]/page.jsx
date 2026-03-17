import Link from 'next/link';
import { getMenuItems } from '@/lib/menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AddToCartPanel from '../AddToCartPanel';

/**
 * Displays a single menu item's detail page.
 * Reads the item id from the route params,
 * finds the matching menu item,
 * and shows its size and quantity selection UI.
 */
export default async function MenuItemPage({ params }) {
  // Get the dynamic route parameter, for example: /customer/menu/latte
  const { id } = await params;

  // Load all menu items and find the one matching the route id
  const items = getMenuItems();
  const item = items.find((x) => x.id === id);

  // If no matching item is found, show a fallback message
  if (!item) {
    return (
      <div className="space-y-3">
        <div className="text-lg font-semibold">Item not found</div>
        <Link href="/customer/menu" className="text-sm underline">
          Back to menu
        </Link>
      </div>
    );
  }

  // Check whether this item supports a large size
  const hasLarge = item.prices.large != null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      {/* Hero section with item name and pricing */}
      <div className="bg-primary/10 coffee-card relative h-40 w-full overflow-hidden rounded-2xl">
        {/* Decorative background, add image! */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
        {/* Item title and price display */}
        <div className="absolute bottom-4 left-4">
          <div className="text-xl font-semibold">{item.name}</div>
          <div className="text-muted-foreground text-sm">
            {hasLarge
              ? `Regular £${item.prices.regular.toFixed(2)} · Large £${item.prices.large.toFixed(2)}`
              : `£${item.prices.regular.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Card containing selection controls */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        {/* Instruction text */}
        <CardContent className="space-y-4 p-4">
          <AddToCartPanel item={item} />

          <Link
            href="/customer/menu"
            className="text-muted-foreground block text-center text-xs underline"
          >
            Back to menu
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
