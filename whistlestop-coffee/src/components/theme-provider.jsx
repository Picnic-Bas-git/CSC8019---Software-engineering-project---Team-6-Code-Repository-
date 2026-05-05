'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// The file defines the theme provider from next, so that we can use light/dark mode
// Reference: https://ui.shadcn.com/docs/dark-mode/next
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
