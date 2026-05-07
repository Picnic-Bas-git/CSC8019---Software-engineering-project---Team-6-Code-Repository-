import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/*
  This file handles the route for retrieving the currently logged-in user.

  It checks whether a valid authenticated user exists in the current session.
  If a user is found, their details are returned. If not, an unauthorized
  response is sent back to the client.

  Referred to: https://medium.com/@balogunkehinde3/backend-authentication-with-next-js-prisma-jwt-cookies-and-middleware-31596ac93ae6
  https://www.youtube.com/watch?v=DJvM2lSPn6w
  
  
*/

export async function GET() {
  try {
    // Get the currently authenticated user from the session
    const user = await getCurrentUser();

    // Return an error if no logged-in user is found
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return the authenticated user's details
    return NextResponse.json({ user });
  } catch (error) {
    // Return a server error if the request fails unexpectedly
    return NextResponse.json(
      {
        error: 'Something went wrong',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
