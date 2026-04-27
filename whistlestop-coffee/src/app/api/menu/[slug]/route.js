import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
  This route returns one menu item by its slug.

  It is used for item detail pages, where a specific menu item
  needs to be fetched and displayed based on the URL.
*/

export async function GET(_req, context) {
  try {
    // Extract the slug parameter from the route context
    const { slug } = await context.params;

    // Query the database for a single menu item matching the slug
    const item = await prisma.menuItem.findUnique({
      where: { slug },
      // Return only the fields needed for the item detail page
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

    // Return a 404 response if no matching menu item is found
    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    // Return the requested menu item as JSON
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    // Log and return a server error if the query fails
    console.error('MENU ITEM ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to load menu item',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
