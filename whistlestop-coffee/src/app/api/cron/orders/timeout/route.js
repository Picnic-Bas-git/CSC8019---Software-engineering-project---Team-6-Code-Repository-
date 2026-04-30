import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/orders/timeout
 * Cron job: Sweep and cancel ready orders 15 minutes past their pickup time.
 */
export async function POST(req) { // Fix: Added 'req' parameter to access headers

  // Security check: Validate the authorization header against the secret key
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Fix: Unified response type using NextResponse
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Define the 15-minute cutoff window[cite: 1]
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);

    // Fetch all READY orders that have passed the pickup time[cite: 1]
    const overdueOrders = await prisma.order.findMany({
      where: {
        status: 'READY',
        pickupTime: {
          lt: cutoffTime,
        },
      },
      select: { id: true },
    });

    if (overdueOrders.length === 0) {
      return NextResponse.json(
        { message: 'No overdue orders found at this time' },
        { status: 200 },
      );
    }

    // Extract IDs for bulk update
    const orderIds = overdueOrders.map(o => o.id);

    // Fix: Wrapped in a single transaction for better performance and atomicity
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          id: { in: orderIds }
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'Customer did not collect within 15 minutes',
        },
      });
    });

    return NextResponse.json(
      {
        message: 'Successfully swept overdue ready orders',
        cancelledCount: overdueOrders.length,
        processedIds: orderIds // Added for better logging and debugging
      },
      { status: 200 },
    );
  } catch (error) {
    // Fix: Comprehensive error logging with stack trace[cite: 3]
    console.error('CRON TIMEOUT CRITICAL ERROR:', error.message, error.stack);

    return NextResponse.json(
      { error: 'Failed to process timeout orders', details: error.message },
      { status: 500 },
    );
  }
}
