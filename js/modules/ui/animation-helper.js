// js/modules/ui/animation-helper.js

/**
 * Realiza uma animação de destaque para um elemento
 * @param {HTMLElement} element - O elemento a ser destacado
 * @param {string} className - A classe CSS para adicionar temporariamente
 * @param {number} duration - Duração da animação em milissegundos
 */
export function highlightElement(
  element,
  className = 'highlight-pulse',
  duration = 1500
) {
  if (!element) return

  element.classList.add(className)

  setTimeout(() => {
    element.classList.remove(className)
  }, duration)
}

/**
 * Rola suavemente até um elemento com efeitos visuais aprimorados
 * @param {HTMLElement} element - O elemento alvo para rolar até
 * @param {Object} options - Opções de configuração
 */
export function smoothScrollToElement(element, options = {}) {
  if (!element) return

  const defaults = {
    offset: 20, // Deslocamento do topo em pixels
    behavior: 'smooth', // Comportamento de rolagem
    highlightEffect: true, // Se deve destacar o elemento
    highlightClass: 'scroll-highlight', // Classe de destaque
    highlightDuration: 1200, // Duração do destaque em ms
    delay: 0 // Atraso antes da rolagem em ms
  }

  const config = { ...defaults, ...options }

  // Adiciona os estilos da animação se ainda não existirem
  addScrollHighlightStyles(config.highlightClass)

  setTimeout(() => {
    // Calcula a posição de rolagem
    const elementRect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const targetPosition = elementRect.top + scrollTop - config.offset

    // Animação de rolagem
    window.scrollTo({
      top: targetPosition,
      behavior: config.behavior
    })

    // Efeito de destaque após a rolagem
    if (config.highlightEffect) {
      setTimeout(
        () => {
          highlightElement(
            element,
            config.highlightClass,
            config.highlightDuration
          )
        },
        config.behavior === 'smooth' ? 500 : 0
      )
    }
  }, config.delay)
}

/**
 * Adiciona os estilos necessários para a animação de destaque
 * @param {string} className - O nome da classe CSS a ser criada
 */
function addScrollHighlightStyles(className) {
  // Verifica se os estilos já foram adicionados
  if (document.querySelector(`style[data-animation="${className}"]`)) return

  const style = document.createElement('style')
  style.setAttribute('data-animation', className)

  style.textContent = `
    @keyframes ${className}-animation {
      0% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
      }
      20% {
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.2);
      }
      40% {
        box-shadow: 0 0 0 16px rgba(37, 99, 235, 0.1);
      }
      60% {
        box-shadow: 0 0 0 12px rgba(37, 99, 235, 0.05);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
      }
    }
    
    .${className} {
      animation: ${className}-animation 1.2s ease-out;
      border-color: var(--primary) !important;
      transition: all 0.3s ease;
    }
  `

  document.head.appendChild(style)
}
