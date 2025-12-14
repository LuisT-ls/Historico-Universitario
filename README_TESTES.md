# 🧪 Guia de Testes - Histórico Universitário

Este documento descreve a estrutura de testes automatizados do projeto.

## 📋 Estrutura de Testes

O projeto possui três tipos de testes:

1. **Testes Unitários** - Jest + React Testing Library
2. **Testes de Integração** - Jest
3. **Testes E2E** - Playwright

---

## 🚀 Executando Testes

### Testes Unitários

```bash
# Executar todos os testes
npm run test

# Executar em modo watch (desenvolvimento)
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

### Testes E2E

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com UI interativa
npm run test:e2e:ui

# Executar testes em modo debug
npx playwright test --debug
```

### Todos os Testes

```bash
# Executar testes unitários e E2E
npm run test:all
```

---

## 📁 Estrutura de Arquivos

```
.
├── __tests__/              # Testes unitários e de integração
│   ├── lib/               # Testes de utilitários
│   │   ├── utils.test.ts
│   │   └── error-handler.test.ts
│   └── components/        # Testes de componentes
│       ├── ui/
│       └── utils.test.tsx
├── e2e/                    # Testes end-to-end
│   ├── home.spec.ts
│   ├── navigation.spec.ts
│   └── accessibility.spec.ts
├── jest.config.js         # Configuração do Jest
├── jest.setup.js          # Setup do ambiente de testes
└── playwright.config.ts    # Configuração do Playwright
```

---

## 🧩 Testes Unitários

### Funções Utilitárias

Testes para funções em `lib/utils.ts`:

- ✅ `cn()` - Combinação de classes CSS
- ✅ `formatDate()` - Formatação de datas
- ✅ `getPeriodoMaisRecente()` - Cálculo de período
- ✅ `calcularResultado()` - Cálculo de resultado acadêmico
- ✅ `calcularCR()` - Cálculo de Coeficiente de Rendimento
- ✅ `calcularMediaGeral()` - Cálculo de média geral
- ✅ `sanitizeInput()` - Sanitização de inputs
- ✅ `sanitizeLongText()` - Sanitização de textos longos
- ✅ E mais...

### Tratamento de Erros

Testes para `lib/error-handler.ts`:

- ✅ `isFirebaseError()` - Verificação de tipo
- ✅ `getFirebaseErrorMessage()` - Mapeamento de erros
- ✅ `handleError()` - Tratamento padronizado
- ✅ Cobertura de todos os códigos de erro do Firebase

### Componentes

Testes para componentes React:

- ✅ Componentes UI básicos (Button, Input, etc.)
- ✅ Integração de sanitização
- ✅ Renderização e interações

---

## 🎭 Testes E2E

### Página Inicial

- ✅ Carregamento da página
- ✅ Exibição de elementos principais
- ✅ Navegação para login
- ✅ Responsividade mobile

### Navegação

- ✅ Links funcionais
- ✅ Header e Footer
- ✅ Estado de autenticação

### Acessibilidade

- ✅ Estrutura semântica
- ✅ Contraste de cores
- ✅ Navegação por teclado
- ✅ Labels e ARIA

---

## 📊 Cobertura de Código

A cobertura mínima configurada é de **70%** para:
- Branches
- Functions
- Lines
- Statements

Para ver a cobertura:

```bash
npm run test:coverage
```

Isso gerará um relatório em `coverage/` com detalhes da cobertura.

---

## 🔧 Configuração

### Jest

Configuração em `jest.config.js`:

- Ambiente: `jsdom` (simula DOM do navegador)
- Setup: `jest.setup.js` (mocks e configurações)
- Mapeamento de paths: Suporta imports `@/`
- Cobertura: Configurada para `lib/` e `components/`

### Playwright

Configuração em `playwright.config.ts`:

- Navegadores: Chromium, Firefox, WebKit
- Dispositivos: Mobile Chrome, Mobile Safari
- Servidor: Inicia automaticamente `npm run dev`
- Retry: 2 tentativas no CI

---

## 📝 Escrevendo Novos Testes

### Teste Unitário

```typescript
// __tests__/lib/example.test.ts
import { minhaFuncao } from '@/lib/example'

describe('minhaFuncao', () => {
  it('deve fazer algo corretamente', () => {
    const resultado = minhaFuncao('input')
    expect(resultado).toBe('output esperado')
  })
})
```

### Teste de Componente

```typescript
// __tests__/components/example.test.tsx
import { render, screen } from '@testing-library/react'
import { MeuComponente } from '@/components/example'

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />)
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })
})
```

### Teste E2E

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test'

test('deve fazer algo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Texto')).toBeVisible()
})
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Verifique se os paths em `jest.config.js` estão corretos e se os imports usam `@/`.

### Erro: "Firebase not initialized"

Os testes mockam o Firebase em `jest.setup.js`. Se precisar de mocks específicos, adicione em `jest.setup.js`.

### Playwright não encontra o servidor

Certifique-se de que:
1. O servidor está rodando em `http://localhost:3000`
2. Ou configure `PLAYWRIGHT_TEST_BASE_URL` no `.env`

### Testes E2E falhando

1. Execute `npx playwright install` para instalar navegadores
2. Verifique se o servidor está rodando
3. Execute com `--headed` para ver o que está acontecendo

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)

---

## ✅ Checklist de Testes

Antes de fazer commit:

- [ ] Testes unitários passando (`npm run test`)
- [ ] Cobertura acima de 70%
- [ ] Testes E2E passando (`npm run test:e2e`)
- [ ] Novos recursos têm testes correspondentes
- [ ] Testes são rápidos (< 30s para unitários, < 5min para E2E)

---

## 🎯 Próximos Passos

Melhorias futuras:

- [ ] Adicionar testes para mais componentes
- [ ] Testes de integração com Firebase (mock)
- [ ] Testes de performance
- [ ] Testes de acessibilidade com axe-core
- [ ] Testes visuais com Percy ou Chromatic
