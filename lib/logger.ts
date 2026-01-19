/**
 * Sistema de Logging centralizado para a aplicação.
 * Controla a visibilidade dos logs baseada no ambiente (desenvolvimento/produção).
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Interface para os metadados opcionais de log
 */
type LogContext = Record<string, any>;

/**
 * Logger utilitário que substitui o console direto.
 * Em produção, logs de 'info' e 'debug' são suprimidos para melhorar a performance e segurança.
 * Logs de 'warn' e 'error' são mantidos para facilitar o diagnóstico de problemas críticos.
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
     * Log de aviso. Exibido em todos os ambientes.
     */
    warn: (message: string, context?: LogContext) => {
        console.warn(`[WARN] ${message}`, context || '');
        // DICA: Em produção, você poderia enviar este log para um serviço como Sentry/LogKit
    },

    /**
     * Log de erro crítico. Exibido em todos os ambientes.
     */
    error: (message: string, error?: any, context?: LogContext) => {
        console.error(`[ERROR] ${message}`, error || '', context || '');
        // DICA: Em produção, erros críticos DEVEM ser enviados para uma ferramenta de monitoramento
    }
};
