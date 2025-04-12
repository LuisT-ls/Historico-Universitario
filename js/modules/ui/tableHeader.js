// js/modules/ui/tableHeader.js

/**
 * Módulo responsável por configurar o cabeçalho da tabela de disciplinas,
 * integrando os botões de exportação e limpeza do histórico em um layout unificado
 */

import { setupExportButton } from './export.js'
import { setupCleanTableButton } from './cleanTable.js'

/**
 * Configura o cabeçalho da tabela com os botões de ação
 */
export function setupTableHeader() {
  // Seleciona os elementos existentes
  const tableContainer = document.querySelector('.table-container')

  // Verifica se o container existe
  if (!tableContainer) {
    console.error('Container da tabela não encontrado')
    return
  }

  // Seleciona o cabeçalho existente
  const existingHeader = tableContainer.querySelector('.table-header')

  // Remove o cabeçalho existente se houver
  if (existingHeader) {
    existingHeader.remove()
  }

  // Cria o novo cabeçalho unificado
  const tableHeader = document.createElement('div')
  tableHeader.className = 'table-header'

  // Adiciona o título
  const headerTitle = document.createElement('h2')
  headerTitle.innerHTML = '<i class="fas fa-list-alt"></i> Disciplinas Cursadas'
  tableHeader.appendChild(headerTitle)

  // Cria o container para os botões
  const actionsContainer = document.createElement('div')
  actionsContainer.className = 'table-actions'

  // Cria o botão de exportar e seu menu
  const exportContainer = document.createElement('div')
  exportContainer.className = 'export-container'

  const exportButton = document.createElement('button')
  exportButton.className = 'action-button export-button'
  exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar'
  exportContainer.appendChild(exportButton)

  // Cria o menu dropdown para exportação
  const exportMenu = document.createElement('div')
  exportMenu.className = 'export-menu'

  // Adiciona opções de exportação
  const formats = [
    { id: 'pdf', icon: 'fa-file-pdf', text: 'PDF' },
    { id: 'txt', icon: 'fa-file-alt', text: 'TXT' },
    { id: 'docx', icon: 'fa-file-csv', text: 'CSV/Excel' }
  ]

  formats.forEach(format => {
    const option = document.createElement('button')
    option.className = 'export-option'
    option.dataset.format = format.id
    option.innerHTML = `<i class="fas ${format.icon}"></i> ${format.text}`
    exportMenu.appendChild(option)
  })

  exportContainer.appendChild(exportMenu)
  actionsContainer.appendChild(exportContainer)

  // Cria o botão de limpar tabela
  const cleanButton = document.createElement('button')
  cleanButton.id = 'limparTabelaBtn'
  cleanButton.className = 'action-button clean-button'
  cleanButton.type = 'button'
  cleanButton.innerHTML = '<i class="fas fa-trash-alt"></i> Limpar'
  actionsContainer.appendChild(cleanButton)

  // Adiciona o container de ações ao cabeçalho
  tableHeader.appendChild(actionsContainer)

  // Insere o cabeçalho no início do container da tabela
  tableContainer.insertBefore(tableHeader, tableContainer.firstChild)

  // Configura os eventos e comportamentos dos botões
  setupExportButtonEvents(exportButton, exportMenu, formats)

  // Chama a função existente para configurar o botão de limpeza e o modal
  setupCleanTableButton()
}

/**
 * Configura os eventos para o botão de exportação
 */
function setupExportButtonEvents(exportButton, exportMenu, formats) {
  // Mostra/esconde o menu quando clicar no botão
  exportButton.addEventListener('click', () => {
    exportMenu.classList.toggle('show')
  })

  // Fecha o menu quando clicar fora dele
  document.addEventListener('click', event => {
    if (
      !exportButton.contains(event.target) &&
      !exportMenu.contains(event.target)
    ) {
      exportMenu.classList.remove('show')
    }
  })

  // Configura os eventos das opções de exportação
  formats.forEach(format => {
    const option = exportMenu.querySelector(`[data-format="${format.id}"]`)
    if (option) {
      option.addEventListener('click', () => {
        // Chama a função correspondente do módulo de exportação
        const app = window.app.__appInstance
        if (app && app.exportar) {
          app.exportar(format.id)
        } else {
          console.error(`Função de exportação para ${format.id} não disponível`)
          mostrarNotificacao(
            `Não foi possível exportar para ${format.text}`,
            'error'
          )
        }

        // Fecha o menu após clicar
        exportMenu.classList.remove('show')
      })
    }
  })
}

/**
 * Mostra uma notificação temporária na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação: 'success', 'error' ou 'info'
 */
function mostrarNotificacao(message, type = 'success') {
  // Verifica se já existe uma notificação e remove
  const existingNotification = document.querySelector('.export-notification')
  if (existingNotification) {
    existingNotification.remove()
  }

  // Cria o elemento de notificação
  const notification = document.createElement('div')
  notification.className = `export-notification ${type}`
  notification.textContent = message

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
