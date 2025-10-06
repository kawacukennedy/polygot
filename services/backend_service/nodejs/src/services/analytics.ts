import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnalyticsEvent {
  event: string;
  userId?: string;
  snippetId?: string;
  timestamp: Date;
  executionTimeMs?: number;
  status?: string;
  ipAddress?: string;
}

export const trackEvent = async (eventData: AnalyticsEvent) => {
  // For now, we'll log to console. In production, this could send to analytics service
  console.log('Analytics event:', eventData);

  // If we had an analytics table, we could store it there
  // await prisma.analyticsEvent.create({ data: eventData });
};

export const trackSignupSuccess = (userId: string, ipAddress?: string) => {
  trackEvent({
    event: 'signup_success',
    userId,
    timestamp: new Date(),
    ipAddress
  });
};

export const trackLoginSuccess = (userId: string, ipAddress?: string) => {
  trackEvent({
    event: 'login_success',
    userId,
    timestamp: new Date(),
    ipAddress
  });
};

export const trackSnippetRun = (
  userId: string,
  snippetId: string,
  executionTimeMs: number,
  status: string,
  ipAddress?: string
) => {
  trackEvent({
    event: 'snippet_run',
    userId,
    snippetId,
    timestamp: new Date(),
    executionTimeMs,
    status,
    ipAddress
  });
};

export const trackAchievementUnlocked = (userId: string, achievementId: string) => {
  trackEvent({
    event: 'achievement_unlocked',
    userId,
    timestamp: new Date()
  });
};