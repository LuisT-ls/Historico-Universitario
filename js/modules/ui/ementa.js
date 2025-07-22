// js/modules/ui/ementa.js
import { CURSOS } from '../constants.js'

// Função principal para carregar e exibir a ementa do curso
export function inicializarEmenta() {
  // Adicionar botão para acessar a ementa
  adicionarBotaoEmenta()

  // Criar o modal da ementa (inicialmente oculto)
  criarModalEmenta()

  // Adicionar os estilos de animação das ementas
  adicionarEstilosAnimacao()

  // Configurar eventos
  setupEventListeners()
}

// Adiciona o botão de acesso à ementa no header
function adicionarBotaoEmenta() {
  const cursoContainer = document.querySelector('.form-group.course')

  // Envolver o select e o botão em um container flexível
  if (!document.querySelector('.curso-ementa-container')) {
    const formRow = cursoContainer.closest('.form-row')
    const wrapper = document.createElement('div')
    wrapper.className = 'curso-ementa-container'
    formRow.appendChild(wrapper)
    wrapper.appendChild(cursoContainer)
  }
  const wrapper = document.querySelector('.curso-ementa-container')

  if (!document.getElementById('btn-ementa')) {
    const ementaButton = document.createElement('button')
    ementaButton.id = 'btn-ementa'
    ementaButton.className = 'btn-primary'
    ementaButton.type = 'button'
    ementaButton.innerHTML = '<i class="fas fa-book-open"></i> Ementa'
    wrapper.appendChild(ementaButton)
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
          <i class="fas fa-search ementa-search-icon"></i>
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
  document.getElementById('ementa-close').addEventListener('click', e => {
    e.preventDefault()
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

// Adicionar estilos dinâmicos para os efeitos visuais
function adicionarEstilosAnimacao() {
  const styleElement = document.createElement('style')
  styleElement.textContent = `
    /* Animação de fade para o modal */
    #ementa-modal {
      transition: opacity 0.3s ease;
    }
    
    /* Animação para o conteúdo do modal */
    .ementa-content {
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
    }
    
    /* Animação para as seções de conteúdo */
    .ementa-section-content {
      transition: max-height 0.4s ease, opacity 0.3s ease;
      opacity: 1;
    }
    
    /* Efeito de close do modal */
    #ementa-modal.closing .ementa-content {
      transform: scale(0.95);
      opacity: 0;
    }
    
    /* Estilo para inputs destacados após adição */
    .campo-destacado {
      animation: highlightField 2s ease;
    }
    
    @keyframes highlightField {
      0%, 100% { background-color: var(--background); }
      50% { background-color: rgba(37, 99, 235, 0.1); }
    }
    
    /* Notificação de disciplina adicionada */
    .ementa-notification {
      position: absolute;
      bottom: -60px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--success);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      z-index: 1001;
    }
    
    .ementa-notification.show {
      bottom: 20px;
      opacity: 1;
    }
    
    .ementa-notification i {
      font-size: 1.25rem;
    }
    
    /* Transição suave para cards */
    .disciplina-card {
      transition: all 0.5s ease;
    }
  `

  document.head.appendChild(styleElement)
}

// Abre o modal da ementa e carrega os dados
function abrirEmenta() {
  const modal = document.getElementById('ementa-modal')

  // Reset e preparação para animação
  modal.style.opacity = '0'
  modal.style.display = 'flex'
  document.body.classList.add('modal-open')

  // Animação de entrada
  setTimeout(() => {
    modal.style.opacity = '1'

    // Animação da caixa de conteúdo
    const content = modal.querySelector('.ementa-content')
    content.style.transform = 'translateY(-20px)'
    content.style.opacity = '0'

    setTimeout(() => {
      content.style.transform = 'translateY(0)'
      content.style.opacity = '1'

      // Atualiza o título com o curso atual
      atualizarTituloCurso()

      // Carrega os dados das disciplinas
      carregarDisciplinas()

      // Reseta os filtros
      document.getElementById('ementa-search').value = ''
      document.getElementById('ementa-filter-natureza').value = 'todas'

      // Foca no campo de busca após carregar
      setTimeout(() => {
        document.getElementById('ementa-search').focus()
      }, 500)
    }, 100)
  }, 50)
}

// Fecha o modal da ementa
function fecharEmenta() {
  const modal = document.getElementById('ementa-modal')
  const content = modal.querySelector('.ementa-content')

  // Animação de saída
  content.style.transform = 'translateY(0)'
  content.style.opacity = '1'

  setTimeout(() => {
    content.style.transform = 'translateY(20px)'
    content.style.opacity = '0'

    setTimeout(() => {
      modal.style.opacity = '0'

      setTimeout(() => {
        modal.style.display = 'none'
        document.body.classList.remove('modal-open')

        // Reset dos estilos
        content.style.transform = ''
        content.style.opacity = ''
      }, 200)
    }, 150)
  }, 50)
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
            <span class="section-toggle"><i class="fas fa-chevron-down"></i></span>
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
              <i class="fas fa-plus"></i>
            </button>
          </div>
        `

        // Adiciona evento para adicionar a disciplina ao histórico
        disciplinaCard
          .querySelector('.btn-adicionar-disciplina')
          .addEventListener('click', e => {
            e.stopPropagation() // Previne a propagação do evento

            // Efeito de clique e feedback visual
            const btn = e.currentTarget
            btn.innerHTML =
              '<i class="fas fa-plus" style="transform: scale(0.7); opacity: 0.5;"></i>'

            setTimeout(() => {
              // Efeito de transição para o check
              btn.innerHTML = '<i class="fas fa-check"></i>'
              btn.classList.add('added')

              // Adiciona a disciplina
              adicionarDisciplinaAoHistorico(disc)

              // Remove o feedback visual após um tempo
              setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-plus"></i>'
                btn.classList.remove('added')
              }, 1500)
            }, 100)
          })

        disciplinasGrid.appendChild(disciplinaCard)
      })

      // Adiciona evento para expandir/recolher a seção ao clicar no cabeçalho
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

        // Toggle da classe active para estilização
        sectionHeader.classList.toggle('active')

        if (content.style.maxHeight) {
          // Fechando a seção
          content.style.maxHeight = null
          content.style.opacity = '0'

          // Remove a classe active para o header
          sectionHeader.classList.remove('active')

          setTimeout(() => {
            if (!content.style.maxHeight) {
              content.style.display = 'none'
            }
          }, 300)
        } else {
          // Abrindo a seção
          content.style.display = 'block'
          content.style.opacity = '0'

          // Adiciona a classe active para o header
          sectionHeader.classList.add('active')

          setTimeout(() => {
            content.style.maxHeight = content.scrollHeight + 'px'
            content.style.opacity = '1'
          }, 50)
        }
      })

      ementaContainer.appendChild(secaoNatureza)

      // Abre a primeira seção por padrão
      if (natureza === ordemNaturezas[0]) {
        const content = secaoNatureza.querySelector('.ementa-section-content')
        const icon = secaoNatureza.querySelector('.section-toggle')
        const header = secaoNatureza.querySelector('.ementa-section-header')

        // Adiciona classe active ao cabeçalho
        header.classList.add('active')

        // Configura visibilidade e estilo
        content.style.display = 'block'
        content.style.opacity = '1'
        content.style.maxHeight = content.scrollHeight + 'px'
      }
    }
  })

  // Atualiza o contador total
  document.getElementById('ementa-total-disciplinas').textContent =
    disciplinas.length

  // Adiciona animação de entrada para todos os cards
  const allCards = document.querySelectorAll('.disciplina-card')
  allCards.forEach((card, index) => {
    card.style.opacity = '0'
    card.style.transform = 'translateY(15px)'

    setTimeout(() => {
      card.style.opacity = '1'
      card.style.transform = 'translateY(0)'
    }, 30 * (index % 10)) // Efeito escalonado em grupos para performance
  })
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

    if (isVisible) {
      card.style.display = 'flex'
      card.style.opacity = '1'
      card.style.transform = 'translateY(0)'
      disciplinasVisiveis++
      secaoVisivel.add(natureza)
    } else {
      card.style.opacity = '0'
      card.style.transform = 'translateY(10px)'
      setTimeout(() => {
        if (card.style.opacity === '0') {
          card.style.display = 'none'
        }
      }, 200)
    }
  })

  // Atualiza a visibilidade das seções
  secoesDisciplinas.forEach(secao => {
    const natureza = secao.dataset.natureza
    // Corrigido: busca todos os cards visíveis, não apenas os com style exato
    const disciplinasNaSecao = Array.from(
      secao.querySelectorAll('.disciplina-card')
    ).filter(card => card.style.display !== 'none')

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
      secao.style.opacity = '0'
      setTimeout(() => {
        secao.style.display = 'none'
      }, 300)
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

// Adiciona a disciplina selecionada ao formulário com notificação elegante
function adicionarDisciplinaAoHistorico(disciplina) {
  // Cria notificação de confirmação
  const notification = document.createElement('div')
  notification.className = 'ementa-notification'
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${disciplina.codigo} - ${disciplina.nome}</span>
  `

  document.querySelector('.ementa-content').appendChild(notification)

  // Anima a notificação
  setTimeout(() => {
    notification.classList.add('show')

    // Preenche o formulário com os dados da disciplina
    document.getElementById('codigo').value = disciplina.codigo
    document.getElementById('nome').value = disciplina.nome
    document.getElementById('natureza').value = disciplina.natureza
    document.getElementById('ch').value = disciplina.ch || 60

    // Remove a notificação e fecha o modal após um tempo
    setTimeout(() => {
      notification.classList.remove('show')

      setTimeout(() => {
        notification.remove()
        fecharEmenta()

        // Foca no campo de semestre
        document.getElementById('periodo').focus()

        // Realiza um scroll suave até o formulário
        const formContainer = document.querySelector('.form-container')
        formContainer.scrollIntoView({ behavior: 'smooth' })

        // Destaque visual nos campos preenchidos
        const camposPreenchidos = ['codigo', 'nome', 'natureza', 'ch']
        camposPreenchidos.forEach(campo => {
          const element = document.getElementById(campo)
          element.classList.add('campo-destacado')

          setTimeout(() => {
            element.classList.remove('campo-destacado')
          }, 2000)
        })
      }, 300)
    }, 1500)
  }, 100)
}
