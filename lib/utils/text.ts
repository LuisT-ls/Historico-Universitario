/**
 * Formata uma data no padrão brasileiro (DD/MM/AAAA HH:mm)
 *
 * @param date - Objeto Date ou string de data para formatar
 * @returns String formatada: "19/01/2026 14:30"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Sanitiza input de texto removendo caracteres perigosos e espaços extras
 * @param input - Texto a ser sanitizado
 * @returns Texto sanitizado
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
}

/**
 * Normaliza texto para comparação (uppercase, trim, sem acentos)
 */
export function normalizeText(input: string): string {
  if (!input) return ''
  return input
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '') // Remove todos os espaços para comparação de código
}

/**
 * Valida se uma URL é segura para abrir externamente.
 * Aceita apenas http:// e https:// — bloqueia javascript:, data:, vbscript:, etc.
 */
export function isSafeExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Sanitiza texto longo (descrições, etc.) mantendo quebras de linha
 * @param input - Texto longo a ser sanitizado
 * @returns Texto sanitizado
 */
export function sanitizeLongText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\r\n/g, '\n') // Normaliza quebras de linha
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Limita múltiplas quebras de linha
}
