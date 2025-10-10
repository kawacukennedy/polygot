"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Setup test database
const prisma = new client_1.PrismaClient();
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
