import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword,
    deleteUser,
    type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/config'
import { logger } from '@/lib/logger'

/**
 * Serviço de Autenticação para operações de login, registro e gerenciamento de usuários
 */

/**
 * Faz login com email e senha
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        logger.info('Login com email realizado com sucesso')
        return userCredential.user
    } catch (error) {
        logger.error('Erro ao fazer login com email:', error)
        throw error
    }
}

/**
 * Faz login com Google
 */
export async function signInWithGoogle(): Promise<User> {
    if (!auth || !googleProvider) throw new Error('Auth ou Google Provider não inicializados')

    try {
        const userCredential = await signInWithPopup(auth, googleProvider)
        logger.info('Login com Google realizado com sucesso')
        return userCredential.user
    } catch (error) {
        logger.error('Erro ao fazer login com Google:', error)
        throw error
    }
}

/**
 * Registra um novo usuário com email e senha
 */
export async function signUp(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        logger.info('Registro realizado com sucesso')
        return userCredential.user
    } catch (error) {
        logger.error('Erro ao registrar usuário:', error)
        throw error
    }
}

/**
 * Faz logout do usuário
 */
export async function signOut(): Promise<void> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        await firebaseSignOut(auth)
        logger.info('Logout realizado com sucesso')
    } catch (error) {
        logger.error('Erro ao fazer logout:', error)
        throw error
    }
}

/**
 * Envia email para redefinição de senha
 */
export async function resetPassword(email: string): Promise<void> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        await sendPasswordResetEmail(auth, email)
        logger.info('Email de redefinição de senha enviado')
    } catch (error) {
        logger.error('Erro ao enviar email de redefinição:', error)
        throw error
    }
}

/**
 * Atualiza a senha do usuário atual
 */
export async function updatePassword(newPassword: string): Promise<void> {
    if (!auth?.currentUser) throw new Error('Usuário não autenticado')

    try {
        await firebaseUpdatePassword(auth.currentUser, newPassword)
        logger.info('Senha atualizada com sucesso')
    } catch (error) {
        logger.error('Erro ao atualizar senha:', error)
        throw error
    }
}

/**
 * Deleta a conta do usuário atual
 */
export async function deleteAccount(): Promise<void> {
    if (!auth?.currentUser) throw new Error('Usuário não autenticado')

    try {
        await deleteUser(auth.currentUser)
        logger.info('Conta deletada com sucesso')
    } catch (error) {
        logger.error('Erro ao deletar conta:', error)
        throw error
    }
}
