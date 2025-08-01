# Plano de Refatoração - Clean Code

## 1. Refatoração de Arquivos Grandes

### 1.1 js/app.js (1010 linhas) → Dividir em:

#### app.js (máximo 200 linhas)

- Classe principal App
- Inicialização e configuração
- Orquestração de módulos

#### app-state-manager.js (novo)

- Gerenciamento de estado da aplicação
- Sincronização de dados
- Registro de remoções

#### app-event-handlers.js (novo)

- Event listeners principais
- Validação de operações
- Integração com módulos

#### app-sync-manager.js (novo)

- Sincronização automática
- Verificação de mudanças
- Atualização de dados

### 1.2 js/modules/firebase/data.js (921 linhas) → Dividir em:

#### data-service.js (máximo 200 linhas)

- Classe principal DataService
- Métodos básicos CRUD

#### discipline-service.js (novo)

- Operações específicas de disciplinas
- Validações de disciplina

#### user-data-service.js (novo)

- Dados do usuário
- Backup e restauração

#### sync-service.js (novo)

- Sincronização de dados
- Limpeza e validação

### 1.3 js/modules/ui/simulation-ui.js (718 linhas) → Dividir em:

#### simulation-ui.js (máximo 200 linhas)

- Classe principal SimulationUI
- Inicialização e configuração

#### simulation-form-handler.js (novo)

- Manipulação do formulário de simulação
- Validações específicas

#### simulation-display.js (novo)

- Renderização da interface de simulação
- Atualização de visualizações

#### simulation-catalog.js (novo)

- Carregamento do catálogo de disciplinas
- Sugestões e autocompletar

## 2. Melhorias de Nomenclatura e Estrutura

### 2.1 Padronização de Nomes

```javascript
// ❌ Atual (inconsistente)
carregarDisciplinas()
setupFormHandlers()
atualizarTabela()

// ✅ Proposto (padronizado)
loadDisciplines()
setupFormHandlers()
updateTable()
```

### 2.2 Constantes e Configurações

```javascript
// ❌ Atual - valores mágicos espalhados
setInterval(() => {
  this.verificarSincronizacao()
}, 30000) // 30 segundos

// ✅ Proposto - constantes centralizadas
const SYNC_INTERVAL_MS = 30000
const TOKEN_LIFETIME_MS = 3600000
const DEFAULT_COURSE = 'BICTI'
```

## 3. Melhorias de Performance e Manutenibilidade

### 3.1 Debounce e Throttling

```javascript
// ❌ Atual - sem debounce
filterInput.addEventListener('input', e => {
  performSearch(e.target.value)
})

// ✅ Proposto - com debounce
const debouncedSearch = debounce(performSearch, 300)
filterInput.addEventListener('input', e => {
  debouncedSearch(e.target.value)
})
```

### 3.2 Error Handling Centralizado

```javascript
// ❌ Atual - tratamento disperso
try {
  // código
} catch (error) {
  console.error('Erro:', error)
}

// ✅ Proposto - handler centralizado
class ErrorHandler {
  static handle(error, context) {
    console.error(`Erro em ${context}:`, error)
    // Lógica centralizada de tratamento
  }
}
```

## 4. Estrutura de Pastas Proposta

```
js/
├── app/
│   ├── app.js
│   ├── app-state-manager.js
│   ├── app-event-handlers.js
│   └── app-sync-manager.js
├── modules/
│   ├── firebase/
│   │   ├── data-service.js
│   │   ├── discipline-service.js
│   │   ├── user-data-service.js
│   │   └── sync-service.js
│   ├── ui/
│   │   ├── simulation/
│   │   │   ├── simulation-ui.js
│   │   │   ├── simulation-form-handler.js
│   │   │   ├── simulation-display.js
│   │   │   └── simulation-catalog.js
│   │   └── components/
│   │       ├── table/
│   │       ├── form/
│   │       └── export/
│   └── utils/
│       ├── constants.js
│       ├── validators.js
│       ├── formatters.js
│       └── helpers.js
└── config/
    ├── app-config.js
    └── firebase-config.js
```

## 5. Implementação de Padrões

### 5.1 Factory Pattern para Criação de Objetos

```javascript
class DisciplineFactory {
  static create(data) {
    return {
      codigo: data.codigo,
      nome: data.nome,
      ch: data.ch,
      nota: data.nota,
      periodo: data.periodo,
      natureza: data.natureza,
      resultado: data.resultado || 'AP',
      createdAt: new Date()
    }
  }
}
```

### 5.2 Observer Pattern para Eventos

```javascript
class EventBus {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }
}
```

## 6. Testes e Documentação

### 6.1 Estrutura de Testes

```
tests/
├── unit/
│   ├── utils/
│   ├── services/
│   └── components/
├── integration/
└── e2e/
```

### 6.2 Documentação JSDoc

```javascript
/**
 * Calcula o coeficiente de rendimento do aluno
 * @param {Array<Discipline>} disciplines - Lista de disciplinas
 * @param {string} course - Código do curso
 * @returns {number} Coeficiente de rendimento calculado
 * @throws {Error} Quando não há disciplinas válidas
 */
function calculateGradePointAverage(disciplines, course) {
  // implementação
}
```

## 7. Prioridades de Implementação

### Alta Prioridade

1. Dividir `app.js` em módulos menores
2. Implementar tratamento de erros centralizado
3. Padronizar nomenclatura de funções
4. Extrair constantes mágicas

### Média Prioridade

1. Refatorar módulos Firebase
2. Implementar padrões de design
3. Melhorar estrutura de pastas
4. Adicionar validações centralizadas

### Baixa Prioridade

1. Implementar testes unitários
2. Adicionar documentação completa
3. Otimizações de performance
4. Implementar logging estruturado
