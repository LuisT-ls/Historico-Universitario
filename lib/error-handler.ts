/**
 * Utilitários para tratamento seguro de erros do Firebase
 * Previne exposição de informações sensíveis ao usuário
 */

import { FirebaseError } from 'firebase/app'

/**
 * Verifica se um erro é uma instância de FirebaseError
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as FirebaseError).code === 'string'
  )
}

/**
 * Mapeia códigos de erro do Firebase Authentication para mensagens amigáveis
 */
function getAuthErrorMessage(code: string): string {
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'Usuário não encontrado. Verifique seu e-mail.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
    'auth/user-disabled': 'Esta conta foi desabilitada. Entre em contato com o suporte.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/invalid-credential': 'Credenciais inválidas. Verifique seu e-mail e senha.',
    'auth/requires-recent-login': 'Por segurança, faça login novamente.',
    'auth/popup-closed-by-user': 'Login cancelado.',
    'auth/cancelled-popup-request': 'Login cancelado.',
    'auth/popup-blocked': 'Popup bloqueado. Permita popups para este site.',
  }

  return errorMap[code] || 'Erro ao realizar autenticação. Tente novamente.'
}

/**
 * Mapeia códigos de erro do Firestore para mensagens amigáveis
 */
function getFirestoreErrorMessage(code: string): string {
  const errorMap: Record<string, string> = {
    'permission-denied': 'Permissão negada. Verifique se você tem acesso a este recurso.',
    'unavailable': 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
    'not-found': 'Recurso não encontrado.',
    'already-exists': 'Este recurso já existe.',
    'failed-precondition': 'Operação não pode ser realizada no momento.',
    'aborted': 'Operação foi cancelada.',
    'out-of-range': 'Valor fora do intervalo permitido.',
    'unimplemented': 'Funcionalidade não implementada.',
    'internal': 'Erro interno do servidor. Tente novamente mais tarde.',
    'deadline-exceeded': 'Tempo limite excedido. Tente novamente.',
    'cancelled': 'Operação foi cancelada.',
    'data-loss': 'Erro ao processar dados.',
    'unauthenticated': 'Você precisa estar autenticado para realizar esta ação.',
    'resource-exhausted': 'Limite de recursos excedido. Tente novamente mais tarde.',
    'invalid-argument': 'Dados inválidos. Verifique os campos preenchidos.',
  }

  return errorMap[code] || 'Erro ao processar dados. Tente novamente.'
}

/**
 * Mapeia códigos de erro do Firebase Storage para mensagens amigáveis
 */
function getStorageErrorMessage(code: string): string {
  const errorMap: Record<string, string> = {
    'storage/unauthorized': 'Você não tem permissão para realizar esta ação.',
    'storage/canceled': 'Upload cancelado.',
    'storage/unknown': 'Erro desconhecido ao fazer upload.',
    'storage/invalid-format': 'Formato de arquivo inválido.',
    'storage/invalid-checksum': 'Arquivo corrompido. Verifique o arquivo e tente novamente.',
    'storage/invalid-event-name': 'Erro interno. Tente novamente.',
    'storage/invalid-url': 'URL inválida.',
    'storage/invalid-argument': 'Dados inválidos. Verifique o arquivo.',
    'storage/no-default-bucket': 'Configuração de armazenamento inválida.',
    'storage/cannot-slice-blob': 'Erro ao processar arquivo. Tente novamente.',
    'storage/server-file-wrong-size': 'Tamanho do arquivo incorreto. Tente novamente.',
    'storage/quota-exceeded': 'Limite de armazenamento excedido.',
    'storage/unauthenticated': 'Você precisa estar autenticado para fazer upload.',
    'storage/retry-limit-exceeded': 'Muitas tentativas. Aguarde e tente novamente.',
    'storage/download-file-not-found': 'Arquivo não encontrado.',
  }

  return errorMap[code] || 'Erro ao processar arquivo. Tente novamente.'
}

/**
 * Obtém mensagem de erro amigável baseada no tipo de erro do Firebase
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (!isFirebaseError(error)) {
    // Se não for erro do Firebase, retornar mensagem genérica
    if (error instanceof Error) {
      // Logar erro completo no console para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro não tratado:', error)
      }
      return 'Ocorreu um erro inesperado. Tente novamente.'
    }
    return 'Ocorreu um erro. Tente novamente.'
  }

  const code = error.code

  // Determinar tipo de erro baseado no código
  if (code.startsWith('auth/')) {
    return getAuthErrorMessage(code)
  }

  if (code.startsWith('storage/')) {
    return getStorageErrorMessage(code)
  }

  // Firestore e outros erros
  return getFirestoreErrorMessage(code)
}

/**
 * Tipo para erros tratados
 */
export interface HandledError {
  message: string
  code?: string
  originalError?: unknown
}

/**
 * Trata um erro e retorna uma estrutura padronizada
 */
export function handleError(error: unknown): HandledError {
  const message = getFirebaseErrorMessage(error)

  if (isFirebaseError(error)) {
    return {
      message,
      code: error.code,
      originalError: process.env.NODE_ENV === 'development' ? error : undefined,
    }
  }

  return {
    message,
    originalError: process.env.NODE_ENV === 'development' ? error : undefined,
  }
}
