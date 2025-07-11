import { auth, db, googleProvider } from './config.js'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'

class AuthService {
  constructor() {
    this.currentUser = null
    this.authStateListeners = []
  }

  // Login com email e senha
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      this.currentUser = userCredential.user
      await this.loadUserData()
      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // Login com Google
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      this.currentUser = result.user

      // Verificar se é a primeira vez do usuário
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid))
      if (!userDoc.exists()) {
        // Criar perfil inicial para usuário do Google
        await this.createInitialUserProfile()
      } else {
        await this.loadUserData()
      }

      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error('Erro no login com Google:', error)

      // Tratamento específico para erro de domínio não autorizado
      if (error.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error: 'Domínio não autorizado. Entre em contato com o suporte.'
        }
      }

      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // Registro de novo usuário
  async registerUser(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      this.currentUser = userCredential.user

      // Criar perfil do usuário
      await this.createInitialUserProfile(name)

      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // Criar perfil inicial do usuário
  async createInitialUserProfile(name = null) {
    try {
      // Detectar instituição baseado no e-mail
      let institution = ''
      if (this.currentUser.email) {
        if (this.currentUser.email.includes('@ufba.br')) {
          institution = 'Universidade Federal da Bahia'
        } else if (this.currentUser.email.includes('@unifacs.br')) {
          institution = 'Universidade Salvador'
        } else if (this.currentUser.email.includes('@uneb.br')) {
          institution = 'Universidade do Estado da Bahia'
        } else if (this.currentUser.email.includes('@ucsal.br')) {
          institution = 'Universidade Católica do Salvador'
        }
      }

      const userData = {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        name: name || this.currentUser.displayName || 'Usuário',
        createdAt: new Date(),
        lastLogin: new Date(),
        profile: {
          course: '',
          institution: institution,
          enrollment: '',
          startYear: new Date().getFullYear(),
          startSemester: '1', // 1 ou 2
          totalCredits: 0,
          totalHours: 0
        },
        settings: {
          theme: 'light',
          notifications: true,
          privacy: 'private'
        }
      }

      await setDoc(doc(db, 'users', this.currentUser.uid), userData)
      this.userData = userData
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      throw error
    }
  }

  // Carregar dados do usuário
  async loadUserData() {
    try {
      if (!this.currentUser) {
        console.error('Usuário não autenticado')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid))
      if (userDoc.exists()) {
        this.userData = userDoc.data()
        // Atualizar último login
        await updateDoc(doc(db, 'users', this.currentUser.uid), {
          lastLogin: new Date()
        })
      } else {
        console.log(
          'Documento do usuário não encontrado, criando perfil inicial...'
        )
        // Se o documento não existe, criar um perfil básico
        await this.createInitialUserProfile()
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      if (error.code === 'permission-denied') {
        console.error(
          'Erro de permissão: Verifique se as regras do Firestore estão configuradas corretamente'
        )
      }
      throw error
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth)
      this.currentUser = null
      this.userData = null
      this.notifyAuthStateChange()
      return { success: true }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { success: false, error: error.message }
    }
  }

  // Recuperação de senha
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(profileData) {
    try {
      // Garantir que userData existe
      if (!this.userData) {
        await this.loadUserData()
      }

      // Preparar dados para atualização
      const updateData = {
        updatedAt: new Date()
      }

      // Se profileData contém settings, atualizar settings
      if (profileData.settings) {
        updateData.settings = {
          ...this.userData?.settings,
          ...profileData.settings
        }
      }

      // Se profileData contém profile, atualizar profile
      if (profileData.profile) {
        updateData.profile = {
          ...this.userData?.profile,
          ...profileData.profile
        }
      }

      // Se profileData contém name, atualizar name
      if (profileData.name) {
        updateData.name = profileData.name
      }

      await updateDoc(doc(db, 'users', this.currentUser.uid), updateData)

      // Recarregar dados
      await this.loadUserData()
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      if (error.code === 'permission-denied') {
        return {
          success: false,
          error:
            'Erro de permissão. Verifique se as regras do Firestore estão configuradas corretamente.'
        }
      }
      return { success: false, error: error.message }
    }
  }

  // Verificar estado da autenticação
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback)
  }

  // Notificar mudanças no estado de autenticação
  notifyAuthStateChange() {
    this.authStateListeners.forEach(callback => {
      callback(this.currentUser, this.userData)
    })
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser
  }

  // Obter dados do usuário
  getUserData() {
    return this.userData
  }

  // Verificar se está logado
  isLoggedIn() {
    return !!this.currentUser
  }

  // Traduzir mensagens de erro
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado. Verifique seu email.',
      'auth/wrong-password': 'Senha incorreta. Tente novamente.',
      'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/email-already-in-use':
        'Este email já está cadastrado. Tente fazer login.',
      'auth/invalid-credential':
        'Credenciais inválidas. Verifique email e senha.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
      'auth/unauthorized-domain':
        'Domínio não autorizado. Entre em contato com o suporte.',
      'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
      'auth/cancelled-popup-request': 'Login cancelado. Tente novamente.',
      'auth/account-exists-with-different-credential':
        'Email já associado a outra conta.',
      'auth/operation-not-allowed': 'Método de login não habilitado.',
      'auth/user-disabled':
        'Conta desabilitada. Entre em contato com o suporte.'
    }

    return errorMessages[errorCode] || `Erro: ${errorCode}`
  }
}

// Instância global do serviço de autenticação
const authService = new AuthService()

// Configurar listener de mudança de estado
auth.onAuthStateChanged(async user => {
  if (user) {
    authService.currentUser = user
    await authService.loadUserData()
  } else {
    authService.currentUser = null
    authService.userData = null
  }
  authService.notifyAuthStateChange()
})

export default authService
