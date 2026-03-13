import AppShell from '@/components/layouts/AppShell';

export default function AuthLayout({ children }) {
  return (
    <AppShell title="Account" subtitle="Login or create a customer account.">
      {children}
    </AppShell>
  );
}
