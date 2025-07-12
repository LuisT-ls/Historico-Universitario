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

      console.log('Iniciando sincronização de dados...')

      // Limpar dados inválidos primeiro
      dataService.cleanInvalidLocalData()

      // Verificar dados locais primeiro
      const localSyncResult = await dataService.checkAndSyncLocalData()
      if (localSyncResult.success && localSyncResult.hasLocalData) {
        console.log(
          `Sincronizadas ${localSyncResult.totalDisciplines} disciplinas do localStorage para o Firestore`
        )
      }

      // Sincronizar dados do Firestore para localStorage
      const firestoreSyncResult =
        await dataService.syncLocalStorageWithFirestore()
      if (firestoreSyncResult.success) {
        console.log('Dados do Firestore sincronizados com localStorage')
      }

      this.isInitialized = true
      console.log('Sincronização concluída com sucesso')
    } catch (error) {
      console.error('Erro durante sincronização:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Sincronizar dados quando uma disciplina é adicionada
  async syncAfterDisciplineAdded(disciplineData) {
    try {
      if (!dataService.currentUser) {
        return
      }

      // Adicionar disciplina ao Firestore
      const result = await dataService.addDiscipline(disciplineData)
      if (result.success) {
        console.log('Disciplina adicionada ao Firestore com sucesso')

        // Sincronizar dados do Firestore para localStorage
        await dataService.syncLocalStorageWithFirestore()
      }
    } catch (error) {
      console.error('Erro ao sincronizar disciplina:', error)
    }
  }

  // Sincronizar dados quando uma disciplina é removida
  async syncAfterDisciplineRemoved(disciplineId) {
    try {
      if (!dataService.currentUser) {
        return
      }

      // Remover disciplina do Firestore
      const result = await dataService.deleteDiscipline(disciplineId)
      if (result.success) {
        console.log('Disciplina removida do Firestore com sucesso')

        // Sincronizar dados do Firestore para localStorage
        await dataService.syncLocalStorageWithFirestore()
      }
    } catch (error) {
      console.error('Erro ao sincronizar remoção de disciplina:', error)
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
 