import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

/*
  This route returns a single order for the current logged-in user.

  Customers can only view their own orders, while staff and admin users
  are allowed to view any order in the system.
*/

export async function GET(_req, { params }) {
  try {
    // Ensure the user is signed in before viewing an order
    const user = await requireUser();

    // Extract the order ID from the route parameters
    const { id } = await params;

    // Find the requested order and include its related items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    // Return 404 if the requested order does not exist
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check whether the current user has staff/admin access
    const isStaff = user.role === 'STAFF' || user.role === 'ADMIN';

    // Check whether the current user owns this order
    const ownsOrder = order.userId === user.id;

    // Prevent customers from viewing other users' orders
    if (!isStaff && !ownsOrder) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return the requested order as JSON
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('ORDER GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if loading the order fails
    return NextResponse.json(
      {
        error: 'Failed to load order',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
