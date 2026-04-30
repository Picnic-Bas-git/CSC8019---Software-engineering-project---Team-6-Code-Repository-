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
  - applies a free item discount if the customer redeems loyalty
  - processes HorsePay payment
  - stores order items
  - stores payment record
  - stores loyalty redemption if used
  - clears the user's cart

  Loyalty earning is not handled here.
  A customer earns loyalty only when staff marks the order as collected.
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

    const { pickupName, notes, pickupTime, redeemFreeItem } = parsed.data;

    // Format pickup time from HH:MM into a Date for today's date
    const [hours, minutes] = pickupTime.split(':').map(Number);

    const pickupDateTime = new Date();
    pickupDateTime.setHours(hours, minutes, 0, 0);

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

    // Apply free item loyalty discount if the customer has enough collected orders
    let discountAmount = 0;

    if (redeemFreeItem) {
      const freshUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { loyaltyStamps: true },
      });

      if ((freshUser?.loyaltyStamps ?? 0) < 9) {
        return NextResponse.json(
          {
            error:
              'You do not have enough collected orders to claim a free item.',
          },
          { status: 400 },
        );
      }

      // Make the cheapest single item free
      const cheapestItem = orderItemsData.reduce((cheapest, item) =>
        item.priceAtTime < cheapest.priceAtTime ? item : cheapest,
      );

      discountAmount = cheapestItem.priceAtTime;
      totalAmount = Math.max(0, totalAmount - discountAmount);
    }

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

    const order = await prisma.$transaction(
      async (tx) => {
        // Create the main order
        const newOrder = await tx.order.create({
          data: {
            userId: user.id,
            totalAmount,
            status: 'PENDING',
            pickupName: pickupName.trim(),
            pickupTime: pickupDateTime,
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

        // If a free item was redeemed, remove 9 collected-order stamps
        if (redeemFreeItem && discountAmount > 0) {
          await tx.loyaltyRecord.create({
            data: {
              userId: user.id,
              orderId: newOrder.id,
              type: 'REDEEM',
              pointsChange: 0,
              stampsChange: -9,
              description: `Redeemed free item on order ${newOrder.id}`,
            },
          });

          await tx.user.update({
            where: { id: user.id },
            data: {
              loyaltyStamps: {
                decrement: 9,
              },
            },
          });
        }

        // Clear the user's cart after successful order creation
        await tx.cartItem.deleteMany({
          where: {
            userId: user.id,
          },
        });

        return newOrder;
      },
      {
        // Aiven MySQL is remote, so the sequential writes can exceed Prisma's
        // default 5s interactive transaction timeout and surface as P2028.
        maxWait: 10000,
        timeout: 20000,
      },
    );

    return NextResponse.json(
      {
        message: 'Payment successful and order placed',
        order,
        payment: paymentResponse,
        discount: {
          freeItemRedeemed: Boolean(redeemFreeItem && discountAmount > 0),
          discountAmount,
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
