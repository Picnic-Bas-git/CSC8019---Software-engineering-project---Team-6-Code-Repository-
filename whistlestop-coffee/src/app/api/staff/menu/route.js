import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrAdmin } from '@/lib/session';

// Matches the Category enum in schema.prisma
const MENU_CATEGORIES = ['COFFEE', 'TEA', 'PASTRY', 'SNACK', 'COLD_DRINK', 'CHOCOLATE'];

export async function POST(req) {
  try {
    // Enforce staff/admin access
    await requireStaffOrAdmin();

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { name, slug, description, category, priceRegular, priceLarge, imageUrl } = body;

    if (!name || !slug || !description || !category || priceRegular === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();
    const cleanDesc = description.trim();
    const cleanCategory = category.trim().toUpperCase();

    // Validate slug format (e.g., "iced-latte")
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(cleanSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    if (!MENU_CATEGORIES.includes(cleanCategory)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const regularPrice = parseFloat(priceRegular);
    const largePrice = priceLarge ? parseFloat(priceLarge) : null;

    if (isNaN(regularPrice) || regularPrice < 0) {
      return NextResponse.json({ error: 'Invalid regular price' }, { status: 400 });
    }
    if (largePrice !== null && (isNaN(largePrice) || largePrice < 0)) {
      return NextResponse.json({ error: 'Invalid large price' }, { status: 400 });
    }

    // Insert into database
    const newItem = await prisma.menuItem.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        description: cleanDesc,
        category: cleanCategory,
        priceRegular: regularPrice,
        priceLarge: largePrice,
        imageUrl: imageUrl?.trim() || null,
        isAvailable: true,
      },
    });

    return NextResponse.json(
      { message: 'Menu item created', item: newItem },
      { status: 201 }
    );

  } catch (error) {
    console.error('STAFF MENU POST ERROR:', error.stack || error);

    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Handle Prisma unique constraint violation for slugs
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
