import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StaffDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/customer/menu">
          <Button variant="outline">View as customer</Button>
        </Link>
      </div>
      <div className="p-6">Staff Dashboard</div>
    </div>
  );
}
