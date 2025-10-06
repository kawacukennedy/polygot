"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAchievements = exports.awardPoints = void 0;
const client_1 = require("@prisma/client");
const analytics_1 = require("./analytics");
const prisma = new client_1.PrismaClient();
const ACHIEVEMENTS = [
    {
        id: 'first_snippet',
        criteria: { snippets_created: 1 },
        points: 50
    },
    {
        id: 'top_10',
        criteria: { leaderboard_position: { lte: 10 } },
        points: 100
    },
    {
        id: '100_runs',
        criteria: { total_runs: 100 },
        points: 75
    }
];
const POINTS_CONFIG = {
    snippet_shared: 10,
    snippet_run: 2,
    daily_login: 1,
    achievement_unlocked: 50
};
const awardPoints = async (userId, action) => {
    const points = POINTS_CONFIG[action];
    // Update leaderboard score
    await prisma.leaderboard.upsert({
        where: { userId },
        create: {
            userId,
            score: points
        },
        update: {
            score: { increment: points }
        }
    });
    // Check for achievements
    await (0, exports.checkAchievements)(userId);
};
exports.awardPoints = awardPoints;
const checkAchievements = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            snippets: true,
            executions: true,
            leaderboard: true
        }
    });
    if (!user)
        return;
    const newAchievements = [];
    for (const achievement of ACHIEVEMENTS) {
        if (user.achievements.includes(achievement.id))
            continue;
        let unlocked = false;
        switch (achievement.id) {
            case 'first_snippet':
                unlocked = user.snippets.length >= 1;
                break;
            case 'top_10':
                unlocked = user.leaderboard && user.leaderboard.score >= 100; // Simplified
                break;
            case '100_runs':
                unlocked = user.executions.length >= 100;
                break;
        }
        if (unlocked) {
            newAchievements.push(achievement.id);
            // Update user achievements
            await prisma.user.update({
                where: { id: userId },
                data: {
                    achievements: { push: achievement.id }
                }
            });
            // Update leaderboard achievements count
            await prisma.leaderboard.update({
                where: { userId },
                update: {
                    achievementsUnlocked: { increment: 1 }
                }
            });
            // Track achievement unlock
            (0, analytics_1.trackAchievementUnlocked)(userId, achievement.id);
            // Award achievement points
            await (0, exports.awardPoints)(userId, 'achievement_unlocked');
        }
    }
    return newAchievements;
};
exports.checkAchievements = checkAchievements;
