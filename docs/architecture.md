# Arquitetura — Histórico Acadêmico

Documentação técnica da aplicação Next.js que sucedeu a versão vanilla JS.
Última atualização: março 2026 (v2.3).

---

## Visão Geral

Aplicação web para estudantes da UFBA gerenciarem seu histórico acadêmico.
Suporta os cursos BICTI, Engenharia de Produção e Engenharia Elétrica.

**Stack principal:** Next.js 16 (App Router) · React 19 · TypeScript 5.6 · Firebase 11 · Tailwind CSS · Shadcn/UI

**Deploy:** Vercel (auto-deploy via GitHub Actions)

---

## Estrutura de Diretórios

```
app/                  # Rotas (Next.js App Router)
components/
  auth-provider.tsx   # Contexto de autenticação Firebase
  ui/                 # Componentes Shadcn/UI (Radix UI)
  layout/             # Header, Footer
  pages/              # Componentes de página completa
  features/           # Componentes de domínio (academic-history, summary, charts…)
    certificados/     # Subsistema de certificados (components + hooks)
lib/
  constants.ts        # Configuração dos cursos (requisitos, limites, prazos)
  pdf-parser.ts       # Extração de texto de PDFs do SIGAA
  certificate-ocr.ts  # OCR de certificados de atividades complementares
  error-handler.ts    # Classificação e tratamento de erros
  logger.ts           # Logger estruturado com integração Sentry
  firebase/config.ts  # Inicialização lazy do Firebase
  utils/              # Barrel module (calculations, periods, predictions…)
services/
  auth.service.ts         # Autenticação Firebase (login, registro, reset)
  firestore.service.ts    # CRUD Firestore (disciplinas, perfil, certificados, horários)
  storage.service.ts      # Firebase Storage (arquivos de certificados)
  calculations.service.ts # Métricas acadêmicas (CR, horas, semestralizacao)
types/index.ts        # Todas as interfaces e tipos TypeScript
assets/data/
  disciplinas.json    # Catálogo de disciplinas e grade curricular (BICTI, ENG_PROD, ENG_ELET)
public/
  pdf.worker.min.mjs  # Worker do PDF.js (copiado via postinstall, serve CSP)
```

---

## Rotas

| Rota | Visibilidade | Descrição |
|------|-------------|-----------|
| `/` | Autenticado | Dashboard: histórico, resumo, gráficos |
| `/horarios` | Autenticado | Grade de horários do semestre atual |
| `/certificados` | Autenticado | Atividades complementares |
| `/simulador` | Autenticado | Simulador de notas e previsão de formatura |
| `/profile` | Autenticado | Configurações do perfil |
| `/u/[userId]` | Público | Perfil acadêmico público |
| `/u/[userId]/horarios` | Público | Grade de horários pública |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Anônimo | Autenticação |
| `/legal/privacy`, `/legal/terms` | Público | Páginas legais |

---

## Camadas da Aplicação

```
┌─────────────────────────────────────┐
│          app/ (Rotas Next.js)       │  Server Components (SSR/SSG)
├─────────────────────────────────────┤
│      components/pages/ + features/  │  Client Components (estado, interação)
├─────────────────────────────────────┤
│          services/                  │  Toda chamada Firebase passa aqui
├────────────────┬────────────────────┤
│   lib/utils/   │  lib/pdf-parser    │  Lógica pura (testável, sem I/O)
│   calculations │  certificate-ocr   │
├────────────────┴────────────────────┤
│        Firebase (Auth + Firestore   │  Backend as a Service
│        + Storage) + Sentry          │
└─────────────────────────────────────┘
```

**Regra principal:** componentes não chamam Firebase diretamente — toda chamada passa pelos `services/`.

---

## Modelo de Dados (Firestore)

```
users/{userId}
  └─ Profile: nome, email, photoURL, curso, periodoIngresso, configurações

users/{userId}/disciplines/{disciplinaId}
  └─ Disciplina: codigo, nome, natureza, ch, nota, periodo,
                 resultado, trancamento, dispensada, emcurso

users/{userId}/certificados/{certificadoId}
  └─ Certificado: titulo, tipo, instituicao, cargaHoraria,
                  dataInicio, dataFim, status, fileUrl

users/{userId}/scheduleCodes
  └─ Record<disciplinaId, codigoHorario>  (ex: "46T56")

publicProfiles/{userId}
  └─ Subconjunto público do Profile (opt-in)
```

**IDs tipados:** `DisciplinaId`, `UserId`, `CertificadoId` são branded types — evitam mistura acidental de IDs em tempo de compilação.

---

## Lógica Acadêmica

### Naturezas de Componente

