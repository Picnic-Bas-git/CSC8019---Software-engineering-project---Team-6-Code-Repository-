import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/orders/timeout
 * Cron job: Sweep and cancel active orders 15 minutes past their pickup time.
 */
export async function POST() {
  try {
    // 15-minute cutoff window
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);

    // Find active orders past their designated pickup time
    const overdueOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'PREPARING', 'READY'],
        },
        pickupTime: {
          lt: cutoffTime,
        },
      },
      select: { id: true }, // Select only IDs to reduce memory footprint
    });

    // Exit early if no orders require action
    if (overdueOrders.length === 0) {
      return NextResponse.json(
        { message: 'No overdue orders found at this time' },
        { status: 200 }
      );
    }

    // Batch cancel overdue orders safely via individual transactions
    const cancelPromises = overdueOrders.map((order) => {
      return prisma.$transaction(async (tx) => {
        return tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });

        // TODO: Implement HorsePay refund integration here once available
      });
    });

    await Promise.all(cancelPromises);

    return NextResponse.json(
      {
        message: 'Successfully swept overdue orders',
        cancelledCount: overdueOrders.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('CRON TIMEOUT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to process timeout orders' },
      { status: 500 }
    );
  }
}
