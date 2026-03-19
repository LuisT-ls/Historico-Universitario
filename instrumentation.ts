/**
 * Next.js Instrumentation Hook
 * Inicializa o Sentry no servidor (Node.js runtime).
 * Este arquivo é carregado automaticamente pelo Next.js ao iniciar o servidor.
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
}

/**
 * Captura erros de requisição HTTP não tratados (ex: rotas 500) no servidor.
 * Disponível a partir do Next.js 15.3+.
 *
 * Para habilitar, instale @sentry/nextjs >= v8 e substitua por:
 *   export { onRequestError } from '@sentry/nextjs'
 * quando os tipos do Next.js e do Sentry estiverem alinhados na sua versão.
 */
