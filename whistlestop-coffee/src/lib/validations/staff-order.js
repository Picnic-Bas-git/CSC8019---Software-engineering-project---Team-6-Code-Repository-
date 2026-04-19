import { z } from 'zod';

/*
  Validation rules for staff order management.

  Staff can update an order's status and optionally archive it.
*/

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'COLLECTED',
    'CANCELLED',
  ]),
  isArchived: z.boolean().optional(),
});
