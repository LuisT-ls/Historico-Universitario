/**
 * Sistema de Logging centralizado para a aplicação.
 * Controla a visibilidade dos logs baseada no ambiente (desenvolvimento/produção).
 * Em produção, erros e avisos são enviados automaticamente ao Sentry
 * quando a variável NEXT_PUBLIC_SENTRY_DSN estiver configurada.
 */

import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Interface para os metadados opcionais de log
 */
type LogContext = Record<string, unknown>;

/**
 * Logger utilitário que substitui o console direto.
 * Em produção, logs de 'info' e 'debug' são suprimidos para melhorar a performance e segurança.
 * Logs de 'warn' e 'error' são mantidos e enviados ao Sentry para monitoramento.
 */
export const logger = {
    /**
     * Log de informação geral. Suprimido em produção.
     */
    info: (message: string, context?: LogContext) => {
        if (!isProduction) {
            console.log(`%c[INFO] %c${message}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', context || '');
        }
    },

    /**
     * Log de depuração detalhada. Suprimido em produção.
     */
    debug: (message: string, context?: LogContext) => {
        if (!isProduction) {
            console.debug(`%c[DEBUG] %c${message}`, 'color: #6b7280; font-weight: bold;', 'color: inherit;', context || '');
        }
    },

    /**
     * Log de aviso. Exibido em todos os ambientes e enviado ao Sentry em produção.
     */
    warn: (message: string, context?: LogContext) => {
        console.warn(`[WARN] ${message}`, context || '');
        if (isProduction) {
            Sentry.captureMessage(message, { level: 'warning', extra: context })
        }
    },

    /**
     * Log de erro crítico. Exibido em todos os ambientes e enviado ao Sentry em produção.
     * Aceita um objeto Error (para stack trace completo) ou qualquer valor serializado.
     */
    error: (message: string, error?: unknown, context?: LogContext) => {
        console.error(`[ERROR] ${message}`, error || '', context || '');
        if (isProduction) {
            if (error instanceof Error) {
                Sentry.captureException(error, { extra: { message, ...context } })
            } else {
                Sentry.captureMessage(message, { level: 'error', extra: { error, ...context } })
            }
        }
    }
};
