import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/*
  This file defines a small utility for combining class names.

  It is used across reusable UI components to merge:
  - conditional classes
  - component variant classes
  - Tailwind utility classes

  Reference: https://github.com/dcastil/tailwind-merge
  https://dev.to/sheraz4194/mastering-tailwind-css-overcome-styling-conflicts-with-tailwind-merge-and-clsx-1dol
  https://github.com/lukeed/clsx
*/

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
