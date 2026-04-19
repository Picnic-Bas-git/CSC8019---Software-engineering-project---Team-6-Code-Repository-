import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrAdmin } from '@/lib/session';

/*
  This route is used by staff and admin users to view active orders.

  It returns all non-archived orders, including customer details
  and order items, sorted from newest to oldest.
*/

export async function GET() {
  try {
    // Ensure only staff or admin users can access this route
    await requireStaffOrAdmin();

    // Load all active (non-archived) orders
    const orders = await prisma.order.findMany({
      where: {
        isArchived: false,
      },
      include: {
        // Include basic customer information for each order
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // Include all items belonging to each order
        items: true,
      },
      // Show the newest orders first
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return the active orders as JSON
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('STAFF ORDERS GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return 403 if the user does not have the correct role
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return a server error if loading orders fails
    return NextResponse.json(
      {
        error: 'Failed to load staff orders',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
