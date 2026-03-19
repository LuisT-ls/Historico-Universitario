# ADR-006 — Barrel module para lib/utils

**Status:** Aceito
**Data:** 2025

## Contexto

`lib/utils.ts` cresceu para mais de 600 linhas com funções de domínios completamente diferentes: cálculos acadêmicos, manipulação de texto, lógica de períodos, predições e helpers de UI. Isso dificultava encontrar funções e aumentava o risco de importar acidentalmente um módulo pesado.

## Decisão

Decompor `lib/utils.ts` em módulos temáticos dentro de `lib/utils/`, com um `index.ts` que re-exporta tudo:

```
lib/utils/
  calculations.ts   # CR, médias, progresso por natureza
  periods.ts        # compararPeriodos, getCurrentSemester
  predictions.ts    # calcularPrevisaoFormaturaCompleta
  statistics.ts     # calcularEstatisticas
  storage.ts        # clearUserData
  text.ts           # sanitizeInput, formatDate, isSafeExternalUrl
  ui.ts             # cn() (classnames)
  index.ts          # export * from cada módulo
```

Imports existentes (`@/lib/utils`) continuam funcionando sem mudança — TypeScript resolve `@/lib/utils` para `lib/utils/index.ts` automaticamente.

## Consequências

**Positivas:**
- Cada arquivo tem responsabilidade única — fácil de localizar funções
- Permite cobertura de teste por módulo
- Tree-shaking mais eficiente: imports diretos (`@/lib/utils/calculations`) não carregam text.ts ou ui.ts

**Negativas/Compensações:**
- Dependências internas entre módulos precisam ser explícitas (ex: `statistics.ts` importa de `./calculations`)
- Não pode haver `lib/utils.ts` e `lib/utils/` simultaneamente — o arquivo original foi deletado
