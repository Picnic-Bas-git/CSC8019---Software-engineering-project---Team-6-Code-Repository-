// React hooks for loading order data from the backend
import { useEffect, useMemo, useState } from 'react';

// Next.js helpers for reading the query string and navigation
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/*
  This page displays order status and history for the customer.

  It supports:
  - viewing a specific order via query parameters
  - viewing recent orders
  - displaying order details, status, and items
*/

/**
 * Formats a number into GBP currency.
 */
function money(n) {
  return `£${n.toFixed(2)}`;
}

/**
 * Converts backend order status values into user friendly text.
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
 * Helpful customer facing message for each order status.
 */
function statusMessage(status) {
  switch (status) {
    case 'PENDING':
      return 'Your order has been placed and is waiting for staff confirmation.';
    case 'ACCEPTED':
      return 'Your order has been accepted and will be prepared soon.';
    case 'PREPARING':
      return 'Your order is currently being prepared.';
    case 'READY':
      return 'Your order is ready for collection.';
    case 'COLLECTED':
      return 'Your order has already been collected.';
    case 'CANCELLED':
      return 'This order was cancelled.';
    default:
      return '';
  }
}

export default function StatusContent() {
  // Read possible order identifiers from the query params
  const searchParams = useSearchParams();
  const placedOrderId = searchParams.get('placed');
  const orderId = searchParams.get('orderId');

  // Holds the selected order currently being shown
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Holds the user's recent orders when no single order is selected
  const [orders, setOrders] = useState([]);

  // Tracks whether the page is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any loading error
  const [error, setError] = useState('');

  // Used to show a success banner only when arriving from checkout
  const isPlacedFlow = Boolean(placedOrderId);

  // Determine which single order id to load first, if any
  const selectedOrderId = placedOrderId || orderId;

  // allows person to order same item again
  async function handleOrderAgain() {
    if (!selectedOrder?.items?.length) return;

    try {
      setError(''); //blank error at start

      for (const item of selectedOrder.items) {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menuItemId: item.menuItemId,
            size: item.size,
            quantity: item.quantity,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to add item back to cart');
          return;
        }
      }

      window.dispatchEvent(new Event('cart-updated')); // updates the cart widget
      window.location.href = '/customer/cart';
    } catch {
      setError('Something went wrong while adding this order to your cart.');
    }
  }

  /**
   * Cancels the currently selected order.
   */
  async function handleCancelOrder() {
    if (!selectedOrder?.id) return;

    try {
      setError(''); // blank error state

      const res = await fetch('/api/orders/cancel', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to cancel order');
        return;
      }
      // if the order exists change specific fields
      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              status: data.order.status,
              cancelledAt: data.order.cancelledAt,
              cancellationReason: data.order.cancellationReason,
            }
          : current,
      );
    } catch {
      setError('Something went wrong while cancelling the order.');
    }
  }

  /**
   * Loads either:
   * - one specific order when an ID is provided
   * - or recent orders when no ID is present
   */
  useEffect(() => {
    async function loadStatusData() {
      try {
        setError('');
        setIsLoading(true);

        // Case 1: load a specific order
        if (selectedOrderId) {
          const res = await fetch(`/api/orders/${selectedOrderId}`, {
            cache: 'no-store',
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Failed to load order status');
            setSelectedOrder(null);
            setOrders([]);
            return;
          }

          setSelectedOrder(data.order);
          setOrders([]);
          return;
        }

        // Case 2: load recent orders
        const res = await fetch('/api/orders', {
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load orders');
          setSelectedOrder(null);
          setOrders([]);
          return;
        }

        const recentOrders = data.orders || [];
        setOrders(recentOrders);

        // Auto-select the most recent order
        if (recentOrders.length > 0) {
          setSelectedOrder(recentOrders[0]);
        } else {
          setSelectedOrder(null);
        }
      } catch {
        setError('Something went wrong while loading your order status.');
        setSelectedOrder(null);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadStatusData();
  }, [selectedOrderId]);

  // Check whether recent orders exist
  const hasRecentOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {/* Success message after placing an order */}
      {isPlacedFlow && !isLoading && selectedOrder ? (
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-green-600">
              Your order was placed successfully.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Main order status card */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading state */}
          {isLoading ? (
            <div className="text-muted-foreground text-sm">
              Loading order status...
            </div>
          ) : null}

          {/* Error state */}
          {!isLoading && error ? (
            <div className="space-y-3">
              <div className="text-sm text-red-500">{error}</div>
              <Link href="/customer/menu">
                <Button variant="outline">Back to menu</Button>
              </Link>
            </div>
          ) : null}

          {/* Empty, no past orders */}
          {!isLoading && !error && !selectedOrder ? (
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                You do not have any recent orders yet.
              </div>
              <Link href="/customer/menu">
                <Button>Browse the menu</Button>
              </Link>
            </div>
          ) : null}

          {/* Recent orders list */}
          {!isLoading && !error && !selectedOrderId && hasRecentOrders ? (
            <div className="space-y-3">
              <div className="text-sm font-medium">Recent orders</div>

              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className={[
                    'border-border/60 bg-background/40 w-full rounded-xl border p-3 text-left transition',
                    selectedOrder?.id === order.id ? 'ring-primary ring-2' : '',
                  ].join(' ')}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium break-all">{order.id}</div>
                      <div className="text-muted-foreground text-xs">
                        {statusLabel(order.status)}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {money(order.totalAmount)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {/* Selected order details */}
          {!isLoading && !error && selectedOrder ? (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Order ID</div>
                <div className="font-medium break-all">{selectedOrder.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">
                  Current status
                </div>
                <div className="font-semibold">
                  {statusLabel(selectedOrder.status)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Total</div>
                <div className="font-medium">
                  {money(selectedOrder.totalAmount)}
                </div>
              </div>

              {/* Pickup details entered during checkout */}
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Pickup name</div>
                <div className="font-medium">
                  {selectedOrder.pickupName || '-'}
                </div>
              </div>

              {selectedOrder.notes ? (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Notes</div>
                  <div className="font-medium">{selectedOrder.notes}</div>
                </div>
              ) : null}

              {/* Ordered items */}
              <div className="space-y-3 pt-2">
                <div className="text-sm font-medium">Items</div>

                {selectedOrder.items?.map((item) => (
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

              {/* Status message */}
              <div className="text-muted-foreground text-sm">
                {statusMessage(selectedOrder.status)}
              </div>

              {/* Customer cancellation. */}
              {['PENDING', 'ACCEPTED'].includes(selectedOrder.status) ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelOrder}
                >
                  Cancel order
                </Button>
              ) : null}

              {/* Navigation buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/customer/menu" className="sm:flex-1">
                  <Button variant="outline" className="w-full">
                    Back to menu
                  </Button>
                </Link>

                <Button className="w-full sm:flex-1" onClick={handleOrderAgain}>
                  Order again
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
