export function trackEvent(eventName: string, fields: Record<string, any>) {
  const event = {
    name: eventName,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  console.log('Analytics Event:', event);
  // In a real application, this would send data to an analytics service
  // Pseudonymize user_id, respect GDPR opt-out
}

export function trackLoginSuccess(userId: string, device: string, ipAddress: string, latencyMs: number) {
  trackEvent('login_success', { user_id: userId, device, ip: ipAddress, latency_ms: latencyMs });
}

export function trackLoginFailure(email: string, ipAddress: string, errorCode: string) {
  trackEvent('login_failure', { email, ip: ipAddress, error_code: errorCode });
}

export function trackSignupSuccess(userId: string, timestamp: string) {
  trackEvent('signup_success', { user_id: userId, timestamp });
}

export function trackSnippetSaved(snippetId: string, userId: string) {
  trackEvent('snippet_saved', { snippet_id: snippetId, user_id: userId });
}

export function trackSnippetRun(snippetId: string, userId: string) {
  trackEvent('snippet_run', { snippet_id: snippetId, user_id: userId });
}

export function trackAchievementUnlocked(achievementId: string, userId: string) {
  trackEvent('achievement_unlocked', { achievement_id: achievementId, user_id: userId });
}

export function trackPageView(page: string, userId?: string) {
  trackEvent('page_view', { page, user_id: userId });
}
