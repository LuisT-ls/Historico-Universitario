// menu.js - Lógica modularizada do menu hambúrguer, interface responsiva e eventos de logout

// Controle do Menu Hambúrguer
export class HamburgerMenu {
  constructor() {
    this.menuToggle = document.getElementById('menuToggle')
    this.mainNav = document.getElementById('mainNav')
    this.navOverlay = document.getElementById('navOverlay')
    this.body = document.body
    this.init()
  }

  init() {
    if (!this.menuToggle || !this.mainNav || !this.navOverlay) {
      console.warn('Elementos do menu hambúrguer não encontrados')
      return
    }
    this.menuToggle.addEventListener('click', e => {
      e.preventDefault()
      this.toggleMenu()
    })
    this.navOverlay.addEventListener('click', () => {
      this.closeMenu()
    })
    this.mainNav.addEventListener('click', e => {
      if (e.target.classList.contains('nav-link')) {
        this.closeMenu()
      }
    })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isMenuOpen()) {
        this.closeMenu()
      }
    })
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen()) {
        this.closeMenu()
      }
    })
    this.setupFocusManagement()
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  openMenu() {
    this.menuToggle.classList.add('active')
    this.mainNav.classList.add('active')
    this.navOverlay.classList.add('active')
    this.body.style.overflow = 'hidden'
    this.menuToggle.setAttribute('aria-expanded', 'true')
    this.menuToggle.setAttribute('title', 'Fechar menu')
    setTimeout(() => {
      const firstNavLink = this.mainNav.querySelector(
        '.nav-link:not([style*="display: none"])'
      )
      if (firstNavLink) {
        firstNavLink.focus()
      }
    }, 100)
  }

  closeMenu() {
    this.menuToggle.classList.remove('active')
    this.mainNav.classList.remove('active')
    this.navOverlay.classList.remove('active')
    this.body.style.overflow = ''
    this.menuToggle.setAttribute('aria-expanded', 'false')
    this.menuToggle.setAttribute('title', 'Abrir menu')
  }

  isMenuOpen() {
    return this.mainNav.classList.contains('active')
  }

  setupFocusManagement() {
    document.addEventListener('keydown', e => {
      if (!this.isMenuOpen() || e.key !== 'Tab') return
      const focusableElements = this.mainNav.querySelectorAll(
        '.nav-link:not([style*="display: none"]):not(.disabled)'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    })
  }
}

// Gerenciamento de estado do usuário para responsividade
export class ResponsiveUserInterface {
  constructor() {
    this.init()
  }
  init() {
    this.updateMobileUserOptions()
    this.setupMediaQueryListener()
  }
  updateMobileUserOptions() {
    const isLoggedIn = this.checkUserLoginStatus()
    const mobileUserOptions = document.querySelectorAll('.mobile-user-option')
    const mobileSeparator = document.querySelector('.mobile-separator')
    if (isLoggedIn) {
      mobileUserOptions.forEach(option => {
        option.style.display = 'flex'
      })
      if (mobileSeparator) {
        mobileSeparator.style.display = 'block'
      }
    } else {
      mobileUserOptions.forEach(option => {
        option.style.display = 'none'
      })
      if (mobileSeparator) {
        mobileSeparator.style.display = 'none'
      }
    }
  }
  checkUserLoginStatus() {
    const userGreeting = document.getElementById('userGreeting')
    return userGreeting && userGreeting.style.display !== 'none'
  }
  setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    mediaQuery.addEventListener('change', mq => {
      if (!mq.matches) {
        const mobileUserOptions = document.querySelectorAll(
          '.mobile-user-option'
        )
        const mobileSeparator = document.querySelector('.mobile-separator')
        mobileUserOptions.forEach(option => {
          option.style.display = 'none'
        })
        if (mobileSeparator) {
          mobileSeparator.style.display = 'none'
        }
      } else {
        this.updateMobileUserOptions()
      }
    })
    if (mediaQuery.matches) {
      this.updateMobileUserOptions()
    }
  }
}

// Função para sincronizar eventos de logout entre desktop e mobile
export function syncLogoutEvents() {
  const logoutBtnNav = document.getElementById('logoutBtnNav')
  const logoutBtn = document.getElementById('logoutBtn')
  const changePasswordMobile = document.getElementById('changePasswordMobile')
  const changePasswordBtn = document.getElementById('changePasswordBtn')
  if (logoutBtnNav && logoutBtn) {
    logoutBtnNav.addEventListener('click', e => {
      e.preventDefault()
      handleLogout()
    })
    logoutBtn.addEventListener('click', e => {
      e.preventDefault()
      handleLogout()
    })
  }
  if (changePasswordMobile && changePasswordBtn) {
    changePasswordMobile.addEventListener('click', e => {
      e.preventDefault()
      handleChangePassword()
    })
    changePasswordBtn.addEventListener('click', e => {
      e.preventDefault()
      handleChangePassword()
    })
  }
}

// Inicialização quando o DOM estiver pronto
export function initMenuUI() {
  const hamburgerMenu = new HamburgerMenu()
  const responsiveUI = new ResponsiveUserInterface()
  syncLogoutEvents()
  window.updateUserInterface = () => {
    responsiveUI.updateMobileUserOptions()
  }
}

// Adicionar CSS dinâmico para melhorar a experiência mobile
export function addMobileCSSEnhancements() {
  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 768px) {
      .mobile-separator {
        margin: 0.5rem 1rem;
      }
      .mobile-separator hr {
        border: none;
        height: 1px;
        background: var(--border-color);
        margin: 1rem 0;
      }
      .mobile-user-option {
        background: var(--surface-light);
      }
      .mobile-user-option:hover {
        background: var(--primary);
        color: white;
      }
      .mobile-user-option:hover i {
        color: white;
      }
    }
  `
  document.head.appendChild(style)
}
