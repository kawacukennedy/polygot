import { PrismaClient } from '@prisma/client';

// Setup test database
const prisma = new PrismaClient();

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  await prisma.execution.deleteMany();
  await prisma.snippet.deleteMany();
  await prisma.user.deleteMany();
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});