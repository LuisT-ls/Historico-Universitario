// js/modules/ui/filter.js
let filterContainer
let currentCourse = 'BICTI' // Valor padrão
let typingTimer
const doneTypingInterval = 300 // Tempo em ms para considerar a digitação finalizada

export function setupFilterComponent() {
  filterContainer = document.createElement('div')
  filterContainer.className = 'filter-container'
  filterContainer.innerHTML = `
    <div class="filter-header">
      <i class="fas fa-search"></i>
      <h2>Buscar Disciplina</h2>
    </div>
    <div class="search-container">
      <input 
        type="text" 
        id="disciplineFilter" 
        placeholder="Digite o código ou nome da disciplina..."
        class="filter-input"
        autocomplete="off"
      />
      <i class="fas fa-search filter-search-icon" aria-hidden="true"></i>
      <div id="searchResults" class="search-results"></div>
    </div>
  `

  const form = document.querySelector('.form-container')
  form.parentNode.insertBefore(filterContainer, form)

  // Adicionar listener para mudança de curso
  const cursoSelect = document.getElementById('curso')
  cursoSelect.addEventListener('change', e => {
    currentCourse = e.target.value
    // Limpar resultados quando mudar o curso
    document.getElementById('searchResults').innerHTML = ''
    document.getElementById('disciplineFilter').value = ''
  })

  setupFilterHandlers()
}

async function setupFilterHandlers() {
  const filterInput = document.getElementById('disciplineFilter')
  const searchResults = document.getElementById('searchResults')
  let disciplinasData = {}
  let selectedIndex = -1
  let visibleResults = []

  try {
    const response = await fetch('./assets/data/disciplinas.json')
    const data = await response.json()
    disciplinasData = data

    // Feedback visual para o usuário saber que os dados carregaram
    filterInput.placeholder = 'Digite o código ou nome da disciplina...'
    filterInput.disabled = false
  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error)
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-exclamation-circle"></i>
        <span>Erro ao carregar disciplinas</span>
      </div>
    `
    filterInput.placeholder = 'Erro ao carregar disciplinas...'
    filterInput.disabled = true
  }

  // Selecionar o texto quando o input recebe foco
  filterInput.addEventListener('focus', () => {
    filterInput.select()

    // Se tiver valor e resultados ocultos, mostrar novamente
    if (filterInput.value.trim().length >= 2) {
      performSearch(filterInput.value.toLowerCase().trim())
    }
  })

  // Usar debounce para melhorar performance
  filterInput.addEventListener('input', e => {
    clearTimeout(typingTimer)

    // Resetar seleção
    selectedIndex = -1

    const searchTerm = e.target.value.toLowerCase().trim()
    if (searchTerm.length < 2) {
      searchResults.innerHTML = ''
      return
    }

    // Começar a busca após um pequeno delay
    typingTimer = setTimeout(() => {
      performSearch(searchTerm)
    }, doneTypingInterval)
  })

  // Navegação por teclado
  filterInput.addEventListener('keydown', e => {
    if (
      !searchResults.children.length ||
      searchResults.children[0].classList.contains('no-results')
    )
      return

    visibleResults = Array.from(searchResults.querySelectorAll('.result-item'))

    // Seta para baixo
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, visibleResults.length - 1)
      updateSelectedResult()
    }

    // Seta para cima
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      updateSelectedResult()
    }

    // Enter para selecionar
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      visibleResults[selectedIndex].click()
    }

    // Escape para fechar resultados
    else if (e.key === 'Escape') {
      searchResults.innerHTML = ''
    }
  })

  function updateSelectedResult() {
    visibleResults.forEach(item => item.classList.remove('selected'))

    if (selectedIndex >= 0) {
      visibleResults[selectedIndex].classList.add('selected')

      // Garantir que o item selecionado esteja visível no scroll
      visibleResults[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }

  function performSearch(searchTerm) {
    // Usar apenas as disciplinas do curso atual
    const disciplinasDoCurso = disciplinasData[currentCourse] || []

    const matches = disciplinasDoCurso
      .filter(
        disciplina =>
          disciplina.nome.toLowerCase().includes(searchTerm) ||
          disciplina.codigo.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8) // Limita a 8 resultados para melhor UX

    displayResults(matches, searchResults, searchTerm)
  }

  // Fechar resultados ao clicar fora
  document.addEventListener('click', e => {
    if (!filterContainer.contains(e.target)) {
      searchResults.innerHTML = ''
    }
  })
}

function displayResults(matches, searchResults, searchTerm) {
  if (!matches.length) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <span>Nenhuma disciplina encontrada para "${searchTerm}"</span>
      </div>
    `
    return
  }

  const html = matches
    .map(
      disciplina => `
    <div class="result-item" data-codigo="${disciplina.codigo}">
      <span class="codigo">${highlightMatch(
        disciplina.codigo,
        searchTerm
      )}</span>
      <span class="nome">${highlightMatch(disciplina.nome, searchTerm)}</span>
      <span class="natureza">${disciplina.natureza}</span>
    </div>
  `
    )
    .join('')

  searchResults.innerHTML = html

  document.querySelectorAll('.result-item').forEach(item => {
    item.addEventListener('click', () => {
      const disciplina = matches.find(d => d.codigo === item.dataset.codigo)
      fillFormFields(disciplina)
      searchResults.innerHTML = ''
      document.getElementById('disciplineFilter').value = disciplina.nome

      // Efeito de feedback visual
      animateFormFeedback(disciplina)
    })
  })
}

// Destaca os termos de busca nos resultados
function highlightMatch(text, searchTerm) {
  if (!searchTerm) return text

  const regex = new RegExp(
    `(${searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`,
    'gi'
  )
  return text.replace(regex, '<mark>$1</mark>')
}

function fillFormFields(disciplina) {
  document.getElementById('codigo').value = disciplina.codigo
  document.getElementById('nome').value = disciplina.nome
  document.getElementById('natureza').value = disciplina.natureza
  document.getElementById('ch').value = disciplina.ch || 60
}

// Animação de feedback visual ao selecionar uma disciplina
function animateFormFeedback(disciplina) {
  // Adicionar destaque aos campos preenchidos
  const camposPreenchidos = ['codigo', 'nome', 'natureza', 'ch']
  camposPreenchidos.forEach(campo => {
    const element = document.getElementById(campo)
    if (element) {
      element.classList.add('campo-destacado')

      setTimeout(() => {
        element.classList.remove('campo-destacado')
      }, 2000)
    }
  })

  // Adiciona uma notificação temporária
  const notification = document.createElement('div')
  notification.className = 'selected-notification'
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Disciplina "${disciplina.codigo} - ${disciplina.nome}" selecionada</span>
  `

  filterContainer.appendChild(notification)

  setTimeout(() => {
    notification.classList.add('show')

    setTimeout(() => {
      notification.classList.remove('show')

      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 2000)
  }, 100)
}
