'use client';

import { getMenuItems } from '@/lib/menu';
import { useCartStore } from '@/lib/cart-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const items = getMenuItems();

function PriceLine({ prices }) {
  const r = prices.regular;
  const l = prices.large;

  if (l == null) {
    return <div className="text-muted-foreground text-sm">£{r.toFixed(2)}</div>;
  }

  return (
    <div className="text-muted-foreground text-sm">
      Regular £{r.toFixed(2)} · Large £{l.toFixed(2)}
    </div>
  );
}

function SizePills({ hasLarge }) {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2">
      <div className="border-border/60 bg-background/70 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur">
        R
      </div>
      {hasLarge ? (
        <div className="border-border/60 bg-background/70 h-8 w-8 rounded-full border text-center text-xs leading-8 backdrop-blur">
          L
        </div>
      ) : null}
    </div>
  );
}

export default function MenuPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className="border-border/60 bg-card/70 coffee-card overflow-hidden"
        >
          <Link href={`/customer/menu/${item.id}`} className="block">
            <div className="bg-primary/10 relative h-28 w-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,120,82,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(216,180,154,0.35),transparent_55%)] opacity-60" />

              <div className="text-muted-foreground absolute bottom-3 left-3 text-xs">
                {item.prices.large != null
                  ? 'Regular and Large'
                  : 'Single size'}
              </div>

              <SizePills hasLarge={item.prices.large != null} />
            </div>
          </Link>

          <CardContent className="space-y-3 p-4">
            <div className="space-y-1">
              <div className="font-medium">{item.name}</div>
              <PriceLine prices={item.prices} />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                addItem({
                  menuItemId: item.id,
                  name: item.name,
                  size: 'regular',
                  unitPrice: item.prices.regular,
                })
              }
            >
              Add to cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
