import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load JWT secret from .env file
const JWT_SECRET = process.env.JWT_SECRET;

// Stop the app if the JWT secret is missing
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

// Hash a plain-text password before storing it
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compare a plain-text password with a stored hash, to make sure its correct
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Create a signed JWT that expires in 7 days
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify and decode a JWT
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
