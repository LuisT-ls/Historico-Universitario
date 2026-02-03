# CI/CD Pipeline Documentation

## Workflow Overview

Automated testing and build pipeline configurado no GitHub Actions que executa em **push** e **pull requests** nas branches `main` e `develop`.

## Jobs Configurados

### 1. **Lint & Type Check** 
- ESLint para qualidade de código
- TypeScript type checking
- Executa primeiro para falhar rápido

### 2. **Unit Tests** 
- Executa toda suite de testes unitários
- Gera relatório de cobertura
- Upload automático para Codecov
- Comentário automático com cobertura em PRs

### 3. **E2E Tests (Playwright)** 
- Testes end-to-end com Playwright
- Upload de relatórios em caso de falha
- Executa em paralelo com testes unitários

### 4. **Build** 
- Build de produção do Next.js
- Verifica se o projeto compila sem erros
- Só roda se testes passarem

### 5. **Test Summary** 
- Resumo final de todos os jobs
- Sempre executa para mostrar status

## Badges (Opcional)

Adicione ao README principal:

```markdown
![CI/CD](https://github.com/SEU_USUARIO/SEU_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/SEU_USUARIO/SEU_REPO/branch/main/graph/badge.svg)
```

## Secrets Necessários

Para funcionar completamente, configure no GitHub Settings > Secrets:

- `CODECOV_TOKEN` - Token do Codecov (opcional, para relatórios de cobertura)
- `GITHUB_TOKEN` - Já fornecido automaticamente pelo GitHub Actions

## Gatilhos

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

## Tempo Estimado de Execução

- Lint & Type Check: ~1-2min
- Unit Tests: ~2-3min
- E2E Tests: ~3-5min
- Build: ~2-3min

**Total:** ~8-13 minutos

## Troubleshooting

### Build Falhando

1. Verifique se todos os testes passam localmente: `npm test`
2. Rode type check local: `npm run type-check`
3. Teste o build local: `npm run build`

### E2E Falhando

1. Rode localmente: `npm run test:e2e`
2. Verifique o artefato "playwright-report" no GitHub Actions para screenshots/vídeos

### Coverage não aparecendo

1. Verifique se `CODECOV_TOKEN` está configurado
2. Confirme que coverage está sendo gerado: `npm run test:coverage`

## Arquivos Relacionados

- `.github/workflows/ci-cd.yml` - Workflow principal
- `jest.config.js` - Configuração de testes unitários
- `playwright.config.ts` - Configuração de testes E2E
