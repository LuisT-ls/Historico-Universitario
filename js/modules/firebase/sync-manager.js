// Gerenciador de Sincronização - Não interfere com sistema existente
import dataService from './data.js'

class SyncManager {
  constructor() {
    this.isInitialized = false
    this.syncInProgress = false
  }

  // Inicializar sincronização apenas quando necessário
  async initializeSync() {
    if (this.isInitialized || this.syncInProgress) {
      return
    }

    this.syncInProgress = true

    try {
      // Verificar se há usuário autenticado
      if (!dataService.currentUser) {
        console.log('Usuário não autenticado, pulando sincronização')
        return
      }

      console.log('Iniciando carregamento de dados do Firestore...')

      // Carregar todas as disciplinas do Firestore para localStorage
      const loadResult = await dataService.loadAllDisciplinesToLocalStorage()
      if (loadResult.success) {
        console.log(
          'Dados do Firestore carregados para localStorage com sucesso'
        )
      } else {
        console.error('Erro ao carregar dados do Firestore:', loadResult.error)
      }

      this.isInitialized = true
      console.log('Carregamento concluído com sucesso')
    } catch (error) {
      console.error('Erro durante sincronização:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Adicionar disciplina ao Firestore
  async syncAfterDisciplineAdded(disciplineData) {
    try {
      if (!dataService.currentUser) {
        return
      }

      // Adicionar disciplina ao Firestore (já atualiza localStorage automaticamente)
      const result = await dataService.addDiscipline(disciplineData)
      if (result.success) {
        console.log('Disciplina adicionada ao Firestore com sucesso')
      }
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error)
    }
  }

  // Remover disciplina do Firestore
  async syncAfterDisciplineRemoved(disciplineId) {
    try {
      if (!dataService.currentUser) {
        return
      }

      // Remover disciplina do Firestore (já atualiza localStorage automaticamente)
      const result = await dataService.deleteDiscipline(disciplineId)
      if (result.success) {
        console.log('Disciplina removida do Firestore com sucesso')
      }
    } catch (error) {
      console.error('Erro ao remover disciplina:', error)
    }
  }

  // Verificar se há dados para sincronizar
  async checkForSync() {
    if (!dataService.currentUser) {
      return false
    }

    try {
      const courses = ['BICTI', 'BCC', 'BSI', 'BEC']
      for (const curso of courses) {
        const localDisciplines = localStorage.getItem(`disciplinas_${curso}`)
        if (localDisciplines) {
          try {
            const disciplines = JSON.parse(localDisciplines)
            if (Array.isArray(disciplines) && disciplines.length > 0) {
              return true
            }
          } catch (error) {
            console.error(
              `Erro ao verificar dados locais do curso ${curso}:`,
              error
            )
          }
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar dados para sincronização:', error)
      return false
    }
  }
}

// Instância global do gerenciador de sincronização
const syncManager = new SyncManager()

// Função para inicializar sincronização de forma não bloqueante
function initializeSyncNonBlocking() {
  setTimeout(() => {
    syncManager.initializeSync()
  }, 1000) // Aguardar 1 segundo para não interferir com o carregamento
}

// Função para sincronizar após adicionar disciplina
function syncAfterDisciplineAdded(disciplineData) {
  setTimeout(() => {
    syncManager.syncAfterDisciplineAdded(disciplineData)
  }, 500) // Aguardar 500ms para não bloquear a interface
}

// Função para sincronizar após remover disciplina
function syncAfterDisciplineRemoved(disciplineId) {
  setTimeout(() => {
    syncManager.syncAfterDisciplineRemoved(disciplineId)
  }, 500) // Aguardar 500ms para não bloquear a interface
}

export {
  syncManager,
  initializeSyncNonBlocking,
  syncAfterDisciplineAdded,
  syncAfterDisciplineRemoved
}
