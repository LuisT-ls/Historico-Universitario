/**
 * Navigation Manager
 * Manages the navigation functionality for all pages
 */
export default class NavigationManager {
  constructor() {
    this.menuToggle = null
    this.mainNav = null
    this.navOverlay = null
    this.userDropdown = null
    this.initialized = false
  }

  /**
   * Initialize the navigation manager
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.setupNavigation()
      )
    } else {
      // Add a small delay to ensure other scripts have loaded
      setTimeout(() => this.setupNavigation(), 100)
    }
  }

  /**
   * Setup navigation elements and event listeners
   */
  setupNavigation() {
    if (this.initialized) return

    // Get navigation elements
    this.menuToggle = document.getElementById('menuToggle')
    this.mainNav = document.getElementById('mainNav')
    this.navOverlay = document.getElementById('navOverlay')
    this.userDropdown = document.getElementById('userDropdown')

    // Setup mobile menu
    this.setupMobileMenu()

    // Setup user dropdown
    this.setupUserDropdown()

    // Setup datetime display
    this.setupDateTimeDisplay()

    // Setup active link highlighting
    this.setupActiveLinkHighlighting()

    this.initialized = true
  }

  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    if (!this.menuToggle || !this.mainNav || !this.navOverlay) return

    // Toggle menu on button click
    this.menuToggle.addEventListener('click', () => {
      this.toggleMobileMenu()
    })

    // Close menu on overlay click
    this.navOverlay.addEventListener('click', () => {
      this.closeMobileMenu()
    })

