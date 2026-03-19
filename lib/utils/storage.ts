import { logger } from '@/lib/logger'

/**
 * Limpa todos os dados do usuário do localStorage e sessionStorage
 * Mantém apenas preferências globais como tema (dark mode)
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return

  try {
    // Lista de chaves que devem ser preservadas (preferências globais)
    const preservedKeys = ['historico-ufba-dark-mode']

    // Limpar todas as chaves do localStorage exceto as preservadas
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !preservedKeys.includes(key)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Limpar todo o sessionStorage
    sessionStorage.clear()

    logger.info('Dados do usuário limpos com sucesso')
  } catch (error) {
    logger.error('Erro ao limpar dados do usuário:', error)
  }
}
