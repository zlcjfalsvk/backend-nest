import { beforeAll, afterAll, beforeEach } from 'vitest';

import { PrismaClient } from '@prisma-client';

let prisma: PrismaClient;

beforeAll(async () => {
  // Initialize Prisma client for tests
  prisma = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://testuser:testpass@localhost:5433/testdb',
      },
    },
  });

  await prisma.$connect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma instance for use in tests
export { prisma };
