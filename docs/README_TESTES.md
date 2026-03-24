# 🧪 Guia de Testes - Histórico Acadêmico

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
├── __tests__/                        # Testes unitários e de integração
│   ├── lib/                          # Testes de utilitários e lógica de negócio
│   │   ├── pdf-parser.test.ts        # Parser do histórico SIGAA (situações, naturezas, períodos)
│   │   ├── utils.test.ts             # Funções utilitárias gerais e calcularEstatisticas
│   │   ├── utils-coverage.test.ts    # Cobertura adicional: previsão, CR, perfil inicial
│   │   ├── utils-additional.test.ts  # Casos de borda das utilidades
│   │   ├── cr-calculation.test.ts    # Cálculo do Coeficiente de Rendimento
│   │   ├── normalization.test.ts     # Normalização de dados
│   │   ├── certificate-ocr.test.ts   # OCR de certificados
│   │   ├── error-handler.test.ts     # Tratamento de erros do Firebase
│   │   └── error-handler-additional.test.ts
│   ├── components/                   # Testes de componentes React
│   │   ├── auth-provider.test.tsx
│   │   ├── features/certificados/hooks/
│   │   │   ├── use-certificado-filters.test.ts
│   │   │   ├── use-certificado-form.test.ts
│   │   │   └── use-date-mask.test.ts
│   │   ├── ui/
│   │   │   └── button.test.tsx
│   │   └── utils.test.tsx
│   └── services/                     # Testes de serviços externos
│       ├── auth.service.test.ts
│       └── firestore.service.test.ts
├── e2e/                              # Testes end-to-end
│   ├── home.spec.ts
│   ├── navigation.spec.ts
│   └── accessibility.spec.ts
├── jest.config.js                    # Configuração do Jest
├── jest.setup.js                     # Setup do ambiente de testes
└── playwright.config.ts              # Configuração do Playwright
```

---

## 🧩 Testes Unitários

### Parser do Histórico SIGAA (`lib/pdf-parser.ts`)

- ✅ Parsing das situações: `APR`, `REP`, `REPF`, `REPMF`, `TRANC`, `CANC`, `DISP`, `CUMP`, `TRANS`, `INCORP`, `MATR`
- ✅ Mapping de naturezas: `EB→OB`, `EP→OP`, `EC→AC`
- ✅ Disciplinas com período `--` (transferidas) → `periodo: '0000.0'`
- ✅ Tracking de período entre linhas sem semestre
- ✅ Limpeza de código de turma (sufixo `A`)
- ✅ Limpeza de nome do professor no nome da disciplina
- ✅ Tratamento de nota `--` como `0` sem afetar a média
- ✅ Disciplinas TRANS/INCORP contam CH mas não afetam a média

### Funções Utilitárias

Testes para funções em `lib/utils/`:

- ✅ `calcularResultado()` - Resultado acadêmico (AP, RR, TR, DP)
- ✅ `calcularCR()` - Coeficiente de Rendimento
- ✅ `calcularMediaGeral()` - Média geral (exclui dispensadas/trancadas)
- ✅ `calcularCreditos()` - Total de créditos
- ✅ `calcularEstatisticas()` - Estatísticas completas incluindo dispensadas como concluídas
- ✅ `calcularPrevisaoFormaturaCompleta()` - Previsão de formatura
- ✅ `calcularPerfilInicial()` - Perfil de semestralização
- ✅ `cn()` - Combinação de classes CSS
- ✅ `sanitizeInput()` / `sanitizeLongText()` - Sanitização de inputs

### Tratamento de Erros

Testes para `lib/error-handler.ts`:

- ✅ `isFirebaseError()` - Verificação de tipo
- ✅ `getFirebaseErrorMessage()` - Mapeamento de erros
- ✅ `handleError()` - Tratamento padronizado
- ✅ Cobertura de todos os códigos de erro do Firebase

### Componentes e Serviços

- ✅ Componentes UI básicos (Button, AuthProvider, etc.)
- ✅ Hooks de certificados (filtros, formulário, máscara de data)
- ✅ Serviço Firestore (CRUD de disciplinas)
- ✅ Serviço de autenticação

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

A cobertura mínima configurada é de **70%** para branches e lines, e **60%** para functions e statements. Total atual: **364 testes** (360 passando, 4 skipped).

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
