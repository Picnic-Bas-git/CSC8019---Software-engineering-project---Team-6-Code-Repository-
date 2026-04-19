import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrAdmin } from '@/lib/session';

/*
  This route is used by staff and admin users to view archived orders.

  It returns all orders that have been archived, including customer
  details and order items, sorted from most recently archived first.
*/

export async function GET() {
  try {
    // Ensure only staff or admin users can access archived orders
    await requireStaffOrAdmin();

    // Load all archived orders from the database
    const orders = await prisma.order.findMany({
      where: {
        isArchived: true,
      },
      include: {
        // Include basic customer details for each archived order
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // Include all items that belong to each order
        items: true,
      },
      // Show the most recently archived orders first
      orderBy: {
        archivedAt: 'desc',
      },
    });

    // Return the archived orders as JSON
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('ARCHIVE GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return 403 if the user does not have the correct role
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return a server error if loading archived orders fails
    return NextResponse.json(
      {
        error: 'Failed to load archived orders',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
