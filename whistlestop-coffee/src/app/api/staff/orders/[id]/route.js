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

    // Start building the update payload with the new order status
    const updateData = {
      status,
    };

    // Archive or unarchive the order if explicitly requested
    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
      updateData.archivedAt = isArchived ? new Date() : null;
    }

    // Automatically archive orders once they are collected
    if (status === 'COLLECTED') {
      updateData.isArchived = true;
      updateData.archivedAt = new Date();
    }

    // Record when the order was cancelled
    if (status === 'CANCELLED' && !existingOrder.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    // Update the order and return the latest user and item details
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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

    // Return the updated order as JSON
    return NextResponse.json(
      {
        message: 'Order updated successfully',
        order: updatedOrder,
      },
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
