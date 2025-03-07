/**
 * Dark Mode Manager
 * Manages the dark mode functionality for the application
 */
export default class DarkModeManager {
  constructor() {
    this.darkModeKey = 'historico-ufba-dark-mode'
    this.darkModeToggle = null
    this.init()
  }

  /**
   * Initialize the dark mode manager
   */
  init() {
    // Create and inject the dark mode toggle button
    this.createToggleButton()

    // Check if dark mode was previously enabled
    this.loadDarkModePreference()

    // Add event listener for the toggle button
    this.addEventListeners()
  }

  /**
   * Create and inject the dark mode toggle button
   */
  createToggleButton() {
    // Create button container
    const toggleContainer = document.createElement('div')
    toggleContainer.className = 'dark-mode-toggle'

    // Create the toggle button
    this.darkModeToggle = document.createElement('button')
    this.darkModeToggle.className = 'dark-mode-button'
    this.darkModeToggle.setAttribute('aria-label', 'Alternar modo escuro')
    this.darkModeToggle.setAttribute('title', 'Alternar modo escuro')
    this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'

    // Append button to container
    toggleContainer.appendChild(this.darkModeToggle)

    // Find where to insert the toggle button
    const userSection = document.querySelector('.user-section')
    if (userSection) {
      userSection.parentNode.insertBefore(toggleContainer, userSection)
    } else {
      // Fallback - add to the beginning of the container
      const container = document.querySelector('.container')
      if (container) {
        container.insertBefore(toggleContainer, container.firstChild)
      }
    }
  }

  /**
   * Load dark mode preference from localStorage
   */
  loadDarkModePreference() {
    const darkModeEnabled = localStorage.getItem(this.darkModeKey) === 'true'
    if (darkModeEnabled) {
      this.enableDarkMode()
    } else {
      this.disableDarkMode()
    }
  }

  /**
   * Toggle between dark and light mode
   */
  toggleDarkMode() {
    if (document.documentElement.classList.contains('dark-mode')) {
      this.disableDarkMode()
    } else {
      this.enableDarkMode()
    }
  }

  /**
   * Enable dark mode
   */
  enableDarkMode() {
    document.documentElement.classList.add('dark-mode')
    this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    localStorage.setItem(this.darkModeKey, 'true')
    this.darkModeToggle.setAttribute('title', 'Mudar para modo claro')
  }

  /**
   * Disable dark mode
   */
  disableDarkMode() {
    document.documentElement.classList.remove('dark-mode')
    this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    localStorage.setItem(this.darkModeKey, 'false')
    this.darkModeToggle.setAttribute('title', 'Mudar para modo escuro')
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    this.darkModeToggle.addEventListener('click', () => {
      this.toggleDarkMode()
    })

    // Optional: Listen for system preference changes
    if (window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          if (e.matches) {
            this.enableDarkMode()
          } else {
            this.disableDarkMode()
          }
        })
    }
  }
}
