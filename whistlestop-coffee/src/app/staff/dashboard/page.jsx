'use client';

// React hooks for loading and updating staff order data
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/*
  This page provides a dashboard for staff and admin users.

  It displays active orders, allows staff to update order statuses,
  and shows key order information such as customer details, items,
  and totals. It interacts with backend API routes to fetch and update data.
*/

/**
 * Formats a number into GBP currency.
 * Example: 3.5 -> £3.50
 */
function money(n) {
  return `£${n.toFixed(2)}`;
}

/**
 * Converts backend order status values into friendlier text.
 */
function statusLabel(status) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ACCEPTED':
      return 'Accepted';
    case 'PREPARING':
      return 'Preparing';
    case 'READY':
      return 'Ready for collection';
    case 'COLLECTED':
      return 'Collected';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || '-';
  }
}

/**
 * Returns the next valid status actions available to staff.
 */
function getStatusActions(status) {
  switch (status) {
    case 'PENDING':
      return ['ACCEPTED', 'CANCELLED'];
    case 'ACCEPTED':
      return ['PREPARING', 'CANCELLED'];
    case 'PREPARING':
      return ['READY', 'CANCELLED'];
    case 'READY':
      return ['COLLECTED'];
    default:
      return [];
  }
}

export default function StaffDashboardPage() {
  const router = useRouter();
  // Holds active staff orders returned by the backend
  const [orders, setOrders] = useState([]);

  // Tracks whether staff orders are still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any loading or update error
  const [error, setError] = useState('');

  // Tracks which order is currently being updated
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Tracks whether logout is in progress
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Loads active staff orders from the backend API.
   */
  async function loadOrders() {
    try {
      setError('');

      const res = await fetch('/api/staff/orders', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load staff orders');
        setOrders([]);
        return;
      }

      setOrders(data.orders || []);
    } catch {
      setError('Something went wrong while loading staff orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load staff orders once when the page first renders
  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Updates an order's status from the dashboard.
   */
  async function handleStatusUpdate(orderId, status) {
    try {
      // Track which order is being updated to disable buttons
      setUpdatingOrderId(orderId);
      setError('');

      const res = await fetch(`/api/staff/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update order');
        return;
      }

      // Reload orders after updating status
      await loadOrders();
    } catch {
      setError('Something went wrong while updating the order.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  /**
   * Logs the current staff user out and returns to the login page.
   */
  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Calculate helpful dashboard summary counts
  const counts = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      preparing: orders.filter((o) => o.status === 'PREPARING').length,
      ready: orders.filter((o) => o.status === 'READY').length,
    };
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Dashboard summary */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Staff Dashboard</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border/60 bg-background/40 rounded-xl border p-3">
            <div className="text-muted-foreground text-xs">Active orders</div>
            <div className="text-lg font-semibold">{counts.total}</div>
          </div>

          <div className="border-border/60 bg-background/40 rounded-xl border p-3">
            <div className="text-muted-foreground text-xs">Pending</div>
            <div className="text-lg font-semibold">{counts.pending}</div>
          </div>

          <div className="border-border/60 bg-background/40 rounded-xl border p-3">
            <div className="text-muted-foreground text-xs">Preparing</div>
            <div className="text-lg font-semibold">{counts.preparing}</div>
          </div>

          <div className="border-border/60 bg-background/40 rounded-xl border p-3">
            <div className="text-muted-foreground text-xs">Ready</div>
            <div className="text-lg font-semibold">{counts.ready}</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions for staff */}
      <div className="flex flex-wrap justify-end gap-2">
        <Link href="/staff/archive">
          <Button variant="outline">View Archive</Button>
        </Link>

        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Button>
      </div>

      {/* Error message */}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      {/* Loading state */}
      {isLoading ? (
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              Loading active orders...
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Empty state */}
      {!isLoading && orders.length === 0 ? (
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              No active orders right now.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Active orders list */}
      {!isLoading &&
        orders.map((order) => {
          const actions = getStatusActions(order.status);

          return (
            <Card
              key={order.id}
              className="border-border/60 bg-card/70 coffee-card"
            >
              {/* Order header with id and current status */}
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">Order</CardTitle>
                    <div className="text-muted-foreground text-xs break-all">
                      {order.id}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-muted-foreground text-xs">Status</div>
                    <div className="font-semibold">
                      {statusLabel(order.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer details */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Customer
                    </div>
                    <div className="font-medium">{order.user?.name || '-'}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-xs">Email</div>
                    <div className="font-medium break-all">
                      {order.user?.email || '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-xs">Phone</div>
                    <div className="font-medium">
                      {order.user?.phone || '-'}
                    </div>
                  </div>
                </div>

                {/* Pickup details entered during checkout */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Pickup name
                    </div>
                    <div className="font-medium">{order.pickupName || '-'}</div>
                  </div>

                  {order.notes ? (
                    <div>
                      <div className="text-muted-foreground text-xs">Notes</div>
                      <div className="font-medium">{order.notes}</div>
                    </div>
                  ) : null}
                </div>

                {/* Ordered items */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Items</div>

                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{item.nameAtTime}</div>
                        <div className="text-muted-foreground text-xs">
                          Size: {item.size} · {money(item.priceAtTime)} each ·
                          Qty {item.quantity}
                        </div>
                      </div>

                      <div className="font-semibold">
                        {money(item.priceAtTime * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order total */}
                <div className="border-border/60 flex items-center justify-between border-t pt-3">
                  <div className="text-muted-foreground text-sm">Total</div>
                  <div className="font-semibold">
                    {money(order.totalAmount)}
                  </div>
                </div>

                {/* Status actions for staff */}
                {actions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant="outline"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStatusUpdate(order.id, status)}
                      >
                        {updatingOrderId === order.id
                          ? 'Updating...'
                          : statusLabel(status)}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
