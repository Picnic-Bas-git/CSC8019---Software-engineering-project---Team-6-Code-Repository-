import AppShell from '@/components/layouts/AppShell';

export default function AuthLayout({ children }) {
  return (
    // Wraps all auth pages in the shared application shell layout
    // Ie the header/footer specific to those pages
    <AppShell title="Account" subtitle="Login or create a customer account.">
      {/* Renders the current auth page content, such as login or register */}
      {children}
    </AppShell>
  );
}
