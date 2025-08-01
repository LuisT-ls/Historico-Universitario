# Exemplos Práticos de Refatoração

## 1. Refatoração do app.js

### ❌ Problema Atual (app.js - 1010 linhas)

```javascript
// js/app.js - Arquivo monolítico
class App {
  constructor() {
    this.disciplinas = []
    this.cursoAtual = 'BICTI'
    this.lastSyncTime = null
    this.syncInterval = null
    this.removalsRegistry = new Set()
    // ... mais 50 linhas de inicialização
  }

  // 50+ métodos em uma única classe
  registrarRemocao(disciplinaRemovida) {
    /* 20 linhas */
  }
  foiRemovida(disciplina) {
    /* 10 linhas */
  }
  carregarRegistroRemocoes() {
    /* 15 linhas */
  }
  iniciarSincronizacaoAutomatica() {
    /* 25 linhas */
  }
  verificarSincronizacao() {
    /* 80 linhas */
  }
  setupCursoSelector() {
    /* 40 linhas */
  }
  // ... mais 40 métodos
}
```

### ✅ Solução Proposta

#### app.js (200 linhas - apenas orquestração)

```javascript
// js/app/app.js
import { AppStateManager } from './app-state-manager.js'
import { AppEventHandlers } from './app-event-handlers.js'
import { AppSyncManager } from './app-sync-manager.js'
import { AppConfig } from '../config/app-config.js'

export class App {
  constructor() {
    this.config = new AppConfig()
    this.stateManager = new AppStateManager()
    this.eventHandlers = new AppEventHandlers(this)
    this.syncManager = new AppSyncManager(this)

    this.init()
  }

  init() {
    this.stateManager.initialize()
    this.eventHandlers.setup()
    this.syncManager.startAutoSync()
    this.updateUI()
  }

  updateUI() {
    // Orquestração da atualização da UI
    this.stateManager.updateAllComponents()
  }
}
```

#### app-state-manager.js (gerenciamento de estado)

```javascript
// js/app/app-state-manager.js
import { DisciplineRepository } from '../modules/repositories/discipline-repository.js'
import { CourseManager } from '../modules/managers/course-manager.js'

export class AppStateManager {
  constructor() {
    this.disciplineRepo = new DisciplineRepository()
    this.courseManager = new CourseManager()
    this.removalsRegistry = new Set()
  }

  async loadCourseData(courseCode) {
    const disciplines = await this.disciplineRepo.getByCourse(courseCode)
    this.courseManager.setCurrentCourse(courseCode, disciplines)
    return disciplines
  }

  registerRemoval(discipline) {
    const key = this.createRemovalKey(discipline)
    this.removalsRegistry.add(key)
    this.persistRemoval(key)
  }

  wasRemoved(discipline) {
    const key = this.createRemovalKey(discipline)
    return this.removalsRegistry.has(key)
  }

  private createRemovalKey(discipline) {
    return `${discipline.codigo}_${this.courseManager.currentCourse}`
  }
}
```

## 2. Refatoração de Valores Mágicos

### ❌ Problema Atual

```javascript
// Valores mágicos espalhados pelo código
setInterval(() => {
  this.verificarSincronizacao()
}, 30000) // 30 segundos

localStorage.setItem('removalsRegistry', JSON.stringify(removals))

if (horasPorNatureza.OB > 680) {
  horasPorNatureza.OB = 680
}

const typingTimer = setTimeout(() => {
  performSearch(searchTerm)
}, 300) // 300ms
```

### ✅ Solução Proposta

#### app-config.js (configurações centralizadas)

```javascript
// js/config/app-config.js
export const AppConfig = {
  // Sincronização
  SYNC: {
    INTERVAL_MS: 30000,
    RETRY_ATTEMPTS: 3,
    TIMEOUT_MS: 10000
  },

  // Armazenamento
  STORAGE: {
    KEYS: {
      DISCIPLINES: 'disciplinas',
      REMOVALS: 'removalsRegistry',
      SETTINGS: 'userSettings',
      LAST_SYNC: 'lastSyncTime'
    },
    PREFIXES: {
      COURSE: 'disciplinas_'
    }
  },

  // Validações
  VALIDATION: {
    MAX_OB_HOURS: 680,
    MIN_SEARCH_LENGTH: 2,
    MAX_DISCIPLINES_PER_PERIOD: 10
  },

  // UI
  UI: {
    DEBOUNCE_DELAY_MS: 300,
    ANIMATION_DURATION_MS: 1500,
    NOTIFICATION_DURATION_MS: 3000
  },

  // Cursos
  COURSES: {
    DEFAULT: 'BICTI',
    SUPPORTED: ['BICTI', 'ENG_PROD', 'ENG_ELET']
  }
}
```

