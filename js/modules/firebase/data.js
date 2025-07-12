import { db } from './config.js'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'

class DataService {
  constructor() {
    this.currentUser = null
  }

  // Definir usuário atual
  setCurrentUser(user) {
    this.currentUser = user
  }

  // Verificar se há usuário logado
  checkAuth() {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado')
    }
  }

  // ===== DISCIPLINAS =====

  // Adicionar disciplina
  async addDiscipline(disciplineData) {
    try {
      this.checkAuth()

      const discipline = {
        ...disciplineData,
        userId: this.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'disciplines'), discipline)
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error)
      return { success: false, error: error.message }
    }
  }

  // Atualizar disciplina
  async updateDiscipline(disciplineId, disciplineData) {
    try {
      this.checkAuth()

      const disciplineRef = doc(db, 'disciplines', disciplineId)
      const disciplineDoc = await getDoc(disciplineRef)

      if (!disciplineDoc.exists()) {
        return { success: false, error: 'Disciplina não encontrada' }
      }

      if (disciplineDoc.data().userId !== this.currentUser.uid) {
        return { success: false, error: 'Acesso negado' }
      }

      await updateDoc(disciplineRef, {
        ...disciplineData,
        updatedAt: new Date()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error)
      return { success: false, error: error.message }
    }
  }

  // Excluir disciplina
  async deleteDiscipline(disciplineId) {
    try {
      this.checkAuth()

      const disciplineRef = doc(db, 'disciplines', disciplineId)
      const disciplineDoc = await getDoc(disciplineRef)

      if (!disciplineDoc.exists()) {
        return { success: false, error: 'Disciplina não encontrada' }
      }

      if (disciplineDoc.data().userId !== this.currentUser.uid) {
        return { success: false, error: 'Acesso negado' }
      }

      await deleteDoc(disciplineRef)
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error)
      return { success: false, error: error.message }
    }
  }

  // Buscar disciplinas do usuário
  async getUserDisciplines() {
    try {
      this.checkAuth()

      const q = query(
        collection(db, 'disciplines'),
        where('userId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const disciplines = []

      querySnapshot.forEach(doc => {
        disciplines.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return { success: true, data: disciplines }
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      return { success: false, error: error.message }
    }
  }

  // ===== HISTÓRICO ACADÊMICO =====

  // Salvar histórico acadêmico
  async saveAcademicHistory(historyData) {
    try {
      this.checkAuth()

      const history = {
        ...historyData,
        userId: this.currentUser.uid,
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'academicHistory', this.currentUser.uid), history)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar histórico:', error)
      return { success: false, error: error.message }
    }
  }

  // Carregar histórico acadêmico
  async loadAcademicHistory() {
    try {
      this.checkAuth()

      const historyDoc = await getDoc(
        doc(db, 'academicHistory', this.currentUser.uid)
      )

      if (historyDoc.exists()) {
        return { success: true, data: historyDoc.data() }
      } else {
        return { success: true, data: null }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      return { success: false, error: error.message }
    }
  }

  // ===== REQUISITOS DE FORMATURA =====

  // Salvar requisitos de formatura
  async saveGraduationRequirements(requirementsData) {
    try {
      this.checkAuth()

      const requirements = {
        ...requirementsData,
        userId: this.currentUser.uid,
        updatedAt: new Date()
      }

      await setDoc(
        doc(db, 'graduationRequirements', this.currentUser.uid),
        requirements
      )
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar requisitos:', error)
      return { success: false, error: error.message }
    }
  }

  // Carregar requisitos de formatura
  async loadGraduationRequirements() {
    try {
      this.checkAuth()

      const requirementsDoc = await getDoc(
        doc(db, 'graduationRequirements', this.currentUser.uid)
      )

      if (requirementsDoc.exists()) {
        return { success: true, data: requirementsDoc.data() }
      } else {
        return { success: true, data: null }
      }
    } catch (error) {
      console.error('Erro ao carregar requisitos:', error)
      return { success: false, error: error.message }
    }
  }

  // ===== RESUMO GERAL =====

  // Calcular e salvar resumo geral
  async calculateAndSaveSummary() {
    try {
      this.checkAuth()

      // Buscar disciplinas
      const disciplinesResult = await this.getUserDisciplines()
      if (!disciplinesResult.success) {
        return disciplinesResult
      }

      const disciplines = disciplinesResult.data

      // Calcular estatísticas
      const summary = this.calculateSummary(disciplines)

      // Salvar resumo
      await setDoc(doc(db, 'summaries', this.currentUser.uid), {
        ...summary,
        userId: this.currentUser.uid,
        updatedAt: new Date()
      })

      return { success: true, data: summary }
    } catch (error) {
      console.error('Erro ao calcular resumo:', error)
      return { success: false, error: error.message }
    }
  }

  // Carregar resumo geral
  async loadSummary() {
    try {
      this.checkAuth()

      const summaryDoc = await getDoc(
        doc(db, 'summaries', this.currentUser.uid)
      )

      if (summaryDoc.exists()) {
        return { success: true, data: summaryDoc.data() }
      } else {
        return { success: true, data: null }
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
      return { success: false, error: error.message }
    }
  }

  // Calcular estatísticas do resumo
  calculateSummary(disciplines) {
    const totalDisciplines = disciplines.length
    const completedDisciplines = disciplines.filter(
      d => d.status === 'completed'
    ).length
    const inProgressDisciplines = disciplines.filter(
      d => d.status === 'in_progress'
    ).length
    const pendingDisciplines = disciplines.filter(
      d => d.status === 'pending'
    ).length

    const totalCredits = disciplines.reduce(
      (sum, d) => sum + (d.credits || 0),
      0
    )
    const totalHours = disciplines.reduce((sum, d) => sum + (d.hours || 0), 0)

    const grades = disciplines
      .filter(d => d.grade && d.status === 'completed')
      .map(d => parseFloat(d.grade))

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length
        : 0

    const progressPercentage =
      totalDisciplines > 0 ? (completedDisciplines / totalDisciplines) * 100 : 0

    return {
      totalDisciplines,
      completedDisciplines,
      inProgressDisciplines,
      pendingDisciplines,
      totalCredits,
      totalHours,
      averageGrade: Math.round(averageGrade * 100) / 100,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      lastUpdated: new Date()
    }
  }

  // ===== BACKUP E SINCRONIZAÇÃO =====

  // Fazer backup completo dos dados
  async backupUserData() {
    try {
      this.checkAuth()

      const [disciplines, history, requirements, summary] = await Promise.all([
        this.getUserDisciplines(),
        this.loadAcademicHistory(),
        this.loadGraduationRequirements(),
        this.loadSummary()
      ])

      const backup = {
        userId: this.currentUser.uid,
        timestamp: new Date(),
        disciplines: disciplines.success ? disciplines.data : [],
        academicHistory: history.success ? history.data : null,
        graduationRequirements: requirements.success ? requirements.data : null,
        summary: summary.success ? summary.data : null
      }

      await setDoc(doc(db, 'backups', this.currentUser.uid), backup)
      return { success: true, data: backup }
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
      return { success: false, error: error.message }
    }
  }

  // Restaurar dados do backup
  async restoreUserData() {
    try {
      this.checkAuth()

      const backupDoc = await getDoc(doc(db, 'backups', this.currentUser.uid))

      if (!backupDoc.exists()) {
        return { success: false, error: 'Backup não encontrado' }
      }

      const backup = backupDoc.data()

      // Restaurar dados
      if (backup.disciplines && backup.disciplines.length > 0) {
        for (const discipline of backup.disciplines) {
          const { id, ...disciplineData } = discipline
          await addDoc(collection(db, 'disciplines'), {
            ...disciplineData,
            userId: this.currentUser.uid
          })
        }
      }

      if (backup.academicHistory) {
        await this.saveAcademicHistory(backup.academicHistory)
      }

      if (backup.graduationRequirements) {
        await this.saveGraduationRequirements(backup.graduationRequirements)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao restaurar dados:', error)
      return { success: false, error: error.message }
    }
  }

  // Sincronizar dados do localStorage com Firestore
  async syncLocalStorageWithFirestore() {
    try {
      this.checkAuth()

      // Buscar disciplinas do Firestore
      const disciplinesResult = await this.getUserDisciplines()
      if (disciplinesResult.success) {
        const firestoreDisciplines = disciplinesResult.data

        // Filtrar apenas disciplinas válidas (com código e nome)
        const validDisciplines = firestoreDisciplines.filter(
          discipline =>
            discipline.codigo &&
            discipline.nome &&
            discipline.codigo.trim() !== '' &&
            discipline.nome.trim() !== ''
        )

        // Agrupar disciplinas por curso
        const disciplinesByCourse = {}
        validDisciplines.forEach(discipline => {
          const curso = discipline.curso || 'BICTI' // Default
          if (!disciplinesByCourse[curso]) {
            disciplinesByCourse[curso] = []
          }
          disciplinesByCourse[curso].push(discipline)
        })

        // Salvar no localStorage para cada curso
        Object.keys(disciplinesByCourse).forEach(curso => {
          const disciplinas = disciplinesByCourse[curso]
          localStorage.setItem(
            `disciplinas_${curso}`,
            JSON.stringify(disciplinas)
          )
          console.log(
            `Sincronizadas ${disciplinas.length} disciplinas válidas para o curso ${curso}`
          )
        })

        return { success: true, data: disciplinesByCourse }
      } else {
        return { success: false, error: disciplinesResult.error }
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error)
      return { success: false, error: error.message }
    }
  }

  // Sincronizar dados do localStorage para Firestore
  async syncLocalStorageToFirestore() {
    try {
      this.checkAuth()

      const courses = ['BICTI', 'BCC', 'BSI', 'BEC'] // Cursos disponíveis
      let totalDisciplines = 0

      for (const curso of courses) {
        const localDisciplines = localStorage.getItem(`disciplinas_${curso}`)
        if (localDisciplines) {
          try {
            const disciplines = JSON.parse(localDisciplines)
            if (Array.isArray(disciplines) && disciplines.length > 0) {
              // Filtrar apenas disciplinas válidas
              const validDisciplines = disciplines.filter(
                discipline =>
                  discipline.codigo &&
                  discipline.nome &&
                  discipline.codigo.trim() !== '' &&
                  discipline.nome.trim() !== ''
              )

              // Verificar disciplinas existentes no Firestore para evitar duplicações
              const existingDisciplines = await this.getUserDisciplines()
              const existingCodes = existingDisciplines.success
                ? existingDisciplines.data.map(d => d.codigo).filter(c => c)
                : []

              // Adicionar apenas disciplinas que não existem
              for (const discipline of validDisciplines) {
                if (!existingCodes.includes(discipline.codigo)) {
                  const disciplineData = {
                    ...discipline,
                    curso: curso,
                    userId: this.currentUser.uid,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }

                  // Remover campos que não devem ser salvos no Firestore
                  delete disciplineData.id

                  await this.addDiscipline(disciplineData)
                  totalDisciplines++
                }
              }

              // Limpar localStorage após sincronização
              localStorage.removeItem(`disciplinas_${curso}`)
              console.log(
                `Sincronizadas ${totalDisciplines} disciplinas válidas do curso ${curso}`
              )
            }
          } catch (error) {
            console.error(
              `Erro ao processar disciplinas do curso ${curso}:`,
              error
            )
          }
        }
      }

      return { success: true, totalDisciplines }
    } catch (error) {
      console.error('Erro ao sincronizar localStorage para Firestore:', error)
      return { success: false, error: error.message }
    }
  }

  // Verificar se há dados no localStorage que precisam ser sincronizados
  async checkAndSyncLocalData() {
    try {
      this.checkAuth()

      const courses = ['BICTI', 'BCC', 'BSI', 'BEC']
      let hasLocalData = false

      for (const curso of courses) {
        const localDisciplines = localStorage.getItem(`disciplinas_${curso}`)
        if (localDisciplines) {
          try {
            const disciplines = JSON.parse(localDisciplines)
            if (Array.isArray(disciplines) && disciplines.length > 0) {
              // Verificar se há pelo menos uma disciplina válida
              const hasValidDiscipline = disciplines.some(
                discipline =>
                  discipline.codigo &&
                  discipline.nome &&
                  discipline.codigo.trim() !== '' &&
                  discipline.nome.trim() !== ''
              )

              if (hasValidDiscipline) {
                hasLocalData = true
                break
              }
            }
          } catch (error) {
            console.error(
              `Erro ao verificar dados locais do curso ${curso}:`,
              error
            )
          }
        }
      }

      if (hasLocalData) {
        console.log('Dados locais encontrados, iniciando sincronização...')
        return await this.syncLocalStorageToFirestore()
      }

      return { success: true, hasLocalData: false }
    } catch (error) {
      console.error('Erro ao verificar dados locais:', error)
      return { success: false, error: error.message }
    }
  }

  // Limpar dados inválidos do localStorage
  cleanInvalidLocalData() {
    try {
      const courses = ['BICTI', 'BCC', 'BSI', 'BEC']

      for (const curso of courses) {
        const localDisciplines = localStorage.getItem(`disciplinas_${curso}`)
        if (localDisciplines) {
          try {
            const disciplines = JSON.parse(localDisciplines)
            if (Array.isArray(disciplines)) {
              // Filtrar apenas disciplinas válidas
              const validDisciplines = disciplines.filter(
                discipline =>
                  discipline.codigo &&
                  discipline.nome &&
                  discipline.codigo.trim() !== '' &&
                  discipline.nome.trim() !== ''
              )

              // Salvar apenas disciplinas válidas de volta no localStorage
              if (validDisciplines.length !== disciplines.length) {
                localStorage.setItem(
                  `disciplinas_${curso}`,
                  JSON.stringify(validDisciplines)
                )
                console.log(
                  `Limpeza: ${
                    disciplines.length - validDisciplines.length
                  } disciplinas inválidas removidas do curso ${curso}`
                )
              }
            }
          } catch (error) {
            console.error(
              `Erro ao limpar dados inválidos do curso ${curso}:`,
              error
            )
            // Se houver erro, remover dados corrompidos
            localStorage.removeItem(`disciplinas_${curso}`)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar dados inválidos:', error)
    }
  }
}

// Instância global do serviço de dados
const dataService = new DataService()

export default dataService
