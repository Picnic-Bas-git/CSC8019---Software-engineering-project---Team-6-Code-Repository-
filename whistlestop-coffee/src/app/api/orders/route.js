import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { createOrderSchema } from '@/lib/validations/order';
import { processHorsePayPayment } from '@/lib/horsepay';

/*
  This route handles order creation and order history for the current user.

  GET:
  - returns all orders belonging to the logged-in user

  POST:
  - creates a new order from the user's current cart
  - calculates totals on the backend
  - processes HorsePay payment
  - stores order items
  - stores payment record
  - clears the user's cart
  - updates loyalty points and stamps
*/

export async function GET() {
  try {
    const user = await requireUser();

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('ORDERS GET ERROR:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to load orders',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { pickupName, notes } = parsed.data;

    // Load the current cart including menu item pricing
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        menuItem: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate all items are still available and calculate totals
    let totalAmount = 0;

    const orderItemsData = cartItems.map((item) => {
      if (!item.menuItem || !item.menuItem.isAvailable) {
        throw new Error(
          `Item unavailable: ${item.menuItem?.name || 'Unknown item'}`,
        );
      }

      if (item.size === 'LARGE' && item.menuItem.priceLarge == null) {
        throw new Error(`Large size unavailable for ${item.menuItem.name}`);
      }

      const unitPrice =
        item.size === 'LARGE'
          ? (item.menuItem.priceLarge ?? item.menuItem.priceRegular)
          : item.menuItem.priceRegular;

      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      return {
        menuItemId: item.menuItemId,
        nameAtTime: item.menuItem.name,
        priceAtTime: unitPrice,
        size: item.size,
        quantity: item.quantity,
      };
    });

    // Step 1: process payment before creating the order
    const paymentResponse = await processHorsePayPayment({
      customerId: user.id,
      amount: totalAmount,
      currencyCode: 'GBP',
    });

    // HorsePay docs use this exact key name
    const paymentResult = paymentResponse?.paymetSuccess;
    const paymentSucceeded = paymentResult?.Status === true;
    const paymentReason = paymentResult?.reason || 'Unknown payment result';

    // If payment fails, do not create the order
    if (!paymentSucceeded) {
      return NextResponse.json(
        {
          error: 'Payment failed',
          reason: paymentReason,
          payment: paymentResponse,
        },
        { status: 400 },
      );
    }

    // Basic loyalty logic:
    // 1 stamp per order, 1 point per whole pound spent
    const loyaltyPointsEarned = Math.floor(totalAmount);
    const loyaltyStampsEarned = 1;

    const order = await prisma.$transaction(async (tx) => {
      // Create the main order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: 'PENDING',
          pickupName: pickupName.trim(),
          notes: notes?.trim() || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Store successful payment record
      await tx.paymentRecord.create({
        data: {
          orderId: newOrder.id,
          provider: 'HORSEPAY',
          amount: totalAmount,
          currency: 'GBP',
          status: 'PAID',
          transactionRef: `${newOrder.id}-${Date.now()}`,
          paidAt: new Date(),
        },
      });

      // Record loyalty changes
      await tx.loyaltyRecord.create({
        data: {
          userId: user.id,
          orderId: newOrder.id,
          type: 'EARN',
          pointsChange: loyaltyPointsEarned,
          stampsChange: loyaltyStampsEarned,
          description: `Earned from order ${newOrder.id}`,
        },
      });

      // Update user loyalty totals
      await tx.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: {
            increment: loyaltyPointsEarned,
          },
          loyaltyStamps: {
            increment: loyaltyStampsEarned,
          },
        },
      });

      // Clear the user's cart after successful order creation
      await tx.cartItem.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return newOrder;
    }, {
      // Aiven MySQL is remote, so 5 sequential writes can exceed Prisma's
      // default 5s interactive transaction timeout and surface as P2028.
      maxWait: 10000,
      timeout: 20000,
    });

    return NextResponse.json(
      {
        message: 'Payment successful and order placed',
        order,
        payment: paymentResponse,
        loyalty: {
          pointsEarned: loyaltyPointsEarned,
          stampsEarned: loyaltyStampsEarned,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('ORDERS POST ERROR:', error, 'meta:', error?.meta);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to place order',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
