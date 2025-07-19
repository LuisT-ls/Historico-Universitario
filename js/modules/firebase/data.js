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

  // Excluir disciplina (versão otimizada)
  async deleteDisciplineOptimized(disciplineId) {
    try {
      this.checkAuth()

      const disciplineRef = doc(db, 'disciplines', disciplineId)

      // Verificar se a disciplina existe antes de tentar deletar
      const disciplineDoc = await getDoc(disciplineRef)

      if (!disciplineDoc.exists()) {
        return { success: false, error: 'Disciplina não encontrada' }
      }

      if (disciplineDoc.data().userId !== this.currentUser.uid) {
        return { success: false, error: 'Acesso negado' }
      }

      // Deletar a disciplina
      await deleteDoc(disciplineRef)

      console.log(`Disciplina ${disciplineId} removida com sucesso`)
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

      // Primeiro, tentar com ordenação (se o índice existir)
      try {
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

        console.log(`${disciplines.length} disciplinas carregadas do Firestore`)
        return { success: true, data: disciplines }
      } catch (indexError) {
        // Se o índice não existir, buscar sem ordenação
        console.log('Índice não encontrado, buscando sem ordenação...')

        const q = query(
          collection(db, 'disciplines'),
          where('userId', '==', this.currentUser.uid)
        )

        const querySnapshot = await getDocs(q)
        const disciplines = []

        querySnapshot.forEach(doc => {
          disciplines.push({
            id: doc.id,
            ...doc.data()
          })
        })

        // Ordenar no cliente
        disciplines.sort((a, b) => {
          const dateA =
            a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0)
          const dateB =
            b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0)
          return dateB - dateA
        })

        console.log(`${disciplines.length} disciplinas carregadas do Firestore`)
        return { success: true, data: disciplines }
      }
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      return { success: false, error: error.message }
    }
  }

  // Buscar disciplina específica por código e curso (otimizado)
  async findDisciplineByCode(codigo, curso) {
    try {
      this.checkAuth()

      const q = query(
        collection(db, 'disciplines'),
        where('userId', '==', this.currentUser.uid),
        where('codigo', '==', codigo),
        where('curso', '==', curso)
      )

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          success: true,
          data: { id: doc.id, ...doc.data() }
        }
      } else {
        return { success: false, error: 'Disciplina não encontrada' }
      }
    } catch (error) {
      console.error('Erro ao buscar disciplina:', error)
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
  calculateSummary(disciplines, cursoAtual = null) {
    // Se cursoAtual for fornecido, filtrar disciplinas desse curso
    let filtered = Array.isArray(disciplines) ? disciplines : []
    if (cursoAtual) {
      filtered = filtered.filter(d => d.curso === cursoAtual)
    }

    // Concluídas: AP (Aprovada) ou RR (Reprovada)
    const completedDisciplines = filtered.filter(
      d => d.resultado === 'AP' || d.resultado === 'RR'
    )
    // Em andamento: EC (Em Curso) ou emcurso === true
    const inProgressDisciplines = filtered.filter(
      d => d.resultado === 'EC' || d.emcurso === true
    )
    // Trancadas: TR
    const trancadas = filtered.filter(d => d.resultado === 'TR')
    // Dispensadas
    const dispensadas = filtered.filter(d => d.dispensada === true)

    // Total de disciplinas cadastradas (todas)
    const totalDisciplines = filtered.length
    // Total de concluídas
    const totalCompleted = completedDisciplines.length
    // Total em andamento
    const totalInProgress = inProgressDisciplines.length
    // Total trancadas
    const totalTrancadas = trancadas.length
    // Total dispensadas
    const totalDispensadas = dispensadas.length

    // Total de créditos e horas (apenas concluídas)
    const totalCredits = completedDisciplines.reduce(
      (sum, d) => sum + (d.creditos || d.credits || 0),
      0
    )
    const totalHours = completedDisciplines.reduce(
      (sum, d) => sum + (d.ch || d.horas || d.hours || 0),
      0
    )

    // Média geral: apenas disciplinas concluídas, com nota válida, não dispensadas, não trancadas, não AC
    const disciplinasParaMedia = completedDisciplines.filter(
      d =>
        d.nota !== null &&
        d.nota !== undefined &&
        !d.dispensada &&
        d.natureza !== 'AC' &&
        d.resultado !== 'TR'
    )
    const averageGrade =
      disciplinasParaMedia.length > 0
        ? disciplinasParaMedia.reduce((sum, d) => sum + parseFloat(d.nota), 0) /
          disciplinasParaMedia.length
        : 0

    // Porcentagem de progresso
    const progressPercentage =
      totalDisciplines > 0 ? (totalCompleted / totalDisciplines) * 100 : 0

    return {
      totalDisciplines,
      completedDisciplines: totalCompleted,
      inProgressDisciplines: totalInProgress,
      trancadas: totalTrancadas,
      dispensadas: totalDispensadas,
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

  // Sincronizar dados do localStorage com Firestore (versão otimizada)
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

        // Verificar se há dados locais que indicam remoções
        const courses = ['BICTI', 'BCC', 'BSI', 'BEC']
        let hasLocalRemovals = false

        for (const curso of courses) {
          const localDisciplines = localStorage.getItem(`disciplinas_${curso}`)
          if (localDisciplines) {
            try {
              const localDisciplinesArray = JSON.parse(localDisciplines)
              if (Array.isArray(localDisciplinesArray)) {
                // Se há dados locais, verificar se há menos disciplinas que no Firestore
                const firestoreDisciplinesForCourse = validDisciplines.filter(
                  d => d.curso === curso
                )

                if (
                  localDisciplinesArray.length <
                  firestoreDisciplinesForCourse.length
                ) {
                  hasLocalRemovals = true
                  console.log(`Detectadas remoções locais no curso ${curso}`)
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

        // Se há remoções locais, não sobrescrever com dados do Firestore
        if (hasLocalRemovals) {
          console.log('Remoções locais detectadas, mantendo dados locais')
          return { success: true, data: null, localRemovals: true }
        }

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

  // Limpar dados duplicados do Firestore
  async cleanDuplicateDisciplines() {
    try {
      this.checkAuth()

      console.log('Iniciando limpeza de disciplinas duplicadas...')

      // Buscar todas as disciplinas do usuário
      const disciplinesResult = await this.getUserDisciplines()
      if (!disciplinesResult.success) {
        return { success: false, error: 'Erro ao buscar disciplinas' }
      }

      const disciplines = disciplinesResult.data
      const seen = new Set()
      const duplicates = []

      // Identificar duplicatas
      disciplines.forEach(discipline => {
        const key = `${discipline.codigo}_${discipline.curso}_${discipline.periodo}`

        if (seen.has(key)) {
          duplicates.push(discipline)
        } else {
          seen.add(key)
        }
      })

      if (duplicates.length === 0) {
        console.log('Nenhuma disciplina duplicada encontrada')
        return { success: true, removed: 0 }
      }

      console.log(`Encontradas ${duplicates.length} disciplinas duplicadas`)

      // Remover duplicatas
      for (const duplicate of duplicates) {
        try {
          await this.deleteDisciplineOptimized(duplicate.id)
          console.log(`Disciplina duplicada removida: ${duplicate.codigo}`)
        } catch (error) {
          console.error(
            `Erro ao remover disciplina duplicada ${duplicate.codigo}:`,
            error
          )
        }
      }

      console.log(
        `Limpeza concluída: ${duplicates.length} disciplinas removidas`
      )
      return { success: true, removed: duplicates.length }
    } catch (error) {
      console.error('Erro ao limpar disciplinas duplicadas:', error)
      return { success: false, error: error.message }
    }
  }

  // Verificar e corrigir dados inconsistentes
  async validateAndFixData() {
    try {
      this.checkAuth()

      console.log('Validando e corrigindo dados...')

      // Buscar disciplinas
      const disciplinesResult = await this.getUserDisciplines()
      if (!disciplinesResult.success) {
        return { success: false, error: 'Erro ao buscar disciplinas' }
      }

      const disciplines = disciplinesResult.data
      let fixedCount = 0

      // Verificar e corrigir cada disciplina
      for (const discipline of disciplines) {
        let needsUpdate = false
        const updates = {}

        // Verificar campos obrigatórios
        if (!discipline.codigo || discipline.codigo.trim() === '') {
          console.log(`Disciplina sem código encontrada: ${discipline.id}`)
          continue
        }

        if (!discipline.nome || discipline.nome.trim() === '') {
          console.log(`Disciplina sem nome encontrada: ${discipline.id}`)
          continue
        }

        // Verificar e corrigir nota
        if (discipline.natureza === 'AC' && discipline.nota !== null) {
          updates.nota = null
          needsUpdate = true
        }

        // Verificar e corrigir resultado
        if (discipline.trancamento && discipline.resultado !== 'TR') {
          updates.resultado = 'TR'
          needsUpdate = true
        }

        if (discipline.dispensada && discipline.resultado !== 'AP') {
          updates.resultado = 'AP'
          needsUpdate = true
        }

        // Atualizar se necessário
        if (needsUpdate) {
          try {
            await this.updateDiscipline(discipline.id, updates)
            fixedCount++
            console.log(`Disciplina corrigida: ${discipline.codigo}`)
          } catch (error) {
            console.error(
              `Erro ao corrigir disciplina ${discipline.codigo}:`,
              error
            )
          }
        }
      }

      console.log(`Validação concluída: ${fixedCount} disciplinas corrigidas`)
      return { success: true, fixed: fixedCount }
    } catch (error) {
      console.error('Erro na validação de dados:', error)
      return { success: false, error: error.message }
    }
  }

  // Excluir todos os dados do usuário no Firestore
  async deleteUserAccount() {
    try {
      this.checkAuth()
      const uid = this.currentUser.uid
      // Coleções e documentos a serem removidos
      const batchDeletes = []
      // 1. Disciplinas
      const disciplinasSnap = await getDocs(
        query(collection(db, 'disciplines'), where('userId', '==', uid))
      )
      disciplinasSnap.forEach(docRef => {
        batchDeletes.push(deleteDoc(doc(db, 'disciplines', docRef.id)))
      })
      // 2. Histórico acadêmico
      batchDeletes.push(deleteDoc(doc(db, 'academicHistory', uid)))
      // 3. Requisitos de formatura
      batchDeletes.push(deleteDoc(doc(db, 'graduationRequirements', uid)))
      // 4. Resumo
      batchDeletes.push(deleteDoc(doc(db, 'summaries', uid)))
      // 5. Backup
      batchDeletes.push(deleteDoc(doc(db, 'backups', uid)))
      // 6. Perfil do usuário
      batchDeletes.push(deleteDoc(doc(db, 'users', uid)))
      // Executar todas as deleções
      await Promise.all(batchDeletes)
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir dados do usuário:', error)
      return { success: false, error: error.message }
    }
  }
}

// Instância global do serviço de dados
const dataService = new DataService()

export default dataService
