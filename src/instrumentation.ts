import * as Sentry from '@sentry/nextjs';

// Server + edge error tracking to self-hosted GlitchTip.
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
export async function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
