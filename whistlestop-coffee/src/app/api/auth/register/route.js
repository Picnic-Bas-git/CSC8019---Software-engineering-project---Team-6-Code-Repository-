import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';

/*
  This file handles user registration for the application.

  It validates the submitted data, checks whether the email already exists,
  hashes the user's password for security, creates the new user in the
  database, and returns an appropriate JSON response.
*/

export async function POST(req) {
  try {
    // Read the JSON data sent in the request body
    const body = await req.json();

    // Validate the submitted registration data
    const parsed = registerSchema.safeParse(body);

    // Return validation errors if the submitted data is invalid
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Extract the validated user data
    const { name, email, phone, password } = parsed.data;

    // Check whether a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Prevent duplicate accounts using the same email
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 },
      );
    }

    // Hash the password before saving it to the database
    const passwordHash = await hashPassword(password);

    // Create the new user record in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
      },
      // Return only safe user fields in the response
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    // Return a success response after registration is complete
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    // Return a server error if registration fails unexpectedly
    return NextResponse.json(
      {
        error: 'Something went wrong',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
