import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { updateCartItemSchema } from '@/lib/validations/cart';

/*
  This route handles updates and deletion for a single cart item.

  PATCH:
  - updates quantity and/or size
  - merges items if the same menu item and size already exist

  DELETE:
  - removes the cart item from the user's cart
*/

export async function PATCH(req, { params }) {
  try {
    // Ensure the user is signed in before modifying their cart
    const user = await requireUser();

    // Extract the cart item ID from the route parameters
    const { id } = await params;

    // Read and validate the submitted update data
    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantity, size } = parsed.data;

    // Find the cart item and ensure it belongs to the current user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        menuItem: {
          select: {
            id: true,
            priceLarge: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 },
      );
    }

    // Prevent selecting a large size for items without a large option
    if (size === 'LARGE' && existingCartItem.menuItem.priceLarge == null) {
      return NextResponse.json(
        { error: 'Large size is not available for this item' },
        { status: 400 },
      );
    }

    // Build update data dynamically (only include fields that were sent)
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (size !== undefined) updateData.size = size;

    // Handle case where size changes to one that already exists in the cart
    if (size && size !== existingCartItem.size) {
      const matchingItem = await prisma.cartItem.findUnique({
        where: {
          userId_menuItemId_size: {
            userId: user.id,
            menuItemId: existingCartItem.menuItemId,
            size,
          },
        },
      });

      if (matchingItem) {
        // Merge quantities into the existing matching item to avoid duplicates
        const mergedQuantity =
          (quantity ?? existingCartItem.quantity) + matchingItem.quantity;

        // Use a transaction to ensure both operations succeed together
        const updated = await prisma.$transaction(async (tx) => {
          const merged = await tx.cartItem.update({
            where: { id: matchingItem.id },
            data: {
              quantity: mergedQuantity,
            },
          });

          // Remove the original cart item after merging
          await tx.cartItem.delete({
            where: { id: existingCartItem.id },
          });

          return merged;
        });

        return NextResponse.json(
          {
            message: 'Cart item updated',
            cartItem: updated,
          },
          { status: 200 },
        );
      }
    }

    // Update the cart item directly when no merge is required
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Cart item updated',
        cartItem: updatedCartItem,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('CART PATCH ERROR:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to update cart item',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    // Ensure the user is signed in before modifying their cart
    const user = await requireUser();

    // Extract the cart item ID from the route parameters
    const { id } = await params;

    // Find the cart item and ensure it belongs to the current user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 },
      );
    }

    // Delete the cart item from the database
    await prisma.cartItem.delete({
      where: { id: existingCartItem.id },
    });

    return NextResponse.json(
      {
        message: 'Cart item removed',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('CART DELETE ERROR:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to remove cart item',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
