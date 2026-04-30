import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/orders/timeout
 * Cron job: Sweep and cancel ready orders 15 minutes past their pickup time.
 */
export async function POST() {
  try {
    // 15-minute cutoff window based on customer pickup time
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);

    // Find READY orders past their designated pickup time
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

    const cancelPromises = overdueOrders.map((order) => {
      return prisma.$transaction(async (tx) => {
        return tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: 'Customer did not collect within 15 minutes',
          },
        });
      });
    });

    await Promise.all(cancelPromises);

    return NextResponse.json(
      {
        message: 'Successfully swept overdue ready orders',
        cancelledCount: overdueOrders.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('CRON TIMEOUT ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to process timeout orders' },
      { status: 500 },
    );
  }
}
