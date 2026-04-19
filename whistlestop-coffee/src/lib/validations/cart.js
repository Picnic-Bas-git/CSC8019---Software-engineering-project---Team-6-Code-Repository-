import { z } from 'zod';

/*
  This file defines validation rules for cart actions.

  It validates data for adding items to the cart and updating
  existing cart items before the data is processed by the application.
*/

// Validation rules for adding a new item to the cart
export const addToCartSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item id is required'),
  size: z.enum(['REGULAR', 'LARGE']),
  quantity: z.number().int().min(1).max(20),
});

// Validation rules for updating an existing cart item
export const updateCartItemSchema = z.object({
  size: z.enum(['REGULAR', 'LARGE']).optional(),
  quantity: z.number().int().min(1).max(20).optional(),
});
