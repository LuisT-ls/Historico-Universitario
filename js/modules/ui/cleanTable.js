// js/modules/ui/cleanTable.js

/**
 * Módulo responsável por implementar a funcionalidade de limpeza completa
 * da tabela de disciplinas cursadas, com confirmação via modal
 */

// Importar a função salvarDisciplinas
import { salvarDisciplinas } from '../storage.js'

/**
 * Configura o botão de limpar tabela e os eventos do modal de confirmação
 */
export function setupCleanTableButton() {
  // Garante que os elementos HTML necessários existam na página
  ensureElementsExist()

  const limparBtn = document.getElementById('limparTabelaBtn')
  const modal = document.getElementById('confirmacaoModal')
  const closeBtn = modal.querySelector('.close')
  const cancelarBtn = document.getElementById('cancelarLimparBtn')
  const confirmarBtn = document.getElementById('confirmarLimparBtn')

  // Abrir o modal quando clicar no botão limpar
  limparBtn.addEventListener('click', () => {
    // Verificar se há disciplinas para limpar
    const app = window.app.__appInstance
    if (!app || !app.disciplinas || app.disciplinas.length === 0) {
      // Se não houver disciplinas, mostrar mensagem informativa
      showNotification('Não há disciplinas para remover', 'info')
      return
    }

    // Abrir modal de confirmação
    modal.style.display = 'block'
    document.body.style.overflow = 'hidden' // Impede o scroll da página
  })

  // Fechar o modal quando clicar no X
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto' // Restaura o scroll da página
  })

  // Fechar o modal quando clicar fora dele
  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none'
      document.body.style.overflow = 'auto' // Restaura o scroll da página
    }
  })

  // Fechar o modal quando pressionar ESC
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none'
      document.body.style.overflow = 'auto' // Restaura o scroll da página
    }
  })

  // Fechar o modal quando clicar em cancelar
  cancelarBtn.addEventListener('click', () => {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto' // Restaura o scroll da página
  })

  // Processar a limpeza quando confirmar
  confirmarBtn.addEventListener('click', () => {
    // Acessar a instância do aplicativo
    const app = window.app.__appInstance

    // Verificar se a instância do app está disponível
    if (!app) {
      showNotification('Erro: Não foi possível acessar a aplicação', 'error')
      modal.style.display = 'none'
      document.body.style.overflow = 'auto'
      return
    }

    // Obter o token CSRF para segurança
    const token = window.app.csrfProtection
      ? window.app.csrfProtection.getToken()
      : null

    // Verificar o token CSRF antes de prosseguir
    if (!token || !app.validarOperacao(token)) {
      console.error('Erro de validação CSRF: Operação não autorizada')
      showNotification('Erro de segurança: Operação não autorizada', 'error')
      modal.style.display = 'none'
      document.body.style.overflow = 'auto'
      return
    }

    // Guardar a quantidade de disciplinas removidas para feedback
    const qtdRemovidas = app.disciplinas.length

    // Limpar o array de disciplinas
    app.disciplinas = []

    // Salvar as alterações no armazenamento
    // Usar a função importada do módulo storage.js em vez de tentar chamar um método do app
    salvarDisciplinas([], app.cursoAtual)

    // Atualizar a interface
    app.atualizarTudo()

    // Fechar o modal
    modal.style.display = 'none'
    document.body.style.overflow = 'auto'

    // Mostrar notificação de sucesso
    showNotification(
      `${qtdRemovidas} disciplina(s) removida(s) com sucesso`,
      'success'
    )

    // Atualizar o simulador se estiver ativo
    if (app.simulation && app.simulation.isSimulationMode) {
      app.simulation.simulator.disciplinasCursadas = []
      app.simulation.atualizarSimulacao()
    }
  })
}

/**
 * Mostra uma notificação temporária na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação: 'success', 'error' ou 'info'
 */
function showNotification(message, type = 'success') {
  // Verifica se já existe uma notificação e remove
  const existingNotification = document.querySelector('.notification')
  if (existingNotification) {
    existingNotification.remove()
  }

  // Cria o elemento de notificação
  const notification = document.createElement('div')
  notification.className = `notification ${type}`

  // Adiciona ícone adequado conforme o tipo de notificação
  let icon = ''
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i> '
      break
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i> '
      break
    case 'info':
      icon = '<i class="fas fa-info-circle"></i> '
      break
  }

  notification.innerHTML = icon + message

  // Adiciona ao corpo do documento
  document.body.appendChild(notification)

  // Adiciona a classe show para iniciar a animação
  setTimeout(() => notification.classList.add('show'), 10)

  // Remove a notificação após 3 segundos
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => notification.remove(), 300) // Tempo para a animação de fade-out
  }, 3000)
}

