# ADR-004 — Camada de serviços para acesso ao Firebase

**Status:** Aceito
**Data:** 2024

## Contexto

Sem uma fronteira explícita, chamadas ao Firebase se espalharam por hooks e componentes, dificultando testes e a rastreabilidade de efeitos colaterais.

## Decisão

Toda chamada ao Firebase (Firestore, Auth, Storage) é feita exclusivamente em `services/`. Componentes e hooks só invocam funções dos serviços — nunca importam `firebase/firestore` diretamente.

```
services/
  auth.service.ts         → getAuth, signIn, signOut, createUser
  firestore.service.ts    → getDisciplines, saveDiscipline, getProfile…
  storage.service.ts      → uploadCertificate, deleteFile
  calculations.service.ts → métricas derivadas do Firestore
```

## Consequências

**Positivas:**
- Mocking centralizado nos testes: basta mockar o módulo `services/firestore.service`
- Refatoração do SDK (ex: migrar de Firestore v8 para v9) toca apenas `services/`
- Componentes são mais fáceis de testar — recebem dados via props ou hooks, não chamam Firebase diretamente

**Negativas/Compensações:**
- Uma camada extra de indireção para operações simples
- Funções de serviço tendem a crescer — manter coesão agrupando por entidade (disciplines, certificates, profile)
