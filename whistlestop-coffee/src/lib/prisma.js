/*
  References:
  Prisma. (n.d.). Using Prisma with Next.js.
  https://www.prisma.io/docs/guides/frameworks/nextjs, https://www.prisma.io/docs/prisma-orm/quickstart/mysql

  Mike, C. (2023). A beginner's guide to using Prisma with Node.js. Medium.
  https://medium.com/@chinedumike85/a-beginners-guide-to-using-prisma-with-node-js-ef3e040fad73
*/
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis;

// Read Aiven project CA certificate
const caPath = path.join(process.cwd(), 'certs', 'aiven-ca.pem');
const ca = fs.readFileSync(caPath, 'utf8');

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  connectTimeout: 10000,
  acquireTimeout: 10000,
  connectionLimit: 5,
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
