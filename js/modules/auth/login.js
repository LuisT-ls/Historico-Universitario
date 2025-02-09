document.addEventListener('DOMContentLoaded', function () {
  // Toggle password visibility para todos os campos de senha
  document.querySelectorAll('.toggle-password').forEach(toggleButton => {
    toggleButton.addEventListener('click', function () {
      const passwordInput = this.previousElementSibling
      const icon = this.querySelector('i')

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        icon.classList.remove('fa-eye')
        icon.classList.add('fa-eye-slash')
      } else {
        passwordInput.type = 'password'
        icon.classList.remove('fa-eye-slash')
        icon.classList.add('fa-eye')
      }
    })
  })

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

  // Add loading state to login button
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault()
    const button = this.querySelector('.login-button')
    button.classList.add('loading')

    // Simulate loading state
    setTimeout(() => {
      button.classList.remove('loading')
      button.classList.add('success')

      // Reset after animation
      setTimeout(() => {
        button.classList.remove('success')
      }, 2000)
    }, 2000)
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
    popup.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  // Função para fechar popup
  function closePopup(popup) {
    popup.classList.remove('active')
    document.body.style.overflow = ''
  }

  // Event listeners para abrir popups
  forgotPasswordLink.addEventListener('click', e => {
    e.preventDefault()
    openPopup(forgotPasswordPopup)
  })

  registerLink.addEventListener('click', e => {
    e.preventDefault()
    openPopup(registerPopup)
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
    forgotPasswordForm.addEventListener('submit', function (e) {
      e.preventDefault()
      const button = this.querySelector('.submit-button')
      button.disabled = true
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'

      // Simular envio (substitua por sua lógica real)
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> E-mail enviado!'
        setTimeout(() => {
          closePopup(forgotPasswordPopup)
          button.disabled = false
          button.innerHTML =
            '<span class="button-content"><i class="fas fa-paper-plane"></i><span>Enviar instruções</span></span>'
          this.reset()
        }, 2000)
      }, 2000)
    })
  }

  // Handler do formulário de registro
  const registerForm = document.getElementById('registerForm')
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault()
      const button = this.querySelector('.submit-button')
      button.disabled = true
      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Criando conta...'

      // Validar senhas
      const password = document.getElementById('registerPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value

      if (password !== confirmPassword) {
        alert('As senhas não correspondem!')
        button.disabled = false
        button.innerHTML =
          '<span class="button-content"><i class="fas fa-user-plus"></i><span>Criar conta</span></span>'
        return
      }

      // Simulação de registro (precisa substituir pela lógica para o bd)
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Conta criada!'
        setTimeout(() => {
          closePopup(registerPopup)
          button.disabled = false
          button.innerHTML =
            '<span class="button-content"><i class="fas fa-user-plus"></i><span>Criar conta</span></span>'
          this.reset()
        }, 2000)
      }, 2000)
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
})
