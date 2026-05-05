import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

/** Referred to: https://www.youtube.com/watch?v=YeFzkC2awTM
https://nextjs.org/docs/app/getting-started/route-handlers
https://www.youtube.com/watch?v=5miHyP6lExg
*/

/*
  This route allows a customer to cancel one of their own orders.

  Customers can only cancel orders that are still early in the workflow.
  Once staff are preparing the order, or the order is ready/collected/cancelled,
  cancellation is no longer allowed.
*/

const STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COLLECTED: 'COLLECTED',
  CANCELLED: 'CANCELLED',
};

export async function PATCH(req) {
  try {
    // Ensure the user is signed in before allowing order cancellation.
    const user = await requireUser();

    let body;

    try {
      // Read the submitted request body.
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Extract the order ID from the request body.
    const { orderId } = body;

    // Return a validation error if no order ID was provided.
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    // Use a transaction so the read and update happen safely together.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Find the order and only select fields needed for this cancellation rule.
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          status: true,
        },
      });

      // Stop if the order does not exist.
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // Customers can only cancel their own orders.
      if (order.userId !== user.id) {
        throw new Error('FORBIDDEN');
      }

      // Orders should not be cancellable once staff have started preparing them.
      const nonCancellableStatuses = [
        STATUS.PREPARING,
        STATUS.READY,
        STATUS.COLLECTED,
        STATUS.CANCELLED,
      ];

      if (nonCancellableStatuses.includes(order.status)) {
        throw new Error(`CANNOT_CANCEL_${order.status}`);
      }

      // Mark the order as cancelled.
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: STATUS.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled by customer',
        },
        select: {
          id: true,
          status: true,
          cancelledAt: true,
          cancellationReason: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: 'Order successfully cancelled',
        order: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('CANCEL ORDER ERROR:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (error.message === 'ORDER_NOT_FOUND') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (error.message.startsWith('CANNOT_CANCEL_')) {
      const status = error.message.replace('CANNOT_CANCEL_', '');

      return NextResponse.json(
        { error: `Cannot cancel order in ${status} status` },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
