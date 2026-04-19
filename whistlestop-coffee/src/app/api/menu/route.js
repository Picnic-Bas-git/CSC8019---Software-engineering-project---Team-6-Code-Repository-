import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
  This route returns menu items for the customer menu page.

  It supports optional filtering by category and search text,
  while only returning items that are currently available.
  The route can be extended later to support station-specific menus.
*/

export async function GET(req) {
  try {
    // Read query parameters from the request URL
    const { searchParams } = new URL(req.url);

    // Get optional filters from the query string
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim() || '';

    // Query available menu items from the database
    const items = await prisma.menuItem.findMany({
      where: {
        // Only return menu items that are marked as available
        isAvailable: true,

        // Filter by category if one is provided
        ...(category ? { category } : {}),

        // Search by name or description if a search term is provided
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
      // Sort menu items alphabetically by name
      orderBy: {
        name: 'asc',
      },
      // Return only the fields needed by the menu page
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        imageUrl: true,
        priceRegular: true,
        priceLarge: true,
        isAvailable: true,
      },
    });

    // Return the filtered menu items as JSON
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    // Log and return a server error if the query fails
    console.error('MENU LIST ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to load menu items',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
