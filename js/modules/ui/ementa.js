// js/modules/ui/ementa.js
import { CURSOS } from '../constants.js'

// Função principal para carregar e exibir a ementa do curso
export function inicializarEmenta() {
  // Adicionar botão para acessar a ementa
  adicionarBotaoEmenta()

  // Criar o modal da ementa (inicialmente oculto)
  criarModalEmenta()

  // Configurar eventos
  setupEventListeners()
}

// Adiciona o botão de acesso à ementa no header
function adicionarBotaoEmenta() {
  const cursoContainer = document.querySelector('.form-group.course')

  if (!document.getElementById('btn-ementa')) {
    const ementaButton = document.createElement('button')
    ementaButton.id = 'btn-ementa'
    ementaButton.className = 'btn-ementa'
    ementaButton.innerHTML = '<i class="fas fa-book-open"></i> Ementa do Curso'

    cursoContainer.insertAdjacentElement('afterend', ementaButton)

    // Adicionar CSS inline para posicionar melhor o botão
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <style>
        .btn-ementa {
          margin-left: 1rem;
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--secondary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .btn-ementa:hover {
          background-color: var(--secondary-dark, #0369a1);
        }
        
        .btn-ementa i {
          margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .btn-ementa {
            margin: 0.5rem 0;
            width: 100%;
            justify-content: center;
          }
        }
      </style>
    `
    )
  }
}

// Cria a estrutura do modal da ementa
function criarModalEmenta() {
  if (document.getElementById('ementa-modal')) return

  const modal = document.createElement('div')
  modal.id = 'ementa-modal'
  modal.className = 'ementa-modal'
  modal.style.display = 'none'

  modal.innerHTML = `
    <div class="ementa-content">
      <div class="ementa-header">
        <h2><i class="fas fa-book-open"></i> Ementa do Curso: <span id="ementa-curso-nome">BICTI</span></h2>
        <button id="ementa-close" class="ementa-close"><i class="fas fa-times"></i></button>
      </div>
      
      <div class="ementa-controls">
        <div class="search-container">
          <input type="text" id="ementa-search" placeholder="Buscar disciplina por código ou nome..." aria-label="Buscar disciplina">
          <i class="fas fa-search search-icon"></i>
        </div>
        
        <div class="filter-container">
          <div class="filter-group">
            <label for="ementa-filter-natureza">Natureza:</label>
            <select id="ementa-filter-natureza" aria-label="Filtrar por natureza">
              <option value="todas">Todas</option>
              <option value="OB">Obrigatórias</option>
              <option value="OG">Grande Área</option>
              <option value="OH">Humanísticas</option>
              <option value="OX">Extensão</option>
              <option value="OZ">Artísticas</option>
              <option value="LV">Livres</option>
              <option value="AC">Atividades Complementares</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="ementa-body">
        <div class="ementa-loading">
          <i class="fas fa-spinner fa-spin"></i> Carregando disciplinas...
        </div>
        
        <div id="ementa-sem-resultados" class="ementa-message" style="display: none;">
          <i class="fas fa-info-circle"></i>
          <p>Nenhuma disciplina encontrada com os filtros selecionados.</p>
        </div>
        
        <div id="ementa-container" class="ementa-container">
          <!-- As disciplinas serão inseridas aqui -->
        </div>
      </div>
      
      <div class="ementa-footer">
        <p>Total: <span id="ementa-total-disciplinas">0</span> disciplinas</p>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

// Configura os eventos relacionados à ementa
function setupEventListeners() {
  // Botão para abrir a ementa
  document.getElementById('btn-ementa').addEventListener('click', () => {
    abrirEmenta()
  })

  // Botão para fechar a ementa
  document.getElementById('ementa-close').addEventListener('click', () => {
    fecharEmenta()
  })

  // Fechamento ao clicar fora do modal
  document.getElementById('ementa-modal').addEventListener('click', e => {
    if (e.target.id === 'ementa-modal') {
      fecharEmenta()
    }
  })

  // Busca
  document.getElementById('ementa-search').addEventListener('input', () => {
    filtrarDisciplinas()
  })

  // Filtros
  document
    .getElementById('ementa-filter-natureza')
    .addEventListener('change', () => {
      filtrarDisciplinas()
    })

  // Evento para quando o curso mudar
  document.getElementById('curso').addEventListener('change', () => {
    // A ementa será atualizada na próxima abertura
    atualizarTituloCurso()
  })

  // Adicionar tecla ESC para fechar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('ementa-modal')
      if (modal && modal.style.display === 'flex') {
        fecharEmenta()
      }
    }
  })
}

// Abre o modal da ementa e carrega os dados
function abrirEmenta() {
  const modal = document.getElementById('ementa-modal')
  modal.style.display = 'flex'
  document.body.classList.add('modal-open')

  // Atualiza o título com o curso atual
  atualizarTituloCurso()

  // Carrega os dados das disciplinas
  carregarDisciplinas()

  // Reseta os filtros
  document.getElementById('ementa-search').value = ''
  document.getElementById('ementa-filter-natureza').value = 'todas'
}

// Fecha o modal da ementa
function fecharEmenta() {
  const modal = document.getElementById('ementa-modal')
  modal.style.display = 'none'
  document.body.classList.remove('modal-open')
}

// Atualiza o título do modal com o nome do curso atual
function atualizarTituloCurso() {
  const cursoSelect = document.getElementById('curso')
  const cursoAtual = cursoSelect.value
  const cursoNome = CURSOS[cursoAtual].nome

  document.getElementById('ementa-curso-nome').textContent = cursoNome
}

// Carrega os dados das disciplinas do curso selecionado
async function carregarDisciplinas() {
  const cursoAtual = document.getElementById('curso').value
  const ementaContainer = document.getElementById('ementa-container')
  const loadingElement = document.querySelector('.ementa-loading')

  // Mostra o indicador de carregamento
  ementaContainer.innerHTML = ''
  loadingElement.style.display = 'flex'
  document.getElementById('ementa-sem-resultados').style.display = 'none'

  try {
    // Carrega os dados do JSON
    const response = await fetch('/assets/data/disciplinas.json')
    if (!response.ok) {
      throw new Error('Falha ao carregar as disciplinas')
    }

    const data = await response.json()
    const disciplinas = data[cursoAtual] || []

    // Esconde o indicador de carregamento
    loadingElement.style.display = 'none'

    if (disciplinas.length === 0) {
      document.getElementById('ementa-sem-resultados').style.display = 'flex'
      document.getElementById('ementa-total-disciplinas').textContent = 0
      return
    }

    // Renderiza as disciplinas
    renderizarDisciplinas(disciplinas)
  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error)
    loadingElement.style.display = 'none'
    ementaContainer.innerHTML = `
      <div class="ementa-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Ocorreu um erro ao carregar as disciplinas. Por favor, tente novamente.</p>
      </div>
    `
    document.getElementById('ementa-total-disciplinas').textContent = 0
  }
}

