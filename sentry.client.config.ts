import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Desativado se não houver DSN configurado (desenvolvimento ou sem conta Sentry)
  enabled: process.env.NODE_ENV === 'production' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Captura 10% das transações para performance monitoring (ajuste conforme o volume)
  tracesSampleRate: 0.1,

  // Captura 100% das sessões com erro para Session Replay
  replaysOnErrorSampleRate: 1.0,

  // Captura 5% das sessões normais (reduz custo de quota)
  replaysSessionSampleRate: 0.05,

  debug: false,
})