/**
 * Garante que todos os elementos HTML necessários para a funcionalidade
 * estejam presentes no DOM
 */
function ensureElementsExist() {
  // Verificar se o modal já existe
  if (!document.getElementById('confirmacaoModal')) {
    // Criar o modal
    const modal = document.createElement('div')
    modal.id = 'confirmacaoModal'
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-labelledby', 'modalTitle')
    modal.setAttribute('aria-describedby', 'modalDescription')
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle"><i class="fas fa-exclamation-triangle"></i> Confirmação</h2>
          <span class="close" aria-label="Fechar" role="button" tabindex="0">&times;</span>
        </div>
        <div class="modal-body" id="modalDescription">
          <p>Você está prestes a remover <strong>todas as disciplinas</strong> do seu histórico.</p>
          <p class="warning-text">Esta ação é <strong>irreversível</strong> e todos os dados serão perdidos.</p>
          <p>Tem certeza que deseja continuar?</p>
        </div>
        <div class="modal-footer">
          <button id="cancelarLimparBtn" class="btn-secondary">Cancelar</button>
          <button id="confirmarLimparBtn" class="btn-danger">Confirmar Exclusão</button>
        </div>
      </div>
    `

    // Adicionar o modal ao corpo do documento
    document.body.appendChild(modal)
  }

  // Adicionar os estilos necessários se não existirem
  if (!document.querySelector('style#clean-table-styles')) {
    const style = document.createElement('style')
    style.id = 'clean-table-styles'
    style.textContent = `
      /* Estilos para o botão de limpar tabela */
      .clean-table-container {
        display: flex;
        justify-content: flex-end;
        margin: 10px 0;
      }
      
      .btn-clean {
        background-color: var(--danger);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s ease;
      }
      
      .btn-clean:hover {
        background-color: #dc2626; /* Uma tonalidade mais escura de vermelho */
      }
      
      .btn-clean:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
      
      .btn-clean i {
        font-size: 16px;
      }
      
      /* Estilos para o modal de confirmação */
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s;
      }
      
      .modal-content {
        background-color: var(--background);
        margin: 15% auto;
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 5px 15px var(--shadow);
        width: 90%;
        max-width: 500px;
        animation: slideDown 0.3s;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--surface);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom: 1px solid var(--border);
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .modal-header h2 i {
        color: var(--danger);
      }
      
      .modal-body {
        padding: 20px;
        color: var(--text);
      }
      
      .modal-footer {
        padding: 15px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid var(--border);
        background-color: var(--surface);
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
      
      .close {
        color: var(--text-secondary);
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .close:hover {
        color: var(--text);
      }
      
      .warning-text {
        color: var(--danger);
        font-weight: 500;
      }
      
      .btn-secondary {
        background-color: var(--secondary);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .btn-danger {
        background-color: var(--danger);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .btn-secondary:hover {
        background-color: #475569; /* Tonalidade mais escura de cinza */
      }
      
      .btn-danger:hover {
        background-color: #dc2626; /* Tonalidade mais escura de vermelho */
      }
      
      .btn-secondary:focus,
      .btn-danger:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
      
      /* Estilos para o header da tabela */
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .table-header h2 {
        margin: 0;
      }
      
      /* Animações para o modal */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideDown {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      /* Estilos para notificações */
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        z-index: 1001;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .notification.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .notification.success {
        background-color: var(--success);
      }
      
      .notification.error {
        background-color: var(--danger);
      }
      
      .notification.info {
        background-color: var(--primary);
      }
      
      /* Ajustes para modo escuro */
      :root.dark-mode .modal-content {
        background-color: var(--surface);
      }
      
      :root.dark-mode .modal-header,
      :root.dark-mode .modal-footer {
        background-color: var(--surface-light);
      }
      
      /* Ajustes responsivos */
      @media (max-width: 768px) {
        .table-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .clean-table-container {
          width: 100%;
          justify-content: flex-start;
        }
        
        .btn-clean {
          width: 100%;
          justify-content: center;
        }
        
        .modal-content {
          width: 95%;
          margin: 10% auto;
        }
      }
    `
    document.head.appendChild(style)
  }
}

// Inicializar os elementos quando o módulo for carregado
document.addEventListener('DOMContentLoaded', ensureElementsExist)
