import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/*
  This file defines a reusable Badge component.
 They are small labels used to show short pieces of information,
  such as order status, user role, item category, or availability.
  References:   https://cva.style/docs
  https://ui.shadcn.com/docs/components/radix/badge
*/

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        // Main badge style
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        // Softer badge style for secondary labels
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        // Error badge style
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        // Outlined badge style for neutral labels
        outline:
          'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        // Minimal badge style when only subtle hover feedback is needed
        ghost:
          'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        // Link-style badge
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },

    defaultVariants: {
      variant: 'default',
    },
  },
);

/**
 * Reusable Badge component.
 */
function Badge({ className, variant = 'default', asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
