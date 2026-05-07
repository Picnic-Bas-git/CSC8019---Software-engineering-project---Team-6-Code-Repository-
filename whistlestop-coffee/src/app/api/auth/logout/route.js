import { NextResponse } from 'next/server';

/*
  This file handles user logout for the application.

  It removes the authentication token stored in the cookie by replacing it
  with an empty value and setting its lifetime to zero, which logs the user out.

  Referred to: https://medium.com/@balogunkehinde3/backend-authentication-with-next-js-prisma-jwt-cookies-and-middleware-31596ac93ae6
  https://www.youtube.com/watch?v=DJvM2lSPn6w
*/

export async function POST() {
  // Create a JSON response confirming logout
  const response = NextResponse.json({
    message: 'Logout successful',
  });

  // Clear the authentication cookie to log the user out
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire the cookie immediately
  });

  return response;
}
