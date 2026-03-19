import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilitário para combinar classes do Tailwind CSS com suporte a condições
 * e resolução de conflitos (merging).
 *
 * @param inputs - Classes, arrays ou objetos de classes a serem combinados
 * @returns String de classes otimizada
 *
 * @example
 * cn('px-2 py-1', isSelected && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
