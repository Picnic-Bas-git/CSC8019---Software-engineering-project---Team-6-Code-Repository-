import { z } from 'zod';

/*
  This file defines validation rules for placing orders.

  It checks that the customer provides the required information
  before an order can be submitted.
*/

// Validation rules for creating a new order
export const createOrderSchema = z.object({
  pickupName: z.string().min(1, 'Pickup name is required'),
  // Notes are optional
  notes: z.string().optional().or(z.literal('')),
});
