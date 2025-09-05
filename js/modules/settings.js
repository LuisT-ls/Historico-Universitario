import authService from './firebase/auth.js'

class SettingsManager {
  constructor() {
    this.currentUser = null
    this.userData = null
    this.init()
  }

  async init() {
    // Configurar listeners de privacidade
    this.setupPrivacyListeners()

    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.currentUser = user
        this.userData = userData
        this.applySettings()
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      this.currentUser = currentUser
      this.userData = authService.getUserData()
      if (this.userData) {
        this.applySettings()
      }
    }
  }

  applySettings() {
    if (!this.userData?.settings) return

    const settings = this.userData.settings

    // Aplicar notificações
    this.applyNotifications(settings.notifications !== false)

    // Aplicar privacidade
    this.applyPrivacy(settings.privacy || 'private')
  }

  applyNotifications(enabled) {
    if (enabled && 'Notification' in window) {
      // Solicitar permissão para notificações
      if (Notification.permission === 'default') {
        Notification.requestPermission()
          .then(permission => {
          if (permission === 'granted') {
            window.showNotification('Notificações ativadas!', 'success')
              console.log('Permissão de notificação concedida')
            } else {
              window.showNotification(
                'Permissão de notificação negada',
                'warning'
              )
              console.log('Permissão de notificação negada')
            }
          })
          .catch(error => {
            console.error('Erro ao solicitar permissão de notificação:', error)
            window.showNotification('Erro ao configurar notificações', 'error')
          })
      } else if (Notification.permission === 'granted') {
        window.showNotification('Notificações já estão ativadas!', 'success')
      } else {
        window.showNotification(
          'Notificações foram desabilitadas pelo navegador',
          'warning'
        )
      }
    } else if (!enabled) {
      console.log('Notificações desabilitadas pelo usuário')
    } else {
      console.log('Notificações não suportadas neste navegador')
    }
  }

  applyPrivacy(privacy) {
    // Validar configuração de privacidade
    const validPrivacySettings = ['private', 'public']
    if (!validPrivacySettings.includes(privacy)) {
      console.warn(
        `Configuração de privacidade inválida: ${privacy}. Usando 'private' como padrão.`
      )
      privacy = 'private'
    }

    // Salvar configuração no localStorage
    localStorage.setItem('privacy', privacy)

    // Aplicar lógica de privacidade baseada na configuração
    this.applyPrivacySettings(privacy)

    // Notificar mudança de privacidade
    this.notifyPrivacyChange(privacy)
  }

  applyPrivacySettings(privacy) {
    // Definir configurações de privacidade globais
    window.privacySettings = {
      level: privacy,
      isPrivate: privacy === 'private',
      isPublic: privacy === 'public',
      allowDataSharing: privacy === 'public',
      allowProfileView: privacy === 'public',
      allowStatisticsView: privacy === 'public'
    }

    // Aplicar restrições de interface baseadas na privacidade
    this.applyPrivacyUI(privacy)

    // Configurar controle de acesso aos dados
    this.setupDataAccessControl(privacy)
  }

  applyPrivacyUI(privacy) {
    // Elementos que devem ser ocultados/mostrados baseado na privacidade
    const privacyElements = document.querySelectorAll('[data-privacy]')

    privacyElements.forEach(element => {
      const requiredPrivacy = element.getAttribute('data-privacy')
      const shouldShow = this.shouldShowElement(privacy, requiredPrivacy)

      if (shouldShow) {
        element.style.display = ''
        element.classList.remove('privacy-hidden')
      } else {
        element.style.display = 'none'
        element.classList.add('privacy-hidden')
      }
    })

    // Atualizar indicadores visuais de privacidade
    this.updatePrivacyIndicators(privacy)
  }

  shouldShowElement(currentPrivacy, requiredPrivacy) {
    // Lógica para determinar se um elemento deve ser mostrado
    if (requiredPrivacy === 'public') {
      return currentPrivacy === 'public'
    } else if (requiredPrivacy === 'private') {
      return currentPrivacy === 'private' || currentPrivacy === 'public'
    }
    return true // Elementos sem especificação de privacidade sempre visíveis
  }

  updatePrivacyIndicators(privacy) {
    // Atualizar indicadores visuais de privacidade na interface
    const privacyIndicators = document.querySelectorAll('.privacy-indicator')

    privacyIndicators.forEach(indicator => {
      if (privacy === 'private') {
        indicator.innerHTML = '<i class="fas fa-lock"></i> Privado'
        indicator.className = 'privacy-indicator private'
      } else if (privacy === 'public') {
        indicator.innerHTML = '<i class="fas fa-globe"></i> Público'
        indicator.className = 'privacy-indicator public'
      }
    })
  }

  setupDataAccessControl(privacy) {
    // Configurar controle de acesso aos dados baseado na privacidade
    if (privacy === 'private') {
      // Modo privado: restringir acesso externo aos dados
      this.restrictDataAccess()
    } else if (privacy === 'public') {
      // Modo público: permitir acesso controlado aos dados
      this.allowDataAccess()
    }
  }

  restrictDataAccess() {
    // Implementar restrições para modo privado
    // - Desabilitar APIs de compartilhamento
    // - Ocultar links de compartilhamento
    // - Restringir acesso a dados sensíveis

    // Desabilitar funcionalidades de compartilhamento
    const shareButtons = document.querySelectorAll('[data-share]')
    shareButtons.forEach(button => {
      button.style.display = 'none'
      button.disabled = true
    })

    // Ocultar informações sensíveis
    const sensitiveData = document.querySelectorAll('[data-sensitive]')
    sensitiveData.forEach(element => {
      element.classList.add('data-hidden')
    })

    // Configurar headers de segurança para requisições
    this.setSecurityHeaders()
  }

  allowDataAccess() {
    // Implementar permissões para modo público
    // - Habilitar APIs de compartilhamento
    // - Mostrar links de compartilhamento
    // - Permitir acesso a dados não sensíveis

    // Habilitar funcionalidades de compartilhamento
    const shareButtons = document.querySelectorAll('[data-share]')
    shareButtons.forEach(button => {
      button.style.display = ''
      button.disabled = false
    })

    // Mostrar informações não sensíveis
    const publicData = document.querySelectorAll('[data-public]')
    publicData.forEach(element => {
      element.classList.remove('data-hidden')
    })
  }

  setSecurityHeaders() {
    // Configurar headers de segurança para requisições
    // Isso pode ser implementado se houver um proxy ou API
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }

    // Aplicar headers se estiver em um contexto de API
    if (window.applySecurityHeaders) {
      window.applySecurityHeaders(securityHeaders)
    }
  }

  notifyPrivacyChange(privacy) {
    // Notificar mudança de privacidade
    const privacyMessages = {
      private:
        'Seus dados agora estão privados e não são visíveis publicamente.',
      public:
        'Seus dados agora estão públicos e podem ser visualizados por outros usuários.'
    }

    const message =
      privacyMessages[privacy] || 'Configuração de privacidade atualizada.'

    // Mostrar notificação
    this.showNotification(message, 'info')

    // Registrar mudança no console para debugging
    console.log(`Privacidade alterada para: ${privacy}`)

    // Disparar evento customizado para outros módulos
    const privacyEvent = new CustomEvent('privacyChanged', {
      detail: { privacy, timestamp: new Date() }
    })
    window.dispatchEvent(privacyEvent)
  }

  // Método para mostrar notificações push
  showPushNotification(title, options = {}) {
    if (
      typeof window.notificationsEnabled === 'function' &&
      !window.notificationsEnabled()
    ) {
      console.log('Notificações desabilitadas pelo usuário')
      return
    }

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/assets/img/favicon/favicon-32x32.png',
          badge: '/assets/img/favicon/favicon-16x16.png',
          vibrate: [200, 100, 200],
          ...options
        })
      } else if (Notification.permission === 'default') {
        // Solicitar permissão se ainda não foi solicitada
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
      new Notification(title, {
        icon: '/assets/img/favicon/favicon-32x32.png',
              badge: '/assets/img/favicon/favicon-16x16.png',
              vibrate: [200, 100, 200],
        ...options
      })
          } else {
            console.log('Permissão de notificação negada')
          }
        })
      } else {
        console.log('Permissão de notificação negada pelo usuário')
      }
    } else {
      console.log('Notificações não suportadas neste navegador')
    }
  }

  // Método para mostrar notificação na interface
  showNotification(message, type = 'info') {
    window.showNotification(message, type)
  }

  // Método para obter configurações atuais
  getCurrentSettings() {
    return (
      this.userData?.settings || {
        theme: 'light',
        notifications: true,
        privacy: 'private'
      }
    )
  }

  // Método para atualizar configurações
  async updateSettings(newSettings) {
    try {
      // Validar configurações de privacidade
      const validatedSettings = this.validatePrivacySettings(newSettings)

      const result = await authService.updateUserProfile({
        settings: validatedSettings
      })
      if (result.success) {
        // Recarregar dados do usuário
        await authService.loadUserData()
        this.userData = authService.getUserData()
        this.applySettings()

        // Aplicar configurações específicas se houver mudança de privacidade
        if (validatedSettings.privacy) {
          this.applyPrivacy(validatedSettings.privacy)
        }

        this.showNotification('Configurações atualizadas!', 'success')
        return { success: true }
      } else {
        this.showNotification(
          'Erro ao atualizar configurações: ' + result.error,
          'error'
        )
        return { success: false, error: result.error }
      }
    } catch (error) {
      this.showNotification(
        'Erro ao atualizar configurações: ' + error.message,
        'error'
      )
      return { success: false, error: error.message }
    }
  }

  // Método para verificar se dados podem ser compartilhados
  canShareData(dataType) {
    const privacy = this.getCurrentSettings().privacy || 'private'

    const shareableData = {
      private: [],
      public: ['profile', 'statistics', 'summary']
    }

    return privacy === 'public' && shareableData.public.includes(dataType)
  }

  // Método para obter dados filtrados baseado na privacidade
  getFilteredData(data, dataType) {
    const privacy = this.getCurrentSettings().privacy || 'private'

    if (privacy === 'private') {
      // Retornar dados mínimos ou vazios para modo privado
      return this.getMinimalData(data, dataType)
    } else if (privacy === 'public') {
      // Retornar dados públicos filtrados
      return this.getPublicData(data, dataType)
    }

    return data
  }

  getMinimalData(data, dataType) {
    // Retornar dados mínimos para modo privado
    switch (dataType) {
      case 'profile':
        return {
          name: 'Usuário',
          institution: 'Instituição não divulgada',
          course: 'Curso não divulgado'
        }
      case 'statistics':
        return {
          totalDisciplines: 'N/A',
          completedDisciplines: 'N/A',
          averageGrade: 'N/A'
        }
      default:
        return {}
    }
  }

  getPublicData(data, dataType) {
    // Retornar dados públicos filtrados
    switch (dataType) {
      case 'profile':
        return {
          name: data.name,
          institution: data.profile?.institution,
          course: data.profile?.course
          // Não incluir dados sensíveis como email, matrícula, etc.
        }
      case 'statistics':
        return {
          totalDisciplines: data.totalDisciplines,
          completedDisciplines: data.completedDisciplines,
          averageGrade: data.averageGrade
          // Não incluir notas específicas ou dados detalhados
        }
      default:
        return data
    }
  }

  // Método para obter configuração de privacidade atual
  getCurrentPrivacy() {
    return this.getCurrentSettings().privacy || 'private'
  }

  // Método para verificar se o modo é privado
  isPrivateMode() {
    return this.getCurrentPrivacy() === 'private'
  }

  // Método para verificar se o modo é público
  isPublicMode() {
    return this.getCurrentPrivacy() === 'public'
  }

  // Método para obter dados seguros para compartilhamento
  getShareableData(data, dataType) {
    if (!this.canShareData(dataType)) {
      return null
    }
    return this.getFilteredData(data, dataType)
  }

  // Método para aplicar privacidade a elementos específicos
  applyPrivacyToElement(element, dataType) {
    const privacy = this.getCurrentPrivacy()
    const data = element.dataset

    if (privacy === 'private') {
      // Ocultar ou mascarar dados sensíveis
      if (dataType === 'email') {
        element.textContent = '***@***.***'
      } else if (dataType === 'enrollment') {
        element.textContent = '***'
      } else if (dataType === 'grade') {
        element.textContent = 'N/A'
      }
    }
  }

  // Método para configurar listeners de privacidade
  setupPrivacyListeners() {
    // Listener para mudanças de privacidade
    window.addEventListener('privacyChanged', event => {
      const { privacy } = event.detail
      console.log(`Privacidade alterada para: ${privacy}`)

      // Recarregar interface se necessário
      this.refreshPrivacyUI()
    })

    // Listener para elementos com dados sensíveis
    document.addEventListener('DOMContentLoaded', () => {
      this.setupSensitiveDataProtection()
    })
  }

  // Método para configurar proteção de dados sensíveis
  setupSensitiveDataProtection() {
    const sensitiveElements = document.querySelectorAll('[data-sensitive]')

    sensitiveElements.forEach(element => {
      const dataType = element.getAttribute('data-sensitive')
      this.applyPrivacyToElement(element, dataType)
    })
  }

  // Método para atualizar interface de privacidade
  refreshPrivacyUI() {
    const privacy = this.getCurrentPrivacy()

    // Atualizar todos os elementos de privacidade
    this.applyPrivacyUI(privacy)

    // Atualizar dados sensíveis
    this.setupSensitiveDataProtection()

    // Atualizar controles de compartilhamento
    this.updateSharingControls(privacy)
  }

  // Método para atualizar controles de compartilhamento
  updateSharingControls(privacy) {
    const shareControls = document.querySelectorAll('[data-share-control]')

    shareControls.forEach(control => {
      const shareType = control.getAttribute('data-share-control')

      if (privacy === 'private') {
        control.style.display = 'none'
        control.disabled = true
      } else if (privacy === 'public') {
        control.style.display = ''
        control.disabled = false
      }
    })
  }

  // Método para exportar dados com filtros de privacidade
  exportDataWithPrivacy(data, includeSensitive = false) {
    const privacy = this.getCurrentPrivacy()

    if (privacy === 'private' && !includeSensitive) {
      // Retornar dados sem informações sensíveis
      return this.getMinimalData(data, 'export')
    }

    // Retornar dados completos se permitido
    return data
  }

  // Método para validar configuração de privacidade
  validatePrivacySettings(settings) {
    const validSettings = ['private', 'public']

    if (settings.privacy && !validSettings.includes(settings.privacy)) {
      console.warn(`Configuração de privacidade inválida: ${settings.privacy}`)
      settings.privacy = 'private'
    }

    return settings
  }
}

// Instância global do gerenciador de configurações
const settingsManager = new SettingsManager()

// Função utilitária global para checar se notificações estão ativadas
window.notificationsEnabled = function () {
  // Verificar se o settingsManager está disponível
  if (
    window.settingsManager &&
    window.settingsManager.userData &&
    window.settingsManager.userData.settings
  ) {
    return window.settingsManager.userData.settings.notifications !== false
  }

  // Fallback: tentar pegar do localStorage
  try {
    const userData = JSON.parse(localStorage.getItem('userData'))
    if (
      userData &&
      userData.settings &&
      userData.settings.notifications !== undefined
    ) {
      return userData.settings.notifications !== false
    }
  } catch (error) {
    console.warn(
      'Erro ao verificar configurações de notificação no localStorage:',
      error
    )
  }

  // Verificar se há configuração específica de notificações no localStorage
  try {
    const notificationSetting = localStorage.getItem('notificationsEnabled')
    if (notificationSetting !== null) {
      return notificationSetting === 'true'
    }
  } catch (error) {
    console.warn('Erro ao verificar configuração de notificação:', error)
  }

  // Padrão: ativado se não houver configuração específica
  return true
}

export default settingsManager