// Renderiza as disciplinas na ementa
function renderizarDisciplinas(disciplinas) {
  const ementaContainer = document.getElementById('ementa-container')
  ementaContainer.innerHTML = ''

  // Agrupa disciplinas por natureza
  const disciplinasPorNatureza = {}

  disciplinas.forEach(disc => {
    // Define valores padrão para campos que podem estar ausentes
    disc.ch = disc.ch || 60

    if (!disciplinasPorNatureza[disc.natureza]) {
      disciplinasPorNatureza[disc.natureza] = []
    }
    disciplinasPorNatureza[disc.natureza].push(disc)
  })

  // Ordem de exibição das naturezas
  const ordemNaturezas = ['OB', 'OG', 'OH', 'OX', 'OZ', 'LV', 'AC']
  const naturezaLabels = {
    OB: 'Disciplinas Obrigatórias',
    OG: 'Disciplinas Optativas da Grande Área',
    OH: 'Disciplinas Optativas Humanísticas',
    OX: 'Disciplinas Optativas de Extensão',
    OZ: 'Disciplinas Optativas Artísticas',
    LV: 'Componentes Livres',
    AC: 'Atividades Complementares'
  }

  // Cria as seções para cada natureza
  ordemNaturezas.forEach(natureza => {
    if (
      disciplinasPorNatureza[natureza] &&
      disciplinasPorNatureza[natureza].length > 0
    ) {
      // Ordena as disciplinas por código
      const disciplinasOrdenadas = disciplinasPorNatureza[natureza].sort(
        (a, b) => a.codigo.localeCompare(b.codigo)
      )

      // Cria a seção
      const secaoNatureza = document.createElement('div')
      secaoNatureza.className = 'ementa-section'
      secaoNatureza.dataset.natureza = natureza

      // Adiciona o cabeçalho da seção
      secaoNatureza.innerHTML = `
        <div class="ementa-section-header">
          <h3>
            <i class="fas fa-chevron-down section-toggle"></i>
            <span class="natureza-badge natureza-${natureza}">${natureza}</span>
            ${naturezaLabels[natureza]}
            <span class="count-badge">${disciplinasOrdenadas.length}</span>
          </h3>
        </div>
        <div class="ementa-section-content">
          <div class="disciplinas-grid"></div>
        </div>
      `

      // Adiciona as disciplinas à grade
      const disciplinasGrid = secaoNatureza.querySelector('.disciplinas-grid')

      disciplinasOrdenadas.forEach(disc => {
        const disciplinaCard = document.createElement('div')
        disciplinaCard.className = 'disciplina-card'
        disciplinaCard.dataset.codigo = disc.codigo
        disciplinaCard.dataset.nome = disc.nome
        disciplinaCard.dataset.natureza = disc.natureza
        disciplinaCard.dataset.cargaHoraria = disc.ch || 60

        disciplinaCard.innerHTML = `
          <div class="disciplina-header">
            <div class="disciplina-codigo">${disc.codigo}</div>
            <div class="disciplina-ch">${disc.ch || 60}h</div>
          </div>
          <div class="disciplina-nome">${disc.nome}</div>
          <div class="disciplina-footer">
            <div class="disciplina-natureza">${natureza}</div>
            <button class="btn-adicionar-disciplina" title="Adicionar ao histórico">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
        `

        // Adiciona evento para adicionar a disciplina ao histórico
        disciplinaCard
          .querySelector('.btn-adicionar-disciplina')
          .addEventListener('click', () => {
            adicionarDisciplinaAoHistorico(disc)
            // Feedback visual
            const btn = disciplinaCard.querySelector(
              '.btn-adicionar-disciplina'
            )
            btn.innerHTML = '<i class="fas fa-check"></i>'
            btn.classList.add('added')
            setTimeout(() => {
              btn.innerHTML = '<i class="fas fa-plus-circle"></i>'
              btn.classList.remove('added')
            }, 2000)
          })

        disciplinasGrid.appendChild(disciplinaCard)
      })

      // Adiciona evento para expandir/recolher a seção ao clicar em todo o cabeçalho
      const sectionHeader = secaoNatureza.querySelector(
        '.ementa-section-header'
      )
      sectionHeader.addEventListener('click', e => {
        // Prevenir clique no botão de adicionar disciplina
        if (e.target.closest('.btn-adicionar-disciplina')) {
          return
        }

        const content = sectionHeader.nextElementSibling
        const icon = sectionHeader.querySelector('.section-toggle')

        if (content.style.maxHeight) {
          content.style.maxHeight = null
          icon.classList.replace('fa-chevron-up', 'fa-chevron-down')
        } else {
          content.style.maxHeight = content.scrollHeight + 'px'
          icon.classList.replace('fa-chevron-down', 'fa-chevron-up')
        }
      })

      ementaContainer.appendChild(secaoNatureza)

      // Abre a primeira seção por padrão
      if (natureza === ordemNaturezas[0]) {
        const content = secaoNatureza.querySelector('.ementa-section-content')
        const icon = secaoNatureza.querySelector('.section-toggle')
        content.style.maxHeight = content.scrollHeight + 'px'
        icon.classList.replace('fa-chevron-down', 'fa-chevron-up')
      }
    }
  })

  // Atualiza o contador total
  document.getElementById('ementa-total-disciplinas').textContent =
    disciplinas.length
}

