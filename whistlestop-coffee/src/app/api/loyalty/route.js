import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

/*
  This route is used by the signed-in customer to view loyalty details.

  GET:
  - returns the user's current loyalty totals
  - returns loyalty history from LoyaltyRecord
*/

export async function GET() {
  try {
    // Ensure the user is signed in before accessing loyalty data
    const user = await requireUser();

    // Load the user's current loyalty totals from the user record
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        loyaltyPoints: true,
        loyaltyStamps: true,
      },
    });

    // Return 404 if the user no longer exists in the database
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Load loyalty history for this user, showing newest records first
    const history = await prisma.loyaltyRecord.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return both current loyalty totals and loyalty history
    return NextResponse.json(
      {
        loyalty: {
          points: currentUser.loyaltyPoints,
          stamps: currentUser.loyaltyStamps,
        },
        history,
      },
      { status: 200 },
    );
  } catch (error) {
    // Log the error for debugging
    console.error('LOYALTY GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if loading loyalty data fails
    return NextResponse.json(
      {
        error: 'Failed to load loyalty data',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