| Código | Nome | Observação |
|--------|------|-----------|
| OB | Obrigatória | Core do curso |
| OP | Optativa | Disciplinas eletivas do próprio instituto |
| OG | Optativa Geral | Disciplinas de outros institutos |
| OH | Optativa Humanística | Humanidades |
| OX | Optativa de Extensão | Extensão universitária |
| OZ | Optativa de Internacionalização | Intercâmbio |
| AC | Atividade Complementar | Certificados e participações |
| LV | Livre | Overflow de outras categorias + dispensas |

### Regras de Progresso

1. Apenas disciplinas com `resultado === 'AP'` ou `dispensada === true` contam para carga horária.
2. Disciplinas dispensadas contam como `LV`.
3. Horas excedentes em qualquer categoria (exceto OB e AC) transbordam para `LV`.
4. `LV` e cada categoria têm teto definido em `lib/constants.ts → CURSOS[curso].requisitos`.

### Cálculo do CR (Coeficiente de Rendimento)

Exclui disciplinas: trancadas, dispensadas, natureza AC, nota nula.
Fórmula: `Σ(nota × ch) / Σ(ch)` para disciplinas aprovadas e reprovadas com nota válida.

---

## Fluxo de Importação de PDF

```
File (PDF do SIGAA)
  └→ parseSigaaHistory(file)          [lib/pdf-parser.ts]
       ├─ extractTextFromPDF()         PDF.js (worker local)
       └─ parseSigaaHistoryText(text)  Lógica pura — testável sem PDF.js
            ├─ rowRegex → linhas de disciplina
            ├─ mapSituacao() → ResultadoDisciplina
            ├─ mapNatureza() → Natureza (com fallback ao catálogo)
            └─ lookup no disciplinas.json → nome canônico + natureza
```

`parseSigaaHistoryText` é uma função pura exportada — pode ser testada com strings sintéticas sem mockar PDF.js.

---

## Segurança

- **CSP:** configurada em `next.config.ts` — permite Firebase, Google APIs, Sentry; bloqueia `eval` e workers externos.
- **PDF.js worker:** servido de `/public/pdf.worker.min.mjs` (copiado via `postinstall`) para satisfazer a CSP sem `blob:` URIs.
- **Firestore Rules:** em `firestore.rules` — usuário só acessa seus próprios documentos; `publicProfiles` são leitura livre.
- **Sanitização:** `sanitizeInput` e `isSafeExternalUrl` em `lib/utils/text.ts` para entrada do usuário e URLs externas.
- **Headers HTTP:** `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Permissions-Policy` configurados no Next.js.

---

## Observabilidade

- **Sentry** (`@sentry/nextjs`): captura exceções não tratadas no client e server. Ativado apenas em produção com `NEXT_PUBLIC_SENTRY_DSN` definido.
- **Logger** (`lib/logger.ts`): abstração sobre `console.*` que em produção envia `warn` como `captureMessage` e `error` como `captureException`.
- **Rate:** `tracesSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0`, `replaysSessionSampleRate: 0.05`.

---

## Testes

```
__tests__/
  lib/
    utils.test.ts             Cálculos (CR, médias, naturezas)
    pdf-parser.test.ts        parseSigaaHistoryText com texto sintético
    certificate-ocr.test.ts   parseCertificadoPDF via mock do PDF.js
    error-handler.test.ts     Classificação e tratamento de erros
  services/
    firestore.service.test.ts CRUD Firestore (Firebase mockado)
    auth.service.test.ts      Autenticação (Firebase mockado)
  components/
    auth-provider.test.tsx    Contexto de autenticação
    utils.test.tsx            Utilitários de componentes
e2e/                          Playwright (fluxos críticos de usuário)
```

**Cobertura:** thresholds por arquivo em `jest.config.js` para os módulos críticos (`error-handler.ts`, `certificate-ocr.ts`, `pdf-parser.ts`, `firestore.service.ts`, `auth.service.ts`).

---

## ADRs

Decisões arquiteturais registradas em `docs/adr/`:

| ADR | Decisão |
|-----|---------|
| [ADR-001](adr/001-nextjs-app-router.md) | Migração para Next.js App Router |
| [ADR-002](adr/002-firebase-baas.md) | Firebase como BaaS |
| [ADR-003](adr/003-pdfjs-worker-local.md) | PDF.js worker servido localmente |
| [ADR-004](adr/004-service-layer.md) | Camada de serviços para acesso ao Firebase |
| [ADR-005](adr/005-branded-types.md) | Branded types para IDs de domínio |
| [ADR-006](adr/006-utils-barrel.md) | Barrel module para lib/utils |
