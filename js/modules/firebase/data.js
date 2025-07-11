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
}

// Instância global do serviço de dados
const dataService = new DataService()

export default dataService
