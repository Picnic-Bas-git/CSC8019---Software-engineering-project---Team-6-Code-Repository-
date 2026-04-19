import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { addToCartSchema } from '@/lib/validations/cart';

/*
  This route handles the current signed-in user's cart.

  GET:
  - returns all cart items for the logged-in user

  POST:
  - adds a new item to the cart
  - if the same item and size already exist, quantity is increased
*/

export async function GET() {
  try {
    // Ensure the user is signed in before reading their cart
    const user = await requireUser();

    // Load cart items for the current user, including related menu item details
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        menuItem: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            imageUrl: true,
            priceRegular: true,
            priceLarge: true,
            isAvailable: true,
          },
        },
      },
      // Show older cart items first
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Convert database records into a frontend-friendly cart structure
    const items = cartItems.map((item) => {
      // Use the large price if selected, otherwise use the regular price
      const unitPrice =
        item.size === 'LARGE'
          ? (item.menuItem.priceLarge ?? item.menuItem.priceRegular)
          : item.menuItem.priceRegular;

      return {
        id: item.id,
        userId: item.userId,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        slug: item.menuItem.slug,
        description: item.menuItem.description,
        imageUrl: item.menuItem.imageUrl,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        isAvailable: item.menuItem.isAvailable,
      };
    });

    // Return the user's cart items as JSON
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    // Log the error for debugging
    console.error('CART GET ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if loading the cart fails
    return NextResponse.json(
      {
        error: 'Failed to load cart',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    // Ensure the user is signed in before modifying their cart
    const user = await requireUser();

    // Read and validate the submitted cart data
    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);

    // Return validation errors if the submitted data is invalid
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Extract the validated cart values
    const { menuItemId, size, quantity } = parsed.data;

    // Confirm the menu item exists and is currently available
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: {
        id: true,
        name: true,
        priceRegular: true,
        priceLarge: true,
        isAvailable: true,
      },
    });

    // Return 404 if the selected menu item does not exist
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    // Prevent users from adding unavailable items
    if (!menuItem.isAvailable) {
      return NextResponse.json(
        { error: 'This item is currently unavailable' },
        { status: 400 },
      );
    }

    // Prevent selecting a large size for items that do not have one
    if (size === 'LARGE' && menuItem.priceLarge == null) {
      return NextResponse.json(
        { error: 'Large size is not available for this item' },
        { status: 400 },
      );
    }

    // Check whether this exact item and size already exist in the user's cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_menuItemId_size: {
          userId: user.id,
          menuItemId,
          size,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Increase the quantity if the item already exists in the cart
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      // Otherwise create a new cart item record
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          menuItemId,
          size,
          quantity,
        },
      });
    }

    // Return a success response after the cart is updated
    return NextResponse.json(
      {
        message: 'Item added to cart',
        cartItem,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log the error for debugging
    console.error('CART POST ERROR:', error);

    // Return 401 if the user is not authenticated
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a server error if adding to the cart fails
    return NextResponse.json(
      {
        error: 'Failed to add item to cart',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
