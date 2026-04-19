import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { createOrderSchema } from '@/lib/validations/order';

/*
  This route handles order creation and order history for the current user.

  GET:
  - returns all orders belonging to the logged-in user

  POST:
  - creates a new order from the user's current cart
  - calculates totals on the backend
  - stores order items
  - clears the user's cart
  - updates loyalty points and stamps
*/

export async function GET() {
  try {
    // Ensure the user is signed in before accessing order history
    const user = await requireUser();

    // Load all orders for the current user, including their order items
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
      },
      // Show the most recent orders first
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return the user's order history
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('ORDERS GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if loading orders fails
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
    // Ensure the user is signed in before placing an order
    const user = await requireUser();

    // Read and validate the submitted order data
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Extract validated order details
    const { pickupName, notes } = parsed.data;

    // Load the current cart, including related menu item details and pricing
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        menuItem: true,
      },
      // Keep cart item order consistent
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Prevent an order being created from an empty cart
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate all cart items and calculate the total order amount
    let totalAmount = 0;

    const orderItemsData = cartItems.map((item) => {
      // Ensure the menu item still exists and is available
      if (!item.menuItem || !item.menuItem.isAvailable) {
        throw new Error(
          `Item unavailable: ${item.menuItem?.name || 'Unknown item'}`,
        );
      }

      // Prevent large size selection if the item has no large price
      if (item.size === 'LARGE' && item.menuItem.priceLarge == null) {
        throw new Error(`Large size unavailable for ${item.menuItem.name}`);
      }

      // Use the correct price based on the selected size
      const unitPrice =
        item.size === 'LARGE'
          ? (item.menuItem.priceLarge ?? item.menuItem.priceRegular)
          : item.menuItem.priceRegular;

      // Add the line total to the order total
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      // Save a snapshot of item details at the time of ordering
      return {
        menuItemId: item.menuItemId,
        nameAtTime: item.menuItem.name,
        priceAtTime: unitPrice,
        size: item.size,
        quantity: item.quantity,
      };
    });

    // Loyalty rule:
    // 1 stamp per order, 1 point per whole pound spent
    const loyaltyPointsEarned = Math.floor(totalAmount);
    const loyaltyStampsEarned = 1;

    // Use a transaction so order creation, loyalty updates,
    // and cart clearing either all succeed or all fail together
    const order = await prisma.$transaction(async (tx) => {
      // Create the main order and its related order items
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Record the loyalty points and stamp changes
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

      // Update the user's total loyalty values
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

      // Clear the user's cart after the order is created successfully
      await tx.cartItem.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return newOrder;
    });

    // Return a success response with the created order and loyalty summary
    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order,
        loyalty: {
          pointsEarned: loyaltyPointsEarned,
          stampsEarned: loyaltyStampsEarned,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Log the error for debugging
    console.error('ORDERS POST ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if order creation fails
    return NextResponse.json(
      {
        error: 'Failed to place order',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