#### Uso das configurações

```javascript
// js/app/app-sync-manager.js
import { AppConfig } from '../config/app-config.js'

export class AppSyncManager {
  startAutoSync() {
    this.syncInterval = setInterval(() => {
      this.checkSync()
    }, AppConfig.SYNC.INTERVAL_MS)
  }

  async checkSync() {
    try {
      const result = await this.performSync()
      if (result.success) {
        this.updateLastSyncTime()
      }
    } catch (error) {
      this.handleSyncError(error)
    }
  }
}
```

## 3. Refatoração de Tratamento de Erros

### ❌ Problema Atual

```javascript
// Tratamento de erros disperso e inconsistente
try {
  const disciplines = await dataService.getUserDisciplines()
  // processar disciplinas
} catch (error) {
  console.error('Erro ao carregar disciplinas:', error)
  // cada lugar trata o erro de forma diferente
}

try {
  localStorage.setItem('disciplinas', JSON.stringify(data))
} catch (error) {
  console.error('Erro ao salvar:', error)
  // tratamento inconsistente
}
```

### ✅ Solução Proposta

#### error-handler.js (tratamento centralizado)

```javascript
// js/modules/utils/error-handler.js
import { NotificationService } from '../services/notification-service.js'

export class ErrorHandler {
  static handle(error, context, options = {}) {
    const errorInfo = this.analyzeError(error, context)

    // Log estruturado
    this.logError(errorInfo)

    // Notificação ao usuário
    if (options.showNotification !== false) {
      this.showUserFriendlyMessage(errorInfo)
    }

    // Métricas e monitoramento
    this.trackError(errorInfo)

    return errorInfo
  }

  static analyzeError(error, context) {
    return {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      type: this.categorizeError(error),
      severity: this.calculateSeverity(error, context)
    }
  }

  static categorizeError(error) {
    if (error.name === 'NetworkError') return 'NETWORK'
    if (error.name === 'QuotaExceededError') return 'STORAGE'
    if (error.name === 'ValidationError') return 'VALIDATION'
    return 'UNKNOWN'
  }

  static showUserFriendlyMessage(errorInfo) {
    const messages = {
      NETWORK: 'Erro de conexão. Verifique sua internet.',
      STORAGE: 'Erro de armazenamento. Tente novamente.',
      VALIDATION: 'Dados inválidos. Verifique as informações.',
      UNKNOWN: 'Ocorreu um erro inesperado. Tente novamente.'
    }

    NotificationService.show(
      messages[errorInfo.type] || messages.UNKNOWN,
      'error'
    )
  }
}
```

#### Uso do error handler

```javascript
// js/modules/repositories/discipline-repository.js
import { ErrorHandler } from '../utils/error-handler.js'

export class DisciplineRepository {
  async getByCourse(courseCode) {
    try {
      const data = localStorage.getItem(`disciplinas_${courseCode}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      ErrorHandler.handle(error, 'DisciplineRepository.getByCourse', {
        showNotification: true
      })
      return []
    }
  }

  async save(courseCode, disciplines) {
    try {
      localStorage.setItem(
        `disciplinas_${courseCode}`,
        JSON.stringify(disciplines)
      )
    } catch (error) {
      ErrorHandler.handle(error, 'DisciplineRepository.save', {
        showNotification: true
      })
      throw error
    }
  }
}
```

## 4. Refatoração de Funções Longas

### ❌ Problema Atual

```javascript
// js/modules/ui/resumo.js - Função de 100+ linhas
export function atualizarResumo(disciplinas) {
  // 50 linhas de cálculos complexos
  const disciplinasValidas = disciplinas.filter(
    d =>
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      !d.dispensada &&
      d.natureza !== 'AC'
  )

  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')

  // Mais 50 linhas de cálculos...

  // 30 linhas de renderização HTML
  document.getElementById('resumo').innerHTML = `
    <h2><i class="fas fa-chart-bar"></i> Resumo Geral</h2>
    <div class="resumo-container">
      // ... muito HTML inline
    </div>
  `
}
```

### ✅ Solução Proposta

#### academic-calculator.js (lógica de negócio)

```javascript
// js/modules/services/academic-calculator.js
export class AcademicCalculator {
  static calculateSummary(disciplines) {
    const validDisciplines = this.filterValidDisciplines(disciplines)
    const approvedDisciplines = this.filterApprovedDisciplines(disciplines)

    return {
      totalDisciplines: disciplines.length,
      validDisciplines: validDisciplines.length,
      approvedDisciplines: approvedDisciplines.length,
      averageGrade: this.calculateAverageGrade(validDisciplines),
      gradePointAverage: this.calculateGradePointAverage(validDisciplines),
      totalHours: this.calculateTotalHours(approvedDisciplines),
      approvalRate: this.calculateApprovalRate(
        validDisciplines,
        approvedDisciplines
      )
    }
  }

