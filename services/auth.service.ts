import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    confirmPasswordReset as firebaseConfirmPasswordReset,
    verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
    updatePassword as firebaseUpdatePassword,
    updateProfile as firebaseUpdateProfile,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    EmailAuthProvider,
    deleteUser,
    type User,
    type ActionCodeSettings,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/config'
import { deleteUserData } from '@/services/firestore.service'
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
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) {
            await firebaseUpdateProfile(userCredential.user, { displayName })
        }
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
export async function resetPassword(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        await sendPasswordResetEmail(auth, email, actionCodeSettings)
        logger.info('Email de redefinição de senha enviado')
    } catch (error) {
        logger.error('Erro ao enviar email de redefinição:', error)
        throw error
    }
}

/**
 * Verifica o código de redefinição de senha e retorna o email associado
 */
export async function verifyPasswordResetCode(oobCode: string): Promise<string> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        const email = await firebaseVerifyPasswordResetCode(auth, oobCode)
        return email
    } catch (error) {
        logger.error('Erro ao verificar código de redefinição:', error)
        throw error
    }
}

/**
 * Confirma a redefinição de senha com o novo valor
 */
export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    if (!auth) throw new Error('Auth não inicializado')

    try {
        await firebaseConfirmPasswordReset(auth, oobCode, newPassword)
        logger.info('Senha redefinida com sucesso')
    } catch (error) {
        logger.error('Erro ao confirmar redefinição de senha:', error)
        throw error
    }
}

/**
 * Re-autentica o usuário com email e senha (necessário antes de operações sensíveis)
 */
export async function reauthenticateWithEmail(password: string): Promise<void> {
    if (!auth?.currentUser?.email) throw new Error('Usuário não autenticado')

    try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
        await reauthenticateWithCredential(auth.currentUser, credential)
        logger.info('Re-autenticação com email realizada')
    } catch (error) {
        logger.error('Erro ao re-autenticar com email:', error)
        throw error
    }
}

/**
 * Re-autentica o usuário com Google (necessário antes de operações sensíveis)
 */
export async function reauthenticateWithGoogle(): Promise<void> {
    if (!auth?.currentUser || !googleProvider) throw new Error('Auth ou Google Provider não inicializados')

    try {
        await reauthenticateWithPopup(auth.currentUser, googleProvider)
        logger.info('Re-autenticação com Google realizada')
    } catch (error) {
        logger.error('Erro ao re-autenticar com Google:', error)
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
        await deleteUserData(auth.currentUser.uid)
        await deleteUser(auth.currentUser)
        logger.info('Conta deletada com sucesso')
    } catch (error) {
        logger.error('Erro ao deletar conta:', error)
        throw error
    }
}
