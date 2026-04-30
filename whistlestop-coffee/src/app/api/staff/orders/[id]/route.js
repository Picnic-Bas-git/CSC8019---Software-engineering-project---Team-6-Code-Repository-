import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrAdmin } from '@/lib/session';
import { updateOrderStatusSchema } from '@/lib/validations/staff-order';

/*
  This route is used by staff and admin users to view or update a single order.

  GET:
  - returns one order by its ID

  PATCH:
  - updates the order status
  - can optionally archive the order
  - awards loyalty when an order is collected
*/

export async function GET(_req, { params }) {
  try {
    // Ensure only staff or admin users can access this route
    await requireStaffOrAdmin();

    // Extract the order ID from the route parameters
    const { id } = await params;

    // Find the requested order and include user and item details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    // Return 404 if the order does not exist
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Return the requested order as JSON
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('STAFF ORDER GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return 403 if the user does not have the correct role
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return a server error if loading the order fails
    return NextResponse.json(
      {
        error: 'Failed to load staff order',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    // Ensure only staff or admin users can update orders
    await requireStaffOrAdmin();

    // Extract the order ID from the route parameters
    const { id } = await params;

    // Read and validate the submitted update data
    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    // Return validation errors if the submitted data is invalid
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Extract the validated order update values
    const { status, isArchived } = parsed.data;

    // Check whether the order exists before updating it
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle cancellation via transaction
    if (status === 'CANCELLED') {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const orderUpdate = await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            items: true,
          },
        });

        return orderUpdate;
      });

      return NextResponse.json(
        { message: 'Order cancelled successfully', order: updatedOrder },
        { status: 200 },
      );
    }

    // Handle normal status transitions (PREPARING, READY, etc.)
    const updateData = { status };

    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
      updateData.archivedAt = isArchived ? new Date() : null;
    }

    if (status === 'COLLECTED') {
      updateData.isArchived = true;
      updateData.archivedAt = new Date();
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const orderUpdate = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
        },
      });

      // Award loyalty only when the order becomes collected for the first time
      if (status === 'COLLECTED' && existingOrder.status !== 'COLLECTED') {
        await tx.loyaltyRecord.create({
          data: {
            userId: existingOrder.userId,
            orderId: existingOrder.id,
            type: 'EARN',
            pointsChange: 0,
            stampsChange: 1,
            description: `Earned from collected order ${existingOrder.id}`,
          },
        });

        await tx.user.update({
          where: { id: existingOrder.userId },
          data: {
            loyaltyStamps: {
              increment: 1,
            },
          },
        });
      }

      return orderUpdate;
    });

    return NextResponse.json(
      { message: 'Order status updated', order: updatedOrder },
      { status: 200 },
    );
  } catch (error) {
    // Log the error for debugging
    console.error('STAFF ORDER PATCH ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return 403 if the user does not have the correct role
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return a server error if updating the order fails
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
