import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/*
  Middleware protects private routes before the page loads.

  Rules:
  - Customer private pages require a valid login token
  - Staff pages require a valid login token with STAFF or ADMIN role
*/

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Reads and verifies the auth token from cookies.
 * Returns the decoded token payload when valid, otherwise null.
 */
function getUserFromRequest(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token || !JWT_SECRET) {
      return null;
    }

    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function proxy(req) {
  const { pathname } = req.nextUrl;

  // Read the current user from the auth cookie
  const user = getUserFromRequest(req);

  // Customer-only protected pages
  const customerProtectedPaths = [
    '/customer/cart',
    '/customer/order',
    '/customer/status',
    '/customer/loyalty',
    '/customer/account',
  ];

  // Check whether the current route is one of the protected customer pages
  const isCustomerProtected = customerProtectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );

  // Check whether the current route is under the staff section
  const isStaffRoute = pathname === '/staff' || pathname.startsWith('/staff/');

  // If a user is not logged in and tries to access a protected customer page,
  // send them to the login page
  if (isCustomerProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If a user is not logged in and tries to access a staff page,
  // send them to the login page
  if (isStaffRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If a logged-in user is not staff/admin and tries to access staff pages,
  // send them to the customer menu instead
  if (isStaffRoute && user && user.role !== 'STAFF' && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/customer/menu', req.url));
  }

  return NextResponse.next();
}

/*
  Limit middleware execution to important routes
*/
export const config = {
  matcher: [
    '/customer/cart/:path*',
    '/customer/order/:path*',
    '/customer/status/:path*',
    '/customer/loyalty/:path*',
    '/customer/account/:path*',
    '/staff/:path*',
  ],
};
