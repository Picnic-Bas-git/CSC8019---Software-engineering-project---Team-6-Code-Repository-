import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

/*
  This file manages user authentication and access control.

  It retrieves the login token from browser cookies, verifies the token,
  fetches the current user from the database, and provides helper
  functions to restrict access to authenticated users and staff/admin users.
*/

// Name of the authentication cookie
const TOKEN_NAME = 'token';

// Get the JWT token stored in cookies
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value || null;
}

// Get the currently logged-in user
export async function getCurrentUser() {
  try {
    const token = await getTokenFromCookies();

    if (!token) return null;

    const decoded = verifyToken(token);

    if (!decoded?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        loyaltyPoints: true,
        loyaltyStamps: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    // Return null if the token is invalid or missing
    return null;
  }
}

// Require a logged-in user
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Require staff or admin privileges
export async function requireStaffOrAdmin() {
  const user = await requireUser();

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return user;
}
