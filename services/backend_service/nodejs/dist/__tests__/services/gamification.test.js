"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const gamification_1 = require("../../services/gamification");
const prisma = new client_1.PrismaClient();
describe('Gamification Service', () => {
    beforeEach(async () => {
        // Clean up
        await prisma.leaderboard.deleteMany();
        await prisma.user.deleteMany();
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    describe('awardPoints', () => {
        it('should award points and update leaderboard', async () => {
            // Create test user
            const user = await prisma.user.create({
                data: {
                    username: 'testuser',
                    email: 'test@example.com',
                    passwordHash: 'hash',
                },
            });
            await (0, gamification_1.awardPoints)(user.id, 'snippet_shared');
            const leaderboard = await prisma.leaderboard.findUnique({
                where: { userId: user.id },
            });
            expect(leaderboard).toBeTruthy();
            expect(leaderboard.score).toBe(10);
            expect(leaderboard.snippetsShared).toBe(1);
        });
    });
    describe('checkAchievements', () => {
        it('should unlock first_snippet achievement', async () => {
            const user = await prisma.user.create({
                data: {
                    username: 'testuser2',
                    email: 'test2@example.com',
                    passwordHash: 'hash',
                },
            });
            // Create a snippet
            await prisma.snippet.create({
                data: {
                    title: 'Test Snippet',
                    code: 'print("hello")',
                    language: 'PYTHON',
                    ownerId: user.id,
                },
            });
            const achievements = await (0, gamification_1.checkAchievements)(user.id);
            expect(achievements).toContain('first_snippet');
            const updatedUser = await prisma.user.findUnique({
                where: { id: user.id },
            });
            expect(updatedUser.achievements).toContain('first_snippet');
        });
    });
});