// Filtra as disciplinas de acordo com os critérios selecionados
function filtrarDisciplinas() {
  const searchTerm = document
    .getElementById('ementa-search')
    .value.toLowerCase()
  const naturezaFiltro = document.getElementById('ementa-filter-natureza').value

  // Seleciona todos os cards de disciplina
  const disciplinaCards = document.querySelectorAll('.disciplina-card')
  let disciplinasVisiveis = 0
  const secoesDisciplinas = document.querySelectorAll('.ementa-section')
  const secaoVisivel = new Set()

  // Filtra os cards
  disciplinaCards.forEach(card => {
    const codigo = card.dataset.codigo.toLowerCase()
    const nome = card.dataset.nome.toLowerCase()
    const natureza = card.dataset.natureza

    const matchesSearch =
      codigo.includes(searchTerm) || nome.includes(searchTerm)
    const matchesNatureza =
      naturezaFiltro === 'todas' || natureza === naturezaFiltro

    const isVisible = matchesSearch && matchesNatureza
    card.style.display = isVisible ? 'flex' : 'none'

    if (isVisible) {
      disciplinasVisiveis++
      secaoVisivel.add(natureza)
    }
  })

  // Atualiza a visibilidade das seções
  secoesDisciplinas.forEach(secao => {
    const natureza = secao.dataset.natureza
    const disciplinasNaSecao = secao.querySelectorAll(
      '.disciplina-card[style="display: flex;"]'
    )

    if (disciplinasNaSecao.length > 0) {
      secao.style.display = 'block'
      secao.querySelector('.count-badge').textContent =
        disciplinasNaSecao.length

      // Atualiza altura máxima da seção expandida
      const content = secao.querySelector('.ementa-section-content')
      if (content.style.maxHeight) {
        content.style.maxHeight = content.scrollHeight + 'px'
      }
    } else {
      secao.style.display = 'none'
    }
  })

  // Atualiza mensagem de "sem resultados"
  if (disciplinasVisiveis === 0) {
    document.getElementById('ementa-sem-resultados').style.display = 'flex'
  } else {
    document.getElementById('ementa-sem-resultados').style.display = 'none'
  }

  // Atualiza o contador total
  document.getElementById('ementa-total-disciplinas').textContent =
    disciplinasVisiveis
}

// Adiciona a disciplina selecionada ao formulário
function adicionarDisciplinaAoHistorico(disciplina) {
  // Preenche o formulário com os dados da disciplina
  document.getElementById('codigo').value = disciplina.codigo
  document.getElementById('nome').value = disciplina.nome
  document.getElementById('natureza').value = disciplina.natureza
  document.getElementById('ch').value = disciplina.ch || 60

  // Fecha o modal da ementa
  fecharEmenta()

  // Foca no campo de semestre
  document.getElementById('periodo').focus()

  // Realiza um scroll suave até o formulário
  const formContainer = document.querySelector('.form-container')
  formContainer.scrollIntoView({ behavior: 'smooth' })
}
