import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV === 'production' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Menor sample rate no servidor para não impactar latência
  tracesSampleRate: 0.1,

  debug: false,
})
