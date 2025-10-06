"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackAchievementUnlocked = exports.trackSnippetRun = exports.trackLoginSuccess = exports.trackSignupSuccess = exports.trackEvent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const trackEvent = async (eventData) => {
    // For now, we'll log to console. In production, this could send to analytics service
    console.log('Analytics event:', eventData);
    // If we had an analytics table, we could store it there
    // await prisma.analyticsEvent.create({ data: eventData });
};
exports.trackEvent = trackEvent;
const trackSignupSuccess = (userId, ipAddress) => {
    (0, exports.trackEvent)({
        event: 'signup_success',
        userId,
        timestamp: new Date(),
        ipAddress
    });
};
exports.trackSignupSuccess = trackSignupSuccess;
const trackLoginSuccess = (userId, ipAddress) => {
    (0, exports.trackEvent)({
        event: 'login_success',
        userId,
        timestamp: new Date(),
        ipAddress
    });
};
exports.trackLoginSuccess = trackLoginSuccess;
const trackSnippetRun = (userId, snippetId, executionTimeMs, status, ipAddress) => {
    (0, exports.trackEvent)({
        event: 'snippet_run',
        userId,
        snippetId,
        timestamp: new Date(),
        executionTimeMs,
        status,
        ipAddress
    });
};
exports.trackSnippetRun = trackSnippetRun;
const trackAchievementUnlocked = (userId, achievementId) => {
    (0, exports.trackEvent)({
        event: 'achievement_unlocked',
        userId,
        timestamp: new Date()
    });
};
exports.trackAchievementUnlocked = trackAchievementUnlocked;
