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
const ca = process.env.AIVEN_CA_CERT?.replace(/\\n/g, '\n');

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

const DEFAULT_STATION = {
  slug: 'whistlestop-kiosk',
  name: 'Whistlestop Coffee Kiosk',
  location: 'Train station kiosk',
  isActive: true,
};

const OPENING_HOURS = [
  {
    dayOfWeek: 'MONDAY',
    openTime: '06:30',
    closeTime: '19:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'TUESDAY',
    openTime: '06:30',
    closeTime: '19:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'WEDNESDAY',
    openTime: '06:30',
    closeTime: '19:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'THURSDAY',
    openTime: '06:30',
    closeTime: '19:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'FRIDAY',
    openTime: '06:30',
    closeTime: '19:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'SATURDAY',
    openTime: '07:00',
    closeTime: '18:00',
    isClosed: false,
  },
  {
    dayOfWeek: 'SUNDAY',
    openTime: '00:00',
    closeTime: '00:00',
    isClosed: true,
  },
];

const MENU_ITEMS = [
  {
    slug: 'americano',
    name: 'Americano',
    description: 'Freshly brewed espresso topped with hot water.',
    imageUrl: '/images/menu/americano.svg',
    category: 'COFFEE',
    priceRegular: 1.5,
    priceLarge: 2.0,
    isAvailable: true,
  },
  {
    slug: 'americano-with-milk',
    name: 'Americano with milk',
    description: 'Classic americano finished with a splash of milk.',
    imageUrl: '/images/menu/americano_milk.svg',
    category: 'COFFEE',
    priceRegular: 2.0,
    priceLarge: 2.5,
    isAvailable: true,
  },
  {
    slug: 'latte',
    name: 'Latte',
    description: 'Smooth espresso with steamed milk.',
    imageUrl: '/images/menu/latte.svg',
    category: 'COFFEE',
    priceRegular: 2.5,
    priceLarge: 3.0,
    isAvailable: true,
  },
  {
    slug: 'cappuccino',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and a thick foam top.',
    imageUrl: '/images/menu/cappuccino.svg',
    category: 'COFFEE',
    priceRegular: 2.5,
    priceLarge: 3.0,
    isAvailable: true,
  },
  {
    slug: 'hot-chocolate',
    name: 'Hot Chocolate',
    description: 'Rich hot chocolate served warm.',
    imageUrl: '/images/menu/hot_chocolate.svg',
    category: 'CHOCOLATE',
    priceRegular: 2.0,
    priceLarge: 2.5,
    isAvailable: true,
  },
  {
    slug: 'mocha',
    name: 'Mocha',
    description: 'Chocolate-flavoured coffee with steamed milk.',
    imageUrl: '/images/menu/mocha.svg',
    category: 'COFFEE',
    priceRegular: 2.5,
    priceLarge: 3.0,
    isAvailable: true,
  },
  {
    slug: 'mineral-water',
    name: 'Mineral Water',
    description: 'Still bottled mineral water.',
    imageUrl: '/images/menu/water.svg',
    category: 'COLD_DRINK',
    priceRegular: 1.0,
    priceLarge: null,
    isAvailable: true,
  },
];

async function seedUsers() {
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
}
// function to update menu items
async function seedMenuItems() {
  for (const item of MENU_ITEMS) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl,
        priceRegular: item.priceRegular,
        priceLarge: item.priceLarge,
        isAvailable: item.isAvailable,
      },
      create: item,
    });
  }
}

/**
 * Seeds the default kiosk station and its editable weekly opening hours.
 */
async function seedStationAndOpeningHours() {
  // Create or update the default kiosk station.
  const station = await prisma.station.upsert({
    where: {
      slug: DEFAULT_STATION.slug,
    },
    update: {
      name: DEFAULT_STATION.name,
      location: DEFAULT_STATION.location,
      isActive: DEFAULT_STATION.isActive,
    },
    create: DEFAULT_STATION,
  });

  // Create or update one opening-hours record per day.
  for (const hour of OPENING_HOURS) {
    await prisma.openingHour.upsert({
      where: {
        stationId_dayOfWeek: {
          stationId: station.id,
          dayOfWeek: hour.dayOfWeek,
        },
      },
      update: {
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      },
      create: {
        stationId: station.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      },
    });
  }

  return station;
}

async function main() {
  await seedUsers();
  await seedMenuItems();
  await seedStationAndOpeningHours();

  console.log(
    'Seeded admin, staff, opening hours and menu items successfully.',
  );
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