  static filterValidDisciplines(disciplines) {
    return disciplines.filter(
      d =>
        (d.resultado === 'AP' || d.resultado === 'RR') &&
        !d.dispensada &&
        d.natureza !== 'AC'
    )
  }

  static calculateAverageGrade(disciplines) {
    const validGrades = disciplines
      .filter(d => d.nota && d.nota > 0)
      .map(d => d.nota)

    if (validGrades.length === 0) return 0

    return (
      validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
    )
  }

  static calculateGradePointAverage(disciplines) {
    const totalCH = disciplines.reduce((sum, d) => sum + d.ch, 0)
    const totalPCH = disciplines.reduce((sum, d) => sum + d.ch * d.nota, 0)

    return totalCH > 0 ? totalPCH / totalCH : 0
  }
}
```

#### summary-renderer.js (renderização)

```javascript
// js/modules/ui/components/summary-renderer.js
import { AcademicCalculator } from '../../services/academic-calculator.js'

export class SummaryRenderer {
  static render(disciplines) {
    const summary = AcademicCalculator.calculateSummary(disciplines)
    const template = this.createTemplate(summary)

    document.getElementById('resumo').innerHTML = template
  }

  static createTemplate(summary) {
    return `
      <h2><i class="fas fa-chart-bar"></i> Resumo Geral</h2>
      <div class="resumo-container">
        ${this.createStatsCards(summary)}
        ${this.createProgressChart(summary)}
      </div>
    `
  }

  static createStatsCards(summary) {
    return `
      <div class="stats-cards">
        ${this.createStatCard(
          'Total de Disciplinas',
          summary.totalDisciplines,
          'book'
        )}
        ${this.createStatCard(
          'Média Geral',
          summary.averageGrade.toFixed(2),
          'calculator'
        )}
        ${this.createStatCard(
          'Coeficiente de Rendimento',
          summary.gradePointAverage.toFixed(2),
          'chart-line'
        )}
      </div>
    `
  }

  static createStatCard(title, value, icon) {
    return `
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="stat-content">
          <h3>${title}</h3>
          <p class="stat-value">${value}</p>
        </div>
      </div>
    `
  }
}
```

#### Uso refatorado

```javascript
// js/modules/ui/resumo.js - Agora apenas 10 linhas
import { SummaryRenderer } from './components/summary-renderer.js'

export function atualizarResumo(disciplinas) {
  SummaryRenderer.render(disciplinas)
}
```

## 5. Refatoração de Event Listeners

### ❌ Problema Atual

```javascript
// Event listeners espalhados e duplicados
setupEventListeners() {
  const form = document.getElementById('disciplinaForm')
  form.addEventListener('submit', this.handleSubmit.bind(this))

  const cursoSelect = document.getElementById('curso')
  cursoSelect.addEventListener('change', this.handleCourseChange.bind(this))

  // Mais 20+ event listeners...
}
```

### ✅ Solução Proposta

#### event-manager.js (gerenciamento centralizado)

```javascript
// js/modules/utils/event-manager.js
export class EventManager {
  constructor() {
    this.listeners = new Map()
    this.delegatedEvents = new Map()
  }

  on(selector, eventType, handler, options = {}) {
    const key = `${selector}:${eventType}`

    if (options.delegated) {
      this.setupDelegatedEvent(selector, eventType, handler)
    } else {
      this.setupDirectEvent(selector, eventType, handler)
    }

    this.listeners.set(key, { handler, options })
  }

  off(selector, eventType) {
    const key = `${selector}:${eventType}`
    const listener = this.listeners.get(key)

    if (listener) {
      const element = document.querySelector(selector)
      if (element) {
        element.removeEventListener(eventType, listener.handler)
      }
      this.listeners.delete(key)
    }
  }

