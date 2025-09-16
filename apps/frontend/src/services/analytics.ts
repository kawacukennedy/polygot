export function trackLoginSuccess(userId: string, device: string, ipAddress: string, latencyMs: number) {
  console.log('Analytics Event: login_success', { userId, device, ipAddress, latencyMs });
  // In a real application, this would send data to an analytics service
}

export function trackLoginFailure(email: string, ipAddress: string, errorCode: string) {
  console.log('Analytics Event: login_failure', { email, ipAddress, errorCode });
  // In a real application, this would send data to an analytics service
}
