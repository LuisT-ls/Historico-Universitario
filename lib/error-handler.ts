import { FirebaseError } from 'firebase/app'

/**
 * Estrutura padronizada para erros da aplicação
 */
export interface AppError {
  title: string
  message: string
  action?: string
  code?: string
  originalError?: unknown
}

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
 * Mapeia códigos de erro do Firebase Authentication para a estrutura AppError padronizada.
 * 
 * @param code - Código de erro retornado pelo Firebase (Ex: 'auth/user-not-found')
 * @returns Objeto AppError com mensagens em português e sugestões de ação
 */
function getAuthError(code: string): AppError {
  const errorMap: Record<string, AppError> = {
    'auth/user-not-found': {
      title: 'Usuário não encontrado',
      message: 'Não encontramos nenhuma conta com este e-mail.',
      action: 'Verifique se o e-mail está correto ou crie uma nova conta.'
    },
    'auth/wrong-password': {
      title: 'Senha incorreta',
      message: 'A senha digitada não confere com este usuário.',
      action: 'Tente novamente ou use a opção "Esqueci minha senha" para redefinir.'
    },
    'auth/invalid-email': {
      title: 'E-mail inválido',
      message: 'O formato do e-mail digitado não é válido.',
      action: 'Certifique-se de digitar um e-mail no formato exemplo@email.com.'
    },
    'auth/user-disabled': {
      title: 'Conta desabilitada',
      message: 'Esta conta foi suspensa por nossos administradores.',
      action: 'Entre em contato com o suporte para entender o motivo.'
    },
    'auth/email-already-in-use': {
      title: 'E-mail já cadastrado',
      message: 'Já existe uma conta associada a este endereço de e-mail.',
      action: 'Tente fazer login ou use um e-mail diferente para se cadastrar.'
    },
    'auth/weak-password': {
      title: 'Senha fraca',
      message: 'A senha escolhida não atende aos requisitos mínimos de segurança.',
      action: 'Crie uma senha mais forte com pelo menos 6 caracteres, incluindo letras e números.'
    },
    'auth/too-many-requests': {
      title: 'Muitas tentativas',
      message: 'O acesso a esta conta foi temporariamente bloqueado devido a várias tentativas falhas.',
      action: 'Aguarde alguns minutos e tente novamente mais tarde.'
    },
    'auth/network-request-failed': {
      title: 'Erro de conexão',
      message: 'Não foi possível estabelecer contato com nossos servidores.',
      action: 'Verifique sua conexão com a internet e tente novamente.'
    },
    'auth/invalid-credential': {
      title: 'Credenciais inválidas',
      message: 'Seu e-mail ou senha estão incorretos.',
      action: 'Verifique os dados digitados e tente novamente.'
    },
    'auth/popup-closed-by-user': {
      title: 'Login cancelado',
      message: 'Você fechou a janela de autenticação antes de concluir o processo.',
      action: 'Clique no botão de login novamente para reiniciar o processo.'
    },
    'auth/popup-blocked': {
      title: 'Janela bloqueada',
      message: 'Seu navegador impediu a abertura da janela de autenticação.',
      action: 'Permita que este site abra janelas pop-up e tente novamente.'
    },
  }

  return errorMap[code] || {
    title: 'Erro de Autenticação',
    message: 'Não foi possível concluir o acesso à sua conta.',
    action: 'Tente novamente em instantes ou entre em contato com o suporte.'
  }
}

/**
 * Mapeia códigos de erro do Firestore para a estrutura AppError padronizada.
 * 
 * @param code - Código de erro retornado pelo Firestore (Ex: 'permission-denied')
 * @returns Objeto AppError com mensagens em português e sugestões de ação
 */
function getFirestoreError(code: string): AppError {
  const errorMap: Record<string, AppError> = {
    'permission-denied': {
      title: 'Acesso negado',
      message: 'Você não tem permissão para realizar esta operação.',
      action: 'Verifique se você está logado corretamente.'
    },
    'unavailable': {
      title: 'Serviço indisponível',
      message: 'Estamos com instabilidade temporária em nosso banco de dados.',
      action: 'Aguarde alguns segundos e tente a operação novamente.'
    },
    'not-found': {
      title: 'Não encontrado',
      message: 'O registro que você está tentando acessar não existe.',
      action: 'Verifique se os dados estão corretos ou recarregue a página.'
    },
    'resource-exhausted': {
      title: 'Limite atingido',
      message: 'Atingimos o limite de processamento para sua conta no momento.',
      action: 'Tente novamente em alguns minutos.'
    },
    'invalid-argument': {
      title: 'Dados inválidos',
      message: 'As informações enviadas contêm erros de formato ou campos obrigatórios faltando.',
      action: 'Revise o formulário e tente enviar novamente.'
    },
  }

  return errorMap[code] || {
    title: 'Erro de Dados',
    message: 'Ocorreu um problema ao processar suas informações.',
    action: 'Tente novamente. Se o erro persistir, recarregue a página.'
  }
}

/**
 * Mapeia códigos de erro do Firebase Storage para a estrutura AppError padronizada.
 * 
 * @param code - Código de erro retornado pelo Storage (Ex: 'storage/unauthorized')
 * @returns Objeto AppError com mensagens em português e sugestões de ação
 */
function getStorageError(code: string): AppError {
  const errorMap: Record<string, AppError> = {
    'storage/unauthorized': {
      title: 'Upload negado',
      message: 'Sua conta não tem permissão para hospedar este arquivo.',
      action: 'Tente fazer login novamente.'
    },
    'storage/quota-exceeded': {
      title: 'Espaço esgotado',
      message: 'Seu limite de armazenamento no servidor foi atingido.',
      action: 'Remova arquivos antigos antes de tentar novos uploads.'
    },
    'storage/invalid-format': {
      title: 'Formato inválido',
      message: 'O arquivo selecionado não é suportado pelo sistema.',
      action: 'Tente enviar o arquivo em outro formato (PDF, JPG, PNG).'
    },
  }

  return errorMap[code] || {
    title: 'Erro de Arquivo',
    message: 'Houve um problema ao processar seu arquivo.',
    action: 'Verifique o tamanho e o formato do arquivo e tente novamente.'
  }
}

/**
 * Obtém mensagem de erro amigável (string) baseada no código do Firebase
 * Mantido para compatibilidade legado
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const handled = handleError(error)
  return handled.message
}

/**
 * Função principal de tratamento de erros da aplicação.
 * Identifica a origem do erro (Firebase, Error genérico ou desconhecido)
 * e o converte para o formato standard AppError.
 * 
 * @param error - O objeto de erro capturado no try/catch
 * @returns O erro processado e pronto para exibição na UI
 * 
 * @example
 * try { ... } catch (err) { setError(handleError(err)) }
 */
export function handleError(error: unknown): AppError {
  let appError: AppError

  if (isFirebaseError(error)) {
    const code = error.code

    if (code.startsWith('auth/')) {
      appError = getAuthError(code)
    } else if (code.startsWith('storage/')) {
      appError = getStorageError(code)
    } else {
      appError = getFirestoreError(code)
    }

    appError.code = code
  } else if (error instanceof Error) {
    appError = {
      title: 'Erro inesperado',
      message: error.message || 'Ocorreu um erro interno no sistema.',
      action: 'Tente recarregar a página e repetir a operação.'
    }
  } else {
    appError = {
      title: 'Erro desconhecido',
      message: 'Não foi possível identificar a causa do problema.',
      action: 'Tente novamente mais tarde.'
    }
  }

  // Anexar erro original apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    appError.originalError = error
  }

  return appError
}
