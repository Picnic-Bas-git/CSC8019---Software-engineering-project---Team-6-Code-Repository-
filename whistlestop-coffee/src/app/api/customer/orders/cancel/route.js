import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session'; // requireSession -> requireUser

const STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  CANCELLED: 'CANCELLED',
};

export async function PATCH(req) {
  try {
    // requireUser()
    const user = await requireUser();
    const userId = user.id;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          status: true,
          //loyaltyPointsUsed: true,
          //loyaltyPointsEarned: true,
        },
      });

      if (!order) throw new Error('ORDER_NOT_FOUND');
      if (order.userId !== userId) throw new Error('FORBIDDEN');

      const nonCancellable = [
        STATUS.PREPARING,
        STATUS.READY,
        STATUS.PICKED_UP,
        STATUS.CANCELLED,
      ];
      if (nonCancellable.includes(order.status)) {
        throw new Error(`CANNOT_CANCEL_${order.status}`);
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: STATUS.CANCELLED },
        select: { id: true, status: true },
      });

      //const pointsAdjustment = (order.loyaltyPointsUsed || 0) - (order.loyaltyPointsEarned || 0);

      /*if (pointsAdjustment !== 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: { increment: pointsAdjustment }
          }
        });

        await tx.loyaltyRecord.create({
          data: {
            userId: userId,
            orderId: orderId,
            points: pointsAdjustment,
            type: 'REFUND',
            reason: 'Order Cancelled'
          }
        });
      }*/

      return updatedOrder;
    });

    return NextResponse.json({
      message: 'Order successfully cancelled',
      order: result,
    });
  } catch (error) {
    console.error('CANCEL ORDER ERROR:', error.stack || error);

    if (error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message === 'FORBIDDEN')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (error.message === 'ORDER_NOT_FOUND')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (error.message.startsWith('CANNOT_CANCEL')) {
      const status = error.message.split('_').pop();
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
