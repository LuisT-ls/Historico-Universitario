# ADR-005 — Branded types para IDs de domínio

**Status:** Aceito
**Data:** 2024

## Contexto

Funções como `getDisciplines(userId)` e `deleteDiscipline(disciplinaId)` aceitavam `string`. Era possível passar o ID errado sem erro de compilação.

## Decisão

Usar **branded types** para IDs de domínio:

```typescript
type DisciplinaId = string & { readonly __brand: 'DisciplinaId' }
type UserId       = string & { readonly __brand: 'UserId' }
type CertificadoId = string & { readonly __brand: 'CertificadoId' }
```

Funções construtoras em `lib/type-constants.ts`:
```typescript
export const createDisciplinaId = (id: string): DisciplinaId => id as DisciplinaId
```

## Consequências

**Positivas:**
- Misturar `userId` onde se espera `disciplinaId` vira erro de TypeScript em compile time
- Sem custo em runtime — é apenas uma convenção de tipo

**Negativas/Compensações:**
- Requer `createXxxId()` ao receber IDs do Firestore (boundary de entrada)
- Pode parecer burocrático para IDs simples — compensado pela segurança em funções críticas
