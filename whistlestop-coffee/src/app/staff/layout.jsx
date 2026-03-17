import AppShell from '@/components/layouts/AppShell';

export default function StaffLayout({ children }) {
  // Shared layout for staff-only pages
  // Provides a consistent page wrapper for order management screens
  return (
    <AppShell title="Staff" subtitle="Manage orders and update statuses.">
      {/* Displays the current staff page content inside the layout */}
      {children}
    </AppShell>
  );
}
