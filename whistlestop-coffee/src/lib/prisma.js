/*
  References:
  Prisma. (n.d.). Using Prisma with Next.js.
  https://www.prisma.io/docs/guides/frameworks/nextjs

  Mike, C. (2023). A beginner's guide to using Prisma with Node.js. Medium.
  https://medium.com/@chinedumike85/a-beginners-guide-to-using-prisma-with-node-js-ef3e040fad73
*/
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
