import Link from 'next/link';
import { getMenuItems } from '@/lib/menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function MenuItemPage({ params }) {
  const { id } = await params;

  const items = getMenuItems();
  const item = items.find((x) => x.id === id);

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

  const hasLarge = item.prices.large != null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="bg-primary/10 coffee-card relative h-40 w-full overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />
        <div className="absolute bottom-4 left-4">
          <div className="text-xl font-semibold">{item.name}</div>
          <div className="text-muted-foreground text-sm">
            {hasLarge
              ? `Regular £${item.prices.regular.toFixed(2)} · Large £${item.prices.large.toFixed(2)}`
              : `£${item.prices.regular.toFixed(2)}`}
          </div>
        </div>
      </div>

      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardContent className="space-y-4 p-4">
          <div className="text-muted-foreground text-sm">
            Choose a size and quantity, then add to cart.
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Size</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Regular
              </Button>
              {hasLarge ? (
                <Button variant="outline" className="flex-1">
                  Large
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Quantity</div>
            <div className="border-border/60 bg-background/40 flex items-center justify-between rounded-xl border px-3 py-2">
              <Button variant="outline" size="sm">
                -
              </Button>
              <div className="font-medium">1</div>
              <Button variant="outline" size="sm">
                +
              </Button>
            </div>
          </div>

          <Button className="w-full">Add to cart</Button>

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
