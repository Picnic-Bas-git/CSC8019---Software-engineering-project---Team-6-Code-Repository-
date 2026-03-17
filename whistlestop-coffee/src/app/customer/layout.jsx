import AppShell from '@/components/layouts/AppShell';

export default function CustomerLayout({ children }) {
  // Provides the shared customer-facing page layout
  // including the app header, footer, and customer navigation tabs
  return (
    <AppShell
      title="Whistlestop Coffee Hut"
      subtitle="Order ahead and pick up on arrival."
      showCustomerTabs
    >
      {/* Renders the active customer page inside the shared layout */}
      {children}
    </AppShell>
  );
}
