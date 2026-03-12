import AppShell from '@/components/layouts/AppShell';

export default function StaffLayout({ children }) {
  return (
    <AppShell title="Staff" subtitle="Manage orders and update statuses.">
      {children}
    </AppShell>
  );
}
