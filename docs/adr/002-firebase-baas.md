# ADR-002 — Firebase como BaaS

**Status:** Aceito
**Data:** 2024

## Contexto

O projeto precisa de autenticação, banco de dados em tempo real e armazenamento de arquivos, sem manter infraestrutura própria.

## Decisão

Usar **Firebase** (Auth + Firestore + Storage) como Backend as a Service.

- Auth: email/senha e Google OAuth
- Firestore: banco de dados NoSQL para disciplinas, perfil, certificados e horários
- Storage: armazenamento dos arquivos PDF de certificados

## Consequências

**Positivas:**
- Zero infra para operar — sem servidor, banco ou CDN próprios
- SDK client-side com listeners em tempo real
- Regras de segurança declarativas no próprio Firebase (`firestore.rules`)
- Plano gratuito (Spark) suficiente para a escala atual

**Negativas/Compensações:**
- Lock-in no ecossistema Google
- Consultas relacionais complexas são difíceis no Firestore (modelo documento)
- Firebase SDK é pesado — inicialização lazy (`lib/firebase/config.ts`) para não bloquear o carregamento inicial

## Padrão de Uso

Toda chamada ao Firebase é feita exclusivamente nos `services/` — componentes nunca importam o SDK diretamente. Isso facilita mocking nos testes e isola o acoplamento.