    // Close menu on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu()
      }
    })

    // Close menu on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMobileMenuOpen()) {
        this.closeMobileMenu()
      }
    })
  }

  /**
   * Setup user dropdown functionality
   */
  setupUserDropdown() {
    if (!this.userDropdown) return

    // Toggle dropdown on click
    this.userDropdown.addEventListener('click', e => {
      e.stopPropagation()
      this.toggleUserDropdown()
    })

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!this.userDropdown.contains(e.target)) {
        this.closeUserDropdown()
      }
    })

    // Close dropdown on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isUserDropdownOpen()) {
        this.closeUserDropdown()
      }
    })
  }

  /**
   * Setup datetime display
   */
  setupDateTimeDisplay() {
    const datetimeDisplay = document.getElementById('current-datetime')
    if (!datetimeDisplay) return

    // Update datetime every second
    this.updateDateTime()
    setInterval(() => this.updateDateTime(), 1000)
  }

  /**
   * Update datetime display
   */
  updateDateTime() {
    const datetimeDisplay = document.getElementById('current-datetime')
    if (!datetimeDisplay) return

    const now = new Date()

    // Formato dd/mm/aaaa hh:mm:ss
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    datetimeDisplay.textContent = formattedDate
    datetimeDisplay.setAttribute('datetime', now.toISOString())
  }

  /**
   * Setup active link highlighting
   */
  setupActiveLinkHighlighting() {
    const currentPath = window.location.pathname
    const navLinks = document.querySelectorAll('.nav-link')

    navLinks.forEach(link => {
      const href = link.getAttribute('href')

      // Remove active class from all links
      link.classList.remove('active')

      // Add active class to current page link
      if (
        href === currentPath ||
        (currentPath === '/' && href === '/') ||
        (currentPath === '/index.html' && href === '/') ||
        (currentPath.includes('certificados') &&
          href.includes('certificados')) ||
        (currentPath.includes('profile') && href.includes('profile'))
      ) {
        link.classList.add('active')
      }
    })
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu()
    } else {
      this.openMobileMenu()
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    if (!this.mainNav || !this.navOverlay || !this.menuToggle) return

    this.mainNav.classList.add('active')
    this.navOverlay.classList.add('active')
    this.menuToggle.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (!this.mainNav || !this.navOverlay || !this.menuToggle) return

    this.mainNav.classList.remove('active')
    this.navOverlay.classList.remove('active')
    this.menuToggle.classList.remove('active')
    document.body.style.overflow = ''
  }

  /**
   * Check if mobile menu is open
   */
  isMobileMenuOpen() {
    return this.mainNav && this.mainNav.classList.contains('active')
  }

  /**
   * Toggle user dropdown
   */
  toggleUserDropdown() {
    if (this.isUserDropdownOpen()) {
      this.closeUserDropdown()
    } else {
      this.openUserDropdown()
    }
  }

  /**
   * Open user dropdown
   */
  openUserDropdown() {
    if (!this.userDropdown) return

    const userMenu = this.userDropdown.querySelector('.user-menu')
    if (userMenu) {
      userMenu.style.display = 'block'
    }
  }

  /**
   * Close user dropdown
   */
  closeUserDropdown() {
    if (!this.userDropdown) return

    const userMenu = this.userDropdown.querySelector('.user-menu')
    if (userMenu) {
      userMenu.style.display = 'none'
    }
  }

  /**
   * Check if user dropdown is open
   */
  isUserDropdownOpen() {
    if (!this.userDropdown) return false

    const userMenu = this.userDropdown.querySelector('.user-menu')
    return userMenu && userMenu.style.display === 'block'
  }

  /**
   * Show/hide elements based on authentication state and current page
   */
  updateAuthState(isAuthenticated, userData = null) {
    const currentPath = window.location.pathname
    const isProfilePage = currentPath.includes('profile')
    const isCertificadosPage = currentPath.includes('certificados')
    const isIndexPage = currentPath === '/' || currentPath.includes('index')

    console.log('NavigationManager updateAuthState:', {
      isAuthenticated,
      currentPath,
      isProfilePage,
      isCertificadosPage,
      isIndexPage
    })

    // Elements to show/hide based on auth state
    const elements = {
      // User greeting
      userGreeting: document.getElementById('userGreeting'),
      userName: document.getElementById('userName'),

      // Profile link
      profileLink: document.getElementById('profileLink'),

      // User dropdown
      userDropdown: document.getElementById('userDropdown'),

      // Mobile user options
      editProfileMobile: document.getElementById('editProfileMobile'),
      changePasswordMobile: document.getElementById('changePasswordMobile'),

      // Auth buttons
      logoutBtnNav: document.getElementById('logoutBtnNav'),
      loginBtnNav: document.getElementById('loginBtnNav'),
      loginBtn: document.getElementById('loginBtn')
    }

    if (isAuthenticated) {
      // Show authenticated elements
      if (elements.userGreeting) elements.userGreeting.style.display = 'block'
      if (elements.profileLink) elements.profileLink.style.display = 'flex'
      if (elements.userDropdown) elements.userDropdown.style.display = 'block'

      // Update user name
      if (elements.userName && userData) {
        elements.userName.textContent = userData.name || 'Usuário'
      }

      // Page-specific logic
      if (isIndexPage) {
        // Página principal: mostrar botão sair
        if (elements.logoutBtnNav) elements.logoutBtnNav.style.display = 'flex'
        if (elements.editProfileMobile)
          elements.editProfileMobile.style.display = 'flex'
        if (elements.changePasswordMobile)
          elements.changePasswordMobile.style.display = 'flex'
      } else if (isProfilePage) {
        // Página de perfil: não mostrar botão entrar (usuário já está logado)
        if (elements.logoutBtnNav) elements.logoutBtnNav.style.display = 'none'
        if (elements.editProfileMobile)
          elements.editProfileMobile.style.display = 'none'
        if (elements.changePasswordMobile)
          elements.changePasswordMobile.style.display = 'none'
      } else if (isCertificadosPage) {
        // Página de certificados: não mostrar botões de perfil/senha/sair
        if (elements.logoutBtnNav) elements.logoutBtnNav.style.display = 'none'
        if (elements.editProfileMobile)
          elements.editProfileMobile.style.display = 'none'
        if (elements.changePasswordMobile)
          elements.changePasswordMobile.style.display = 'none'
      }

      // Hide login elements
      if (elements.loginBtnNav) elements.loginBtnNav.style.display = 'none'
      if (elements.loginBtn) elements.loginBtn.style.display = 'none'
    } else {
      // Hide authenticated elements
      if (elements.userGreeting) elements.userGreeting.style.display = 'none'
      if (elements.profileLink) elements.profileLink.style.display = 'none'
      if (elements.userDropdown) elements.userDropdown.style.display = 'none'
      if (elements.editProfileMobile)
        elements.editProfileMobile.style.display = 'none'
      if (elements.changePasswordMobile)
        elements.changePasswordMobile.style.display = 'none'
      if (elements.logoutBtnNav) elements.logoutBtnNav.style.display = 'none'

      // Show login elements only on index page
      if (isIndexPage) {
        if (elements.loginBtnNav) elements.loginBtnNav.style.display = 'flex'
        if (elements.loginBtn) elements.loginBtn.style.display = 'flex'
      } else {
        // Hide login elements on protected pages
        if (elements.loginBtnNav) elements.loginBtnNav.style.display = 'none'
        if (elements.loginBtn) elements.loginBtn.style.display = 'none'
      }
    }
  }

  /**
   * Setup event listeners for auth buttons
   */
  setupAuthEventListeners(authService) {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn')
    const logoutBtnNav = document.getElementById('logoutBtnNav')

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await authService.logout()
          this.updateAuthState(false)
          this.showNotification('Logout realizado com sucesso', 'success')
        } catch (error) {
          console.error('Erro no logout:', error)
          this.showNotification('Erro ao fazer logout', 'error')
        }
      })
    }

    if (logoutBtnNav) {
      logoutBtnNav.addEventListener('click', async () => {
        try {
          await authService.logout()
          this.updateAuthState(false)
          this.showNotification('Logout realizado com sucesso', 'success')
        } catch (error) {
          console.error('Erro no logout:', error)
          this.showNotification('Erro ao fazer logout', 'error')
        }
      })
    }

    // Login button
    const loginBtn = document.getElementById('loginBtn')
    const loginBtnNav = document.getElementById('loginBtnNav')

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.href = '/login.html'
      })
    }

    if (loginBtnNav) {
      loginBtnNav.addEventListener('click', () => {
        window.location.href = '/login.html'
      })
    }

    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn')
    const changePasswordMobile = document.getElementById('changePasswordMobile')

    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        this.showNotification('Funcionalidade em desenvolvimento', 'info')
      })
    }

    if (changePasswordMobile) {
      changePasswordMobile.addEventListener('click', () => {
        this.showNotification('Funcionalidade em desenvolvimento', 'info')
      })
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message

    // Styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `

    // Colors based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }

    notification.style.backgroundColor = colors[type] || colors.info

    // Add to DOM
    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Export singleton instance
export const navigationManager = new NavigationManager()

// Initialize navigation manager
navigationManager.init()
