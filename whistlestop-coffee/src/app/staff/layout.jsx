import { redirect } from 'next/navigation';

import AppShell from '@/components/layouts/AppShell';
import { getCurrentUser } from '@/lib/session';

export default async function StaffLayout({ children }) {
  // Block non-staff users from reaching any /staff/* page.
  // Unauthenticated visitors are sent to login; customers are sent
  // back to the menu so they don't see internal order management.
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    redirect('/customer/menu');
  }

  return (
    <AppShell title="Staff" subtitle="Manage orders and update statuses.">
      {/* Displays the current staff page content inside the layout */}
      {children}
    </AppShell>
  );
}
