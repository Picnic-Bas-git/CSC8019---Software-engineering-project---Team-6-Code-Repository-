import { z } from 'zod';

/*
  This file defines validation rules for placing orders.

  It checks that the customer provides the required information
  before an order can be submitted.
*/

// Validation rules for creating a new order
export const createOrderSchema = z.object({
  pickupName: z.string().min(1, 'Pickup name is required'),

  // Customer must choose their expected pickup/arrival time
  pickupTime: z
    .string()
    .min(1, 'Pickup time is required')
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Pickup time must be in HH:MM format'),

  // Notes are optional
  notes: z.string().optional().or(z.literal('')),

  // Customer can claim a free item if they have 9 collected orders
  redeemFreeItem: z.boolean().optional(),
});
