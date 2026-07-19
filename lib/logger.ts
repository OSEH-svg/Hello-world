/*
 * lib/logger.ts – Minimal error logging wrapper.
 * This file provides a simple `logError` function that can be extended
 * to integrate with a third‑party service such as Sentry.
 * The implementation deliberately avoids adding new dependencies to
 * satisfy the contribution constraints.
 */

/**
 * Log an error with optional context.
 *
 * @param error - The caught error object.
 * @param context - Optional additional information (e.g. userId, wallet address).
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  // Basic console reporting – keeps the implementation lightweight.
  // In production environments this can be swapped out for Sentry or
  // another service without changing the call sites.
  if (context) {
    console.error('Captured error:', error, 'Context:', context);
  } else {
    console.error('Captured error:', error);
  }
}

/**
 * Placeholder for future logger initialization (e.g., Sentry init).
 * Keeping the function here makes it easy to hook in a real service
 * without touching the component code.
 */
export function initLogger() {
  // No‑op for now.
}
