import { z } from 'zod';

/*
  This file defines validation rules for user authentication forms.

  It uses Zod to validate the data entered during registration and login,
  helping ensure that required fields are present and correctly formatted
  before the data is processed.

  Reference:
  Zod. (n.d.). Documentation. https://zod.dev/
  Python-JavaScript-PHP-HTML-CSS. (2024). Zod email validation and email confirmation.
  https://medium.com/@python-javascript-php-html-css/zod-email-validation-and-email-confirmation-f1cf3d5a915a
*/

// Validation rules for new user registration
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  phone: z
    .string()
    .min(11, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Validation rules for user login
export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
