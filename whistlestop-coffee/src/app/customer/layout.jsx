import AppShell from '@/components/layouts/AppShell';

export default function CustomerLayout({ children }) {
  return (
    <AppShell
      title="Whistlestop Coffee Hut"
      subtitle="Order ahead and pick up on arrival."
      showCustomerTabs
    >
      {children}
    </AppShell>
  );
}