  setupDelegatedEvent(selector, eventType, handler) {
    const parent = document.querySelector(selector.split(' ')[0])
    if (!parent) return

    parent.addEventListener(eventType, event => {
      const target = event.target.closest(selector)
      if (target) {
        handler.call(target, event, target)
      }
    })
  }
}
```

#### form-event-handler.js (handlers específicos)

```javascript
// js/modules/ui/handlers/form-event-handler.js
import { EventManager } from '../../utils/event-manager.js'
import { FormValidator } from '../../services/form-validator.js'

export class FormEventHandler {
  constructor(app) {
    this.app = app
    this.eventManager = new EventManager()
    this.validator = new FormValidator()
  }

  setup() {
    this.setupFormSubmission()
    this.setupFieldValidation()
    this.setupAutoSave()
  }

  setupFormSubmission() {
    this.eventManager.on('#disciplinaForm', 'submit', event => {
      event.preventDefault()
      this.handleFormSubmit(event)
    })
  }

  setupFieldValidation() {
    this.eventManager.on(
      '#codigo',
      'blur',
      event => {
        this.validateField(event.target, 'codigo')
      },
      { delegated: false }
    )

    this.eventManager.on(
      '#nota',
      'input',
      event => {
        this.validateField(event.target, 'nota')
      },
      { delegated: false }
    )
  }

  async handleFormSubmit(event) {
    const formData = this.extractFormData(event.target)

    if (!this.validator.validateForm(formData)) {
      return
    }

    try {
      await this.app.stateManager.addDiscipline(formData)
      this.resetForm(event.target)
      this.app.updateUI()
    } catch (error) {
      ErrorHandler.handle(error, 'FormEventHandler.handleFormSubmit')
    }
  }
}
```

## 6. Implementação de Padrões de Design

### Factory Pattern para Criação de Objetos

```javascript
// js/modules/factories/discipline-factory.js
export class DisciplineFactory {
  static create(data) {
    return {
      codigo: data.codigo?.trim().toUpperCase(),
      nome: data.nome?.trim(),
      ch: parseInt(data.ch) || 0,
      nota: parseFloat(data.nota) || null,
      periodo: data.periodo?.trim(),
      natureza: data.natureza?.toUpperCase(),
      resultado: data.resultado || 'AP',
      trancamento: Boolean(data.trancamento),
      dispensada: Boolean(data.dispensada),
      emCurso: Boolean(data.emCurso),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  static createFromForm(formData) {
    return this.create({
      codigo: formData.get('codigo'),
      nome: formData.get('nome'),
      ch: formData.get('ch'),
      nota: formData.get('nota'),
      periodo: formData.get('periodo'),
      natureza: formData.get('natureza'),
      trancamento: formData.get('trancamento') === 'on',
      dispensada: formData.get('dispensada') === 'on',
      emCurso: formData.get('emcurso') === 'on'
    })
  }

  static validate(discipline) {
    const errors = []

    if (!discipline.codigo) errors.push('Código é obrigatório')
    if (!discipline.nome) errors.push('Nome é obrigatório')
    if (!discipline.ch || discipline.ch <= 0)
      errors.push('Carga horária deve ser maior que zero')
    if (!discipline.periodo) errors.push('Período é obrigatório')
    if (!discipline.natureza) errors.push('Natureza é obrigatória')

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
```

### Observer Pattern para Comunicação entre Módulos

```javascript
// js/modules/utils/event-bus.js
export class EventBus {
  constructor() {
    this.events = new Map()
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(callback)
  }

  off(event, callback) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          ErrorHandler.handle(error, `EventBus.emit(${event})`)
        }
      })
    }
  }
}

// Uso do EventBus
const eventBus = new EventBus()

// Em um módulo
eventBus.emit('discipline:added', { discipline, course })

// Em outro módulo
eventBus.on('discipline:added', ({ discipline, course }) => {
  updateTable()
  updateSummary()
  updateRequirements()
})
```

## 7. Benefícios da Refatoração

### Antes da Refatoração

- ❌ Arquivos com 1000+ linhas
- ❌ Valores mágicos espalhados
- ❌ Tratamento de erros inconsistente
- ❌ Funções com múltiplas responsabilidades
- ❌ Event listeners duplicados
- ❌ Dificuldade para testar
- ❌ Manutenção complexa

### Após a Refatoração

- ✅ Arquivos com máximo 200 linhas
- ✅ Configurações centralizadas
- ✅ Tratamento de erros padronizado
- ✅ Funções com responsabilidade única
- ✅ Event listeners organizados
- ✅ Fácil de testar
- ✅ Manutenção simplificada
- ✅ Código reutilizável
- ✅ Melhor performance
- ✅ Facilita onboarding de novos desenvolvedores
