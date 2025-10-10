"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAchievements = exports.awardDailyLogin = exports.awardPoints = void 0;
const client_1 = require("@prisma/client");
const analytics_1 = require("./analytics");
const index_1 = require("../index");
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
    const updatedLeaderboard = await prisma.leaderboard.upsert({
        where: { userId },
        create: {
            userId,
            score: points,
            snippetsShared: action === 'snippet_shared' ? 1 : 0,
            achievementsUnlocked: action === 'achievement_unlocked' ? 1 : 0
        },
        update: {
            score: { increment: points },
            ...(action === 'snippet_shared' && { snippetsShared: { increment: 1 } }),
            ...(action === 'achievement_unlocked' && { achievementsUnlocked: { increment: 1 } })
        }
    });
    // Emit real-time leaderboard update
    index_1.io.to('leaderboard').emit('leaderboard-update', {
        userId,
        score: updatedLeaderboard.score,
        snippetsShared: updatedLeaderboard.snippetsShared,
        achievementsUnlocked: updatedLeaderboard.achievementsUnlocked
    });
    // Check for achievements
    await (0, exports.checkAchievements)(userId);
};
exports.awardPoints = awardPoints;
const awardDailyLogin = async (userId) => {
    // Check if user already logged in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = await prisma.user.findUnique({
        where: { id: userId },
        select: { updatedAt: true }
    });
    if (lastLogin && lastLogin.updatedAt >= today) {
        return; // Already awarded today
    }
    await (0, exports.awardPoints)(userId, 'daily_login');
};
exports.awardDailyLogin = awardDailyLogin;
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
