'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

/*
  This component displays a light/dark mode toggle button.

  It uses next-themes to read and update the active theme,
  and lucide-react icons to show the current toggle action.

  Reference: https://ui.shadcn.com/docs/dark-mode/next
  https://github.com/pacocoursey/next-themes
*/
export default function ThemeToggle() {
  // Reads the current selected theme, system theme, and theme update function.
  const { theme, setTheme, systemTheme } = useTheme();

  // Prevents hydration mismatch by waiting until the component mounts.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Resolve "system" into the actual active light/dark theme.
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  // Check whether the currently active theme is dark.
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="bg-card/80 border-border shadow-sm backdrop-blur-md"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
