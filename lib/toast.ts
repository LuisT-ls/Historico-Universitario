import { toast as sonnerToast } from 'sonner'

/**
 * Wrapper para toast que respeita as configurações de notificação do usuário
 */
export const toast = {
    success: (message: string, options?: any) => {
        if (shouldShowNotification()) {
            sonnerToast.success(message, options)
        }
    },
    error: (message: string, options?: any) => {
        if (shouldShowNotification()) {
            sonnerToast.error(message, options)
        }
    },
    warning: (message: string, options?: any) => {
        if (shouldShowNotification()) {
            sonnerToast.warning(message, options)
        }
    },
    info: (message: string, options?: any) => {
        if (shouldShowNotification()) {
            sonnerToast.info(message, options)
        }
    },
}

/**
 * Verifica se as notificações estão habilitadas
 */
function shouldShowNotification(): boolean {
    if (typeof window === 'undefined') return false

    try {
        const notifSettings = localStorage.getItem('notificationsEnabled')
        if (notifSettings === null) return true // Por padrão, notificações habilitadas
        return notifSettings === 'true'
    } catch {
        return true
    }
}

/**
 * Atualiza a configuração de notificações no localStorage
 */
export function setNotificationsEnabled(enabled: boolean) {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem('notificationsEnabled', enabled.toString())
    } catch (error) {
        console.error('Erro ao salvar configuração de notificações:', error)
    }
}
