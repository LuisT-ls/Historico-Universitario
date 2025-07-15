import authService from '../firebase/auth.js'
import dataService from '../firebase/data.js'

document.addEventListener('DOMContentLoaded', function () {
  // Add floating label behavior para todos os inputs
  document.querySelectorAll('.input-container input').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused')
    })

    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused')
      }
    })

    // Check initial state
    if (input.value) {
      input.parentElement.classList.add('focused')
    }
  })

  // Toggle password visibility para todos os campos de senha
  document.querySelectorAll('.toggle-password').forEach(toggleButton => {
    toggleButton.addEventListener('click', function () {
      const passwordInput = this.parentElement.querySelector(
        'input[type="password"], input[type="text"]'
      )
      const icon = this.querySelector('i')
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        icon.classList.remove('fa-eye')
        icon.classList.add('fa-eye-slash')
        this.setAttribute('aria-label', 'Ocultar senha')
      } else {
        passwordInput.type = 'password'
        icon.classList.remove('fa-eye-slash')
        icon.classList.add('fa-eye')
        this.setAttribute('aria-label', 'Mostrar senha')
      }
    })
  })

  // Login form handler
  document
    .getElementById('loginForm')
    .addEventListener('submit', async function (e) {
      e.preventDefault()
      const button = this.querySelector('.login-button')
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      button.classList.add('loading')
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...'

      try {
        const result = await authService.loginWithEmail(email, password)

        if (result.success) {
          button.classList.remove('loading')
          button.classList.add('success')
          button.innerHTML = '<i class="fas fa-check"></i> Sucesso!'

          // Configurar serviço de dados
          dataService.setCurrentUser(result.user)

          // Redirecionar para a página principal
          if (window.app && typeof window.app.atualizarTudo === 'function') {
            window.app.atualizarTudo()
          }
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        button.classList.remove('loading')
        button.classList.add('error')
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro!'

        // Mostrar mensagem de erro com sugestões
        let errorMessage = error.message
        if (
          error.message.includes('user-not-found') ||
          error.message.includes('wrong-password')
        ) {
          errorMessage =
            'E-mail ou senha incorretos. Verifique seus dados ou crie uma nova conta.'
        } else if (error.message.includes('too-many-requests')) {
          errorMessage =
            'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        } else if (error.message.includes('network-request-failed')) {
          errorMessage =
            'Erro de conexão. Verifique sua internet e tente novamente.'
        }

        showNotification(errorMessage, 'error')

        setTimeout(() => {
          button.classList.remove('error')
          button.innerHTML =
            '<span class="button-content"><i class="fas fa-sign-in-alt"></i><span>Entrar</span></span>'
        }, 3000)
      }
    })

  // Google login handler
  document
    .querySelector('.google-login-button')
    .addEventListener('click', async function () {
      const button = this
      button.disabled = true
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...'

      try {
        const result = await authService.loginWithGoogle()

        if (result.success) {
          button.classList.add('success')
          button.innerHTML = '<i class="fas fa-check"></i> Sucesso!'

          // Configurar serviço de dados
          dataService.setCurrentUser(result.user)

          // Redirecionar para a página principal
          if (window.app && typeof window.app.atualizarTudo === 'function') {
            window.app.atualizarTudo()
          }
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        button.classList.add('error')
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro!'

        // Mostrar mensagem de erro com sugestões
        let errorMessage = error.message
        if (error.message.includes('popup-closed-by-user')) {
          errorMessage = 'Login cancelado. Tente novamente.'
        } else if (error.message.includes('cancelled-popup-request')) {
          errorMessage = 'Login cancelado. Tente novamente.'
        } else if (error.message.includes('network-request-failed')) {
          errorMessage =
            'Erro de conexão. Verifique sua internet e tente novamente.'
        } else if (
          error.message.includes('account-exists-with-different-credential')
        ) {
          errorMessage =
            'Este e-mail já está associado a outra conta. Tente fazer login com e-mail e senha.'
        }

        showNotification(errorMessage, 'error')

        setTimeout(() => {
          button.disabled = false
          button.classList.remove('error')
          button.innerHTML =
            '<img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon" /><span>Continuar com Google</span>'
        }, 3000)
      }
    })

  // Popup functionality
  const forgotPasswordLink = document.querySelector('.forgot-password')
  const registerLink = document.querySelector('.register-link')
  const forgotPasswordPopup = document.getElementById('forgotPasswordPopup')
  const registerPopup = document.getElementById('registerPopup')
  const closeButtons = document.querySelectorAll('.close-popup')
  const popupOverlays = document.querySelectorAll('.popup-overlay')

  // Função para abrir popup
  function openPopup(popup) {
    console.log('Tentando abrir popup:', popup)
    if (popup) {
      popup.classList.add('active')
      document.body.style.overflow = 'hidden'
      console.log('Popup aberto com sucesso')
    } else {
      console.error('Popup não encontrado')
    }
  }

  // Função para fechar popup
  function closePopup(popup) {
    popup.classList.remove('active')
    document.body.style.overflow = ''
  }

  // Event listeners para abrir popups
  forgotPasswordLink.addEventListener('click', e => {
    e.preventDefault()
    console.log('Abrindo popup de recuperação de senha')
    openPopup(forgotPasswordPopup)
  })

  registerLink.addEventListener('click', e => {
    e.preventDefault()
    console.log('Abrindo popup de registro')
    openPopup(registerPopup)
    initializePopupInputs(registerPopup) // Garante listeners sempre que abrir
  })

  // Event listeners para fechar popups
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const popup = button.closest('.popup-overlay')
      closePopup(popup)
    })
  })

  // Fechar ao clicar fora do popup
  popupOverlays.forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closePopup(overlay)
      }
    })
  })

  // Handler do formulário de recuperação de senha
  const forgotPasswordForm = document.getElementById('forgotPasswordForm')
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function (e) {
      e.preventDefault()
      const button = this.querySelector('.submit-button')
      const email = document.getElementById('recoveryEmail').value

      button.disabled = true
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'

      try {
        const result = await authService.resetPassword(email)

        if (result.success) {
          button.innerHTML = '<i class="fas fa-check"></i> E-mail enviado!'
          showNotification(
            'E-mail de recuperação enviado com sucesso!',
            'success'
          )

          setTimeout(() => {
            closePopup(forgotPasswordPopup)
            button.disabled = false
            button.innerHTML =
              '<span class="button-content"><i class="fas fa-paper-plane"></i><span>Enviar instruções</span></span>'
            this.reset()
          }, 2000)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro!'
        showNotification(error.message, 'error')

        setTimeout(() => {
          button.disabled = false
          button.innerHTML =
            '<span class="button-content"><i class="fas fa-paper-plane"></i><span>Enviar instruções</span></span>'
        }, 3000)
      }
    })
  }

  // Handler do formulário de registro
  const registerForm = document.getElementById('registerForm')
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault()
      const button = this.querySelector('.submit-button')
      const name = document.getElementById('registerName').value
      const email = document.getElementById('registerEmail').value
      const password = document.getElementById('registerPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value

      // Validar senhas
      if (password !== confirmPassword) {
        showNotification('As senhas não correspondem!', 'error')
        return
      }

      if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres!', 'error')
        return
      }

      button.disabled = true
      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Criando conta...'

      try {
        const result = await authService.registerUser(name, email, password)

        if (result.success) {
          button.innerHTML = '<i class="fas fa-check"></i> Conta criada!'
          showNotification('Conta criada com sucesso!', 'success')

          // Configurar serviço de dados
          dataService.setCurrentUser(result.user)

          setTimeout(() => {
            closePopup(registerPopup)
            button.disabled = false
            button.innerHTML =
              '<span class="button-content"><i class="fas fa-user-plus"></i><span>Criar conta</span></span>'
            this.reset()

            // Redirecionar para a página principal
            if (window.app && typeof window.app.atualizarTudo === 'function') {
              window.app.atualizarTudo()
            }
            window.location.href = '/'
          }, 2000)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro!'
        showNotification(error.message, 'error')

        setTimeout(() => {
          button.disabled = false
          button.innerHTML =
            '<span class="button-content"><i class="fas fa-user-plus"></i><span>Criar conta</span></span>'
        }, 3000)
      }
    })
  }

  // Adicão do comportamento de floating label para os inputs dos popups também
  function initializePopupInputs(popup) {
    if (!popup) return

    const inputs = popup.querySelectorAll('.input-container input')
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused')
      })

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused')
        }
      })

      // Check initial state
      if (input.value) {
        input.parentElement.classList.add('focused')
      }
    })

    // Inicializar toggle de senha para os popups
    const toggleButtons = popup.querySelectorAll('.toggle-password')
    toggleButtons.forEach(toggleButton => {
      toggleButton.addEventListener('click', function () {
        const passwordInput = this.parentElement.querySelector(
          'input[type="password"], input[type="text"]'
        )
        const icon = this.querySelector('i')

        if (passwordInput.type === 'password') {
          passwordInput.type = 'text'
          icon.classList.remove('fa-eye')
          icon.classList.add('fa-eye-slash')
          this.setAttribute('aria-label', 'Ocultar senha')
        } else {
          passwordInput.type = 'password'
          icon.classList.remove('fa-eye-slash')
          icon.classList.add('fa-eye')
          this.setAttribute('aria-label', 'Mostrar senha')
        }
      })

      // Adicionar aria-label inicial
      const passwordInput = toggleButton.parentElement.querySelector(
        'input[type="password"], input[type="text"]'
      )
      if (passwordInput && passwordInput.type === 'password') {
        toggleButton.setAttribute('aria-label', 'Mostrar senha')
      } else {
        toggleButton.setAttribute('aria-label', 'Ocultar senha')
      }
    })
  }

  // Inicializar inputs dos popups
  initializePopupInputs(forgotPasswordPopup)
  initializePopupInputs(registerPopup)

  // Escape key para fechar popups
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      popupOverlays.forEach(overlay => {
        if (overlay.classList.contains('active')) {
          closePopup(overlay)
        }
      })
    }
  })

  // Função para mostrar notificações
  function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${
          type === 'success'
            ? 'check-circle'
            : type === 'error'
            ? 'exclamation-triangle'
            : 'info-circle'
        }"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `

    // Adicionar ao DOM
    document.body.appendChild(notification)

    // Mostrar notificação
    setTimeout(() => {
      notification.classList.add('show')
    }, 100)

    // Fechar notificação
    const closeBtn = notification.querySelector('.notification-close')
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show')
      setTimeout(() => {
        notification.remove()
      }, 300)
    })

    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show')
        setTimeout(() => {
          notification.remove()
        }, 300)
      }
    }, 5000)
  }

  // Verificar se usuário já está logado
  authService.onAuthStateChanged((user, userData) => {
    if (user) {
      // Usuário já está logado, redirecionar
      dataService.setCurrentUser(user)
      if (window.app && typeof window.app.atualizarTudo === 'function') {
        window.app.atualizarTudo()
      }
      window.location.href = '/'
    }
  })
})
