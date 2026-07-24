import * as Sentry from '@sentry/nextjs';

// Browser error tracking to self-hosted GlitchTip.
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
