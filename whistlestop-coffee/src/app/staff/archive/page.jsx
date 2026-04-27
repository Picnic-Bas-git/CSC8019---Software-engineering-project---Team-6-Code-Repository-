'use client';

// React hooks for loading archived order data
import { useEffect, useState } from 'react';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/*
  This page provides staff and admin users with access to archived orders.

  It displays orders that have already been archived, usually because
  they were collected or explicitly archived by staff.
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

export default function StaffArchivePage() {
  // Holds archived orders returned by the backend
  const [orders, setOrders] = useState([]);

  // Tracks whether archived orders are still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any loading error
  const [error, setError] = useState('');

  /**
   * Loads archived orders from the backend API.
   */
  async function loadArchivedOrders() {
    try {
      setError('');

      const res = await fetch('/api/staff/archive', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load archived orders');
        setOrders([]);
        return;
      }

      setOrders(data.orders || []);
    } catch {
      setError('Something went wrong while loading archived orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load archived orders once when the page first renders
  useEffect(() => {
    loadArchivedOrders();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Page heading card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Archived Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            View collected or archived customer orders.
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      {/* Loading state */}
      {isLoading ? (
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              Loading archived orders...
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Empty state */}
      {!isLoading && orders.length === 0 ? (
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              No archived orders yet.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Archived orders list */}
      {!isLoading &&
        orders.map((order) => (
          <Card
            key={order.id}
            className="border-border/60 bg-card/70 coffee-card"
          >
            {/* Order header with id and final status */}
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">Order</CardTitle>
                  <div className="text-muted-foreground text-xs break-all">
                    {order.id}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-muted-foreground text-xs">
                    Final status
                  </div>
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
                  <div className="text-muted-foreground text-xs">Customer</div>
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
                  <div className="font-medium">{order.user?.phone || '-'}</div>
                </div>
              </div>

              {/* Archived metadata */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-xs">Created</div>
                  <div className="font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs">Archived</div>
                  <div className="font-medium">
                    {order.archivedAt
                      ? new Date(order.archivedAt).toLocaleString()
                      : '-'}
                  </div>
                </div>
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
                        Size: {item.size} · {money(item.priceAtTime)} each · Qty{' '}
                        {item.quantity}
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
                <div className="font-semibold">{money(order.totalAmount)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
