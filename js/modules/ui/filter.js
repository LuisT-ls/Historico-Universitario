// js/modules/ui/filter.js
let filterContainer

export function setupFilterComponent() {
  filterContainer = document.createElement('div')
  filterContainer.className = 'filter-container'
  filterContainer.innerHTML = `
    <div class="filter-header">
      <i class="fas fa-search"></i>
      <h3>Buscar Disciplina</h3>
    </div>
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input 
        type="text" 
        id="disciplineFilter" 
        placeholder="Digite o código ou nome da disciplina..."
        class="filter-input"
      />
      <div id="searchResults" class="search-results"></div>
    </div>
  `

  const form = document.querySelector('.form-container')
  form.parentNode.insertBefore(filterContainer, form)

  setupFilterHandlers()
}

async function setupFilterHandlers() {
  const filterInput = document.getElementById('disciplineFilter')
  const searchResults = document.getElementById('searchResults')
  let disciplinasData = []

  try {
    const response = await fetch('./assets/data/disciplinas.json')
    const data = await response.json()
    disciplinasData = data.disciplinas
  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error)
    searchResults.innerHTML =
      '<div class="no-results">Erro ao carregar disciplinas</div>'
  }

  filterInput.addEventListener('input', e => {
    const searchTerm = e.target.value.toLowerCase().trim()
    if (searchTerm.length < 2) {
      searchResults.innerHTML = ''
      return
    }

    const matches = disciplinasData
      .filter(
        disciplina =>
          disciplina.nome.toLowerCase().includes(searchTerm) ||
          disciplina.codigo.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8) // Limit to 8 results for better UX

    displayResults(matches, searchResults)
  })

  // Close results when clicking outside
  document.addEventListener('click', e => {
    if (!filterContainer.contains(e.target)) {
      searchResults.innerHTML = ''
    }
  })
}

function displayResults(matches, searchResults) {
  if (!matches.length) {
    searchResults.innerHTML =
      '<div class="no-results">Nenhuma disciplina encontrada</div>'
    return
  }

  const html = matches
    .map(
      disciplina => `
    <div class="result-item" data-codigo="${disciplina.codigo}">
      <span class="codigo">${disciplina.codigo}</span>
      <span class="nome">${disciplina.nome}</span>
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
    })
  })
}

function fillFormFields(disciplina) {
  document.getElementById('codigo').value = disciplina.codigo
  document.getElementById('nome').value = disciplina.nome
  document.getElementById('natureza').value = disciplina.natureza
}
