import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

/*
  This file seeds the database with default admin and staff users.

  It connects to the mysql database using Prisma, loads the SSL
  certificate for a secure connection, hashes the default passwords,
  and inserts the users if they do not already exist.
*/

// Load the SSL certificate used for secure database connection
const caPath = path.join(process.cwd(), 'certs', 'aiven-ca.pem');
const ca = fs.readFileSync(caPath, 'utf8');

// Configure the mysql adapter using environment variables
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

// Create a Prisma client using the MariaDB adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  // Hash default passwords before storing them in the database
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const staffPasswordHash = await bcrypt.hash('Staff123!', 10);

  // Create the admin user if it does not already exist
  await prisma.user.upsert({
    where: { email: 'admin@whistlestop.local' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@whistlestop.local',
      phone: '07000000000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // Create the staff user if it does not already exist
  await prisma.user.upsert({
    where: { email: 'staff@whistlestop.local' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@whistlestop.local',
      phone: '07111111111',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
    },
  });

  console.log('Seeded admin and staff users successfully.');
}

main()
  .catch((error) => {
    // Log any seed errors and exit with failure
    console.error('SEED ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Close the database connection when finished
    await prisma.$disconnect();
  });
