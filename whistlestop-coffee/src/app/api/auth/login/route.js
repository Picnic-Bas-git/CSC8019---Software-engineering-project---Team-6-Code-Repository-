import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';

/*
  This file handles user login for the application.

  It validates the submitted login data, checks whether the user exists,
  verifies the password, creates a JWT token for authentication, and
  stores the token in a secure cookie for future requests.
*/

export async function POST(req) {
  try {
    // Read the JSON data sent in the request body
    const body = await req.json();

    // Validate the submitted login data
    const parsed = loginSchema.safeParse(body);

    // Return validation errors if the submitted data is invalid
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Extract the validated login details
    const { email, password } = parsed.data;

    // Check whether a user with this email exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return an error if no matching user is found
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Compare the entered password with the stored password hash
    const isValid = await comparePassword(password, user.passwordHash);

    // Reject the login if the password is incorrect
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Create a JWT token containing the user's ID and role
    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    // Build the success response with basic user details
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Store the token in an HTTP-only cookie for authentication
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    // Return a server error if login fails unexpectedly
    return NextResponse.json(
      {
        error: 'Something went wrong',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
