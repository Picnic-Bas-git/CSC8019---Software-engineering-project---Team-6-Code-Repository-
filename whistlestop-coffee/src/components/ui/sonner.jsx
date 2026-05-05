'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

/*
  This file defines the reusable toast notification component.

  Toasts are used to show short feedback messages, such as:
  - successful cart updates
  - validation errors
  - loading states
  - warning or informational messages

  References: https://sonner.emilkowal.ski/
https://ui.shadcn.com/docs/components/radix/sonner
*/
const Toaster = ({ ...props }) => {
  // Reads the current app theme so toast styling matches light/dark mode.
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        // Success icon used for completed actions
        success: <CircleCheckIcon className="size-4" />,

        // Info icon used for neutral messages
        info: <InfoIcon className="size-4" />,

        // Warning icon used for cautionary messages
        warning: <TriangleAlertIcon className="size-4" />,

        // Error icon used for failed actions
        error: <OctagonXIcon className="size-4" />,

        // Loading icon used while an async action is running
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        // Uses theme tokens so toast colors match the rest of the app.
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)',
      }}
      toastOptions={{
        classNames: {
          // Shared toast class for any custom toast styling.
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
