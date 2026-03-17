// Imports Google fonts and exposes them as CSS variables
import { Geist, Geist_Mono } from 'next/font/google';

// Global stylesheet applied across the whole app
import './globals.css';

// Theme provider used for light and dark mode support
import { ThemeProvider } from '@/components/theme-provider';

// Configure the main sans-serif font
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Configure the monospace font
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Global metadata for the entire application
// Used by Next.js for document title, description, icons, and SEO basics
export const metadata = {
  title: {
    // Default title used when a page does not provide its own title
    default: 'Whistlestop Coffee Hut',

    // Template used when child pages set a title
    // Example: "Cart | Whistlestop Coffee Hut"
    template: '%s | Whistlestop Coffee Hut',
  },

  // Main meta description for the site
  description:
    'Order ahead for collection at Whistlestop Coffee Hut at Cramlington Station. Track order status and collect when ready.',

  // App name shown in some installable/web app contexts
  applicationName: 'Whistlestop Coffee Hut',

  // Basic keywords metadata
  keywords: [
    'coffee',
    'order ahead',
    'Cramlington Station',
    'kiosk',
    'pickup',
    'loyalty',
  ],

  // Favicon and app icon settings
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

/**
 * Root layout for the entire application.
 * Wraps every page with global HTML structure, fonts, and theme support.
 */
export default function RootLayout({ children }) {
  return (
    // Root HTML element for the app
    <html lang="en" suppressHydrationWarning>
      <body
        // Applies font CSS variables and antialiasing globally
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Provides theme support to the whole app */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Renders all route content inside the global layout */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
