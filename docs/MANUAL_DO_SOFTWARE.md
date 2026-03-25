# MANUAL DO SOFTWARE
## Histórico Acadêmico UFBA

---

**Documento elaborado para fins de Registro de Programa de Computador**
**Instituto Nacional da Propriedade Industrial — INPI**
**Lei nº 9.609/98 | Instrução Normativa INPI nº 11/2013**

---

**Versão do Documento:** 1.0
**Data de Elaboração:** Março de 2026
**Classificação:** Público

---

## SUMÁRIO

1. [IDENTIFICAÇÃO DO SOFTWARE](#1-identificação-do-software)
2. [DESCRIÇÃO GERAL](#2-descrição-geral)
3. [ARQUITETURA DO SISTEMA](#3-arquitetura-do-sistema)
4. [TECNOLOGIAS E DEPENDÊNCIAS](#4-tecnologias-e-dependências)
5. [MÓDULOS E FUNCIONALIDADES](#5-módulos-e-funcionalidades)
6. [MODELO DE DADOS](#6-modelo-de-dados)
7. [FLUXOS PRINCIPAIS DO SISTEMA](#7-fluxos-principais-do-sistema)
8. [INTERFACES E ROTAS](#8-interfaces-e-rotas)
9. [SEGURANÇA E PRIVACIDADE](#9-segurança-e-privacidade)
10. [REQUISITOS DO SISTEMA](#10-requisitos-do-sistema)
11. [INSTALAÇÃO E CONFIGURAÇÃO](#11-instalação-e-configuração)
12. [ESTRUTURA DE DIRETÓRIOS](#12-estrutura-de-diretórios)
13. [HISTÓRICO DE VERSÕES](#13-histórico-de-versões)
14. [CONSIDERAÇÕES FINAIS](#14-considerações-finais)

---

## 1. IDENTIFICAÇÃO DO SOFTWARE

| Campo | Valor |
|-------|-------|
| **Nome Completo** | Histórico Acadêmico UFBA |
| **Nome Interno** | historico-universitario |
| **Versão Atual** | 2.4 (declarada como `2.0.0` no `package.json`, com versionamento semântico gerenciado via changelog interno) |
| **Data de Criação** | 2024 |
| **Última Atualização** | Março de 2026 (v2.4 — Grade Curricular) |
| **Autor** | Luís Antonio Souza Teixeira |
| **Vínculo Institucional** | Estudante do ICTI — Instituto de Ciência, Tecnologia e Inovação, Universidade Federal da Bahia (UFBA), Campus de Camaçari |
| **URL de Acesso Público** | https://historicoacademico.vercel.app |
| **Repositório de Código-Fonte** | https://github.com/LuisT-ls/Historico-Universitario |
| **Licença de Uso** | MIT License |
| **Plataforma de Hospedagem** | Vercel (infraestrutura em nuvem) |
| **Linguagem Principal** | TypeScript |
| **Framework Principal** | Next.js ^16.0.0 (App Router) |

> **Nota legal:** Este é um projeto acadêmico independente desenvolvido por estudante da Universidade Federal da Bahia (UFBA). O software não é um sistema oficial da instituição, operando de forma complementar ao sistema SIGAA sem qualquer integração direta com os servidores da UFBA. O projeto poderá ser hospedado em infraestrutura institucional mediante autorização formal da instituição.

---

## 2. DESCRIÇÃO GERAL

### 2.1 Objetivo e Finalidade

O **Histórico Acadêmico UFBA** é uma plataforma web moderna desenvolvida para auxiliar estudantes da Universidade Federal da Bahia na gestão completa de sua trajetória acadêmica. O software permite que o estudante importe seu histórico acadêmico oficial emitido pelo sistema SIGAA (Sistema Integrado de Gestão de Atividades Acadêmicas) em formato PDF, processe automaticamente as informações extraídas e apresente uma visão clara, interativa e atualizada de seu progresso rumo à conclusão do curso.

O sistema resolve uma lacuna importante no ecossistema acadêmico: o SIGAA, embora seja a fonte oficial de dados, não oferece ferramentas analíticas avançadas, visualizações interativas de grade curricular, cálculo em tempo real do Coeficiente de Rendimento (CR) ou estimativas de formatura. O Histórico Acadêmico UFBA complementa o SIGAA com essas capacidades.

### 2.2 Público-Alvo

O software é destinado, primariamente, aos estudantes dos seguintes cursos da UFBA — Campus de Camaçari:

| Curso | Identificador Interno | Carga Horária Total |
|-------|----------------------|---------------------|
| Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação (BICTI) | `BICTI` | 2.401 horas |
| Bacharelado em Engenharia de Produção | `ENG_PROD` | 3.750 horas |
| Bacharelado em Engenharia Elétrica | `ENG_ELET` | 3.910 horas |

A plataforma também pode ser utilizada, com funcionalidade parcial, por estudantes de outros cursos da UFBA que utilizem o sistema SIGAA.

### 2.3 Problema que o Software Resolve

Os estudantes da UFBA enfrentam as seguintes dificuldades no acompanhamento de sua vida acadêmica:

1. **Falta de visibilidade do progresso:** O SIGAA não exibe barras de progresso por natureza de disciplina (OB, OG, OX, OH, OZ, OP, AC, LV), dificultando a compreensão de quantas horas ainda faltam em cada categoria.
2. **Cálculo de CR opaco:** O Coeficiente de Rendimento é exibido no SIGAA sem transparência sobre a fórmula de cálculo ou histórico de evolução.
3. **Ausência de grade curricular interativa:** Não há uma visualização consolidada de quais disciplinas obrigatórias foram concluídas e quais ainda estão pendentes.
4. **Planejamento de horários sem suporte visual:** Os estudantes precisam organizar manualmente seus horários semanais.
5. **Gestão de atividades complementares:** Não há ferramenta integrada para registrar e acompanhar certificados de atividades complementares e seu impacto no progresso do curso.
6. **Planejamento de formatura:** Não há ferramenta que estime a conclusão do curso com base no ritmo atual do estudante.

### 2.4 Principais Benefícios

- **Importação automática de PDF:** Extração de todas as disciplinas do histórico SIGAA com um único upload de arquivo.
- **Cálculo instantâneo e transparente do CR:** Seguindo a fórmula oficial da UFBA, com exibição do histórico de evolução semestral.
- **Grade curricular interativa:** Visualização de todas as disciplinas obrigatórias e optativas organizadas por semestre, com status de aprovação em tempo real.
- **Grade de horários semanal:** Visualização da grade horária das disciplinas em curso com persistência em nuvem.
- **Gestão de certificados:** Registro de atividades complementares com impacto calculado automaticamente no progresso acadêmico.
- **Simulador de notas:** Ferramenta para planejamento de metas de CR.
- **Semestralização oficial:** Implementação fiel da fórmula de período letivo do SIGAA.
- **Perfil público compartilhável:** Link único para compartilhamento do progresso acadêmico com terceiros.
- **Exportação de dados:** Histórico acadêmico exportável em PDF, JSON e Excel (XLSX).
- **Sincronização em nuvem:** Dados acessíveis de qualquer dispositivo com conexão à internet.

---

## 3. ARQUITETURA DO SISTEMA

### 3.1 Visão Geral da Arquitetura

O sistema adota uma arquitetura de **aplicação web de página única com renderização no servidor** (*Server-Side Rendering / Static Site Generation*), baseada no padrão de componentes reativos. A aplicação é dividida em três camadas principais:

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                │
│        Next.js (^16.0.0) App Router + React 19           │
│    (components/, app/, Tailwind CSS, Shadcn/UI)         │
└────────────────────────┬───────────────────────────────-┘
                         │ Chamadas diretas via SDK
                         │ (sem API intermediária própria)
┌────────────────────────▼────────────────────────────────┐
│                    CAMADA DE SERVIÇOS                    │
│              services/ + lib/                           │
│   (firestore.service.ts, auth.service.ts,               │
│    storage.service.ts, calculations, pdf-parser)        │
└────────────────────────┬────────────────────────────────┘
                         │ Firebase Admin SDK /
                         │ Firebase Client SDK
┌────────────────────────▼────────────────────────────────┐
│                   CAMADA DE PERSISTÊNCIA                 │
│                  Firebase (Google Cloud)                 │
│        ┌─────────────┬──────────────┬─────────┐        │
│        │  Firestore  │  Auth        │ Storage │        │
│        │  (Banco)    │  (Identidade)│ (Files) │        │
│        └─────────────┴──────────────┴─────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Padrão Arquitetural

O projeto adota os seguintes padrões arquiteturais:

- **App Router do Next.js (^16.0.0):** Cada diretório em `app/` representa uma rota. O componente `page.tsx` dentro de cada diretório é o ponto de entrada da rota correspondente. Layouts compartilhados são definidos em `layout.tsx`.
- **Separação de responsabilidades em camadas:**
  - `app/` — Rotas e configuração de metadados (SEO, títulos de página)
  - `components/pages/` — Componentes de página completa (lógica de UI)
  - `components/features/` — Componentes de funcionalidade de domínio
  - `components/ui/` — Componentes de interface reutilizáveis (design system)
  - `services/` — Camada exclusiva de acesso ao Firebase (separação de I/O)
  - `lib/` — Utilitários, lógica de negócio, constantes e configurações
  - `types/` — Definições de tipos TypeScript
- **Camada de serviços centralizada:** Todo acesso ao Firebase é realizado exclusivamente através dos arquivos `services/`. Componentes de interface nunca importam o Firebase diretamente.
- **Context API do React:** Autenticação e estado do usuário são gerenciados globalmente através de um `AuthProvider` que utiliza `React.createContext`.

### 3.3 Fluxo Geral de Dados

```
[Usuário] → [Navegador Web]
     │
     ├─► [Next.js Middleware] ─► Injeção de CSP nonce
     │
     ├─► [App Router / Layout] ─► Renderização da página
     │         │
     │         ├─► [AuthProvider] ─► Firebase Auth SDK ─► [Firebase Auth]
     │         │         │
     │         │         └─► [Context de Usuário] ─► Disponível globalmente
     │         │
     │         └─► [Componente de Página]
     │                   │
     │                   ├─► [services/firestore.service] ─► [Firestore DB]
     │                   │         │
     │                   │         └─► Disciplinas, Perfil, Certificados
     │                   │
     │                   ├─► [services/auth.service] ─► [Firebase Auth]
     │                   │
     │                   ├─► [services/storage.service] ─► [Firebase Storage]
     │                   │
     │                   └─► [lib/pdf-parser] ─► Extração local do PDF
     │                             (processado no navegador via PDF.js)
     │
     └─► [CDN Vercel] ─► Assets estáticos (JS, CSS, imagens)
```

### 3.4 Estratégia de Autenticação e Controle de Sessão

O sistema utiliza exclusivamente o **Firebase Authentication** para gerenciamento de identidade. Duas estratégias de autenticação são suportadas:

1. **E-mail e Senha:** Cadastro com e-mail e senha, com suporte a redefinição de senha via link enviado ao e-mail.
2. **OAuth com Google:** Autenticação via conta Google (Google Identity Platform).

O controle de sessão é gerenciado pelo SDK do Firebase, que mantém o token JWT de autenticação no `IndexedDB` do navegador. O estado de autenticação é observado em tempo real pelo `AuthProvider` via `onAuthStateChanged`. Não há sessões gerenciadas no servidor; toda verificação de identidade ocorre no lado do cliente e é validada pelas **Firestore Security Rules** executadas no servidor do Firebase.

Para operações sensíveis (alteração de senha, exclusão de conta), o sistema exige **re-autenticação explícita** do usuário antes de prosseguir.

---

## 4. TECNOLOGIAS E DEPENDÊNCIAS

### 4.1 Linguagens de Programação

| Linguagem | Versão | Finalidade |
|-----------|--------|-----------|
| TypeScript | ^5.6.0 | Linguagem principal — tipagem estática em todo o projeto |
| JavaScript (ES2020) | — | Target de compilação do TypeScript |
| CSS (via Tailwind) | — | Estilização da interface |

### 4.2 Frameworks e Bibliotecas Principais

| Biblioteca | Versão | Finalidade |
|-----------|--------|-----------|
| `next` | ^16.0.0 | Framework web principal (App Router, SSR, SSG, middleware) |
| `react` | ^19.0.0 | Biblioteca de componentes reativos |
| `react-dom` | ^19.0.0 | Renderização React para o DOM |
| `firebase` | ^11.0.0 | SDK do Firebase (Auth, Firestore, Storage, Analytics) |
| `tailwindcss` | ^3.4.14 | Framework CSS utilitário |
| `@radix-ui/react-accordion` | ^1.2.12 | Componente de acordeão (Shadcn/UI) |
| `@radix-ui/react-dialog` | ^1.1.15 | Componente de modal/diálogo (Shadcn/UI) |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | Componente de menu suspenso (Shadcn/UI) |
| `@radix-ui/react-progress` | ^1.1.8 | Componente de barra de progresso (Shadcn/UI) |
| `recharts` | ^2.15.4 | Gráficos de linha, barras e pizza |
| `framer-motion` | ^12.23.26 | Animações de interface |
| `lucide-react` | ^0.454.0 | Ícones SVG |
| `exceljs` | ^4.4.0 | Geração de planilhas Excel (XLSX) |
| `jspdf` | ^4.2.0 | Geração de documentos PDF |
| `jspdf-autotable` | ^5.0.2 | Tabelas em documentos PDF |
| `pdfjs-dist` | ^5.4.530 | Extração de texto de arquivos PDF |
| `react-hook-form` | ^7.52.0 | Gerenciamento de formulários |
| `@hookform/resolvers` | ^3.9.0 | Integração react-hook-form com Zod |
| `zod` | ^3.23.8 | Validação de esquemas de dados |
| `date-fns` | ^3.6.0 | Manipulação e formatação de datas |
| `sonner` | ^2.0.7 | Notificações toast |
| `clsx` | ^2.1.1 | Utilitário para classes CSS condicionais |
| `tailwind-merge` | ^2.5.2 | Mesclagem inteligente de classes Tailwind |
| `class-variance-authority` | ^0.7.0 | Variantes de componentes com Tailwind |
| `@sentry/nextjs` | ^10.44.0 | Monitoramento de erros em produção |

### 4.3 Ferramentas de Desenvolvimento

| Ferramenta | Versão | Finalidade |
|-----------|--------|-----------|
| `typescript` | ^5.6.0 | Compilador TypeScript |
| `eslint` | ^9.0.0 | Linting estático do código |
| `eslint-config-next` | ^16.0.0 | Regras ESLint para projetos Next.js |
| `jest` | ^29.7.0 | Framework de testes unitários |
| `jest-environment-jsdom` | ^29.7.0 | Ambiente de simulação do DOM para testes |
| `@testing-library/react` | ^16.1.0 | Utilitários de teste para componentes React |
| `@testing-library/jest-dom` | ^6.6.3 | Matchers customizados para o DOM |
| `@testing-library/user-event` | ^14.5.2 | Simulação de eventos de usuário em testes |
| `@playwright/test` | ^1.48.0 | Testes end-to-end (E2E) |
| `postcss` | ^8.4.47 | Pós-processamento de CSS |
| `autoprefixer` | ^10.4.20 | Adição automática de prefixos CSS |
| `tailwindcss-animate` | ^1.0.7 | Plugin de animações para Tailwind CSS |

### 4.4 Banco de Dados e Serviços de Persistência

| Serviço | Produto Firebase | Finalidade |
|---------|-----------------|-----------|
| **Firebase Firestore** | Cloud Firestore (NoSQL) | Armazenamento principal de dados: disciplinas, certificados e perfis de usuário |
| **Firebase Authentication** | Firebase Auth | Gerenciamento de identidade e sessões de usuário |
| **Firebase Storage** | Cloud Storage for Firebase | Armazenamento de arquivos de certificados enviados pelos usuários |
| **Firebase Analytics** | Google Analytics for Firebase | Métricas de uso (carregamento lazy, somente em produção) |

### 4.5 Hospedagem e Deploy

| Serviço | Finalidade |
|---------|-----------|
| **Vercel** | Hospedagem da aplicação Next.js com CDN global, deploy contínuo e gerenciamento de variáveis de ambiente |
| **Google Cloud (Firebase)** | Infraestrutura de banco de dados, autenticação e armazenamento de arquivos |
| **Sentry** | Rastreamento de erros e monitoramento de desempenho em produção |

### 4.6 Ambiente de Execução

| Requisito | Versão |
|-----------|--------|
| Node.js | 22.x (definido em `.nvmrc` e `engines.node` no `package.json`) |
| NPM | Compatível com Node.js 22.x |

---

## 5. MÓDULOS E FUNCIONALIDADES

### 5.1 Módulo de Autenticação

**Arquivos principais:**
- `services/auth.service.ts`
- `components/auth-provider.tsx`
- `components/pages/login-page.tsx`
- `components/pages/register-page.tsx`
- `components/pages/forgot-password-page.tsx`
- `components/pages/reset-password-page.tsx`
- `app/login/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`

**Descrição funcional:**
Responsável por todo o ciclo de vida de identidade do usuário: cadastro, autenticação, recuperação de senha e exclusão de conta. O módulo abstrai as operações do Firebase Authentication e as expõe de forma segura ao restante da aplicação.

**Entradas:**
- E-mail e senha (autenticação por credenciais)
- Token OAuth (autenticação com Google)
- Código de verificação (`oobCode`) recebido por e-mail (redefinição de senha)

**Saídas:**
- Objeto `User` autenticado (uid, email, displayName, photoURL)
- Tokens JWT gerenciados internamente pelo Firebase SDK
- Erros tipados (`AppError`) mapeados para mensagens amigáveis ao usuário

**Regras de negócio:**
- Senhas devem atender aos requisitos mínimos do Firebase (mínimo 6 caracteres).
- A re-autenticação é obrigatória antes de operações de alteração de senha e exclusão de conta.
- Todas as operações de autenticação passam pelo mapeamento de erros em `lib/error-handler.ts`, que converte os códigos de erro do Firebase em mensagens compreensíveis em português.
- O estado de autenticação é mantido globalmente via `AuthProvider` (React Context), eliminando a necessidade de verificação manual em cada componente.

**Operações disponíveis:**

| Função | Descrição |
|--------|-----------|
| `signInWithEmail(email, password)` | Autenticação por e-mail e senha |
| `signInWithGoogle()` | Autenticação OAuth com conta Google |
| `signUp(email, password, displayName?)` | Criação de nova conta |
| `signOut()` | Encerramento da sessão |
| `resetPassword(email, actionCodeSettings?)` | Envio de e-mail de redefinição |
| `confirmPasswordReset(oobCode, newPassword)` | Confirmação da nova senha |
| `verifyPasswordResetCode(oobCode)` | Validação do código de redefinição |
| `updatePassword(oldPassword, newPassword)` | Alteração de senha (com re-auth) |
| `reauthenticate(email, password)` | Re-autenticação explícita |
| `updateUserProfile(data)` | Atualização do displayName e photoURL no Firebase Auth |
| `deleteUserAccount()` | Exclusão permanente da conta |

---

### 5.2 Módulo de Perfil de Usuário

**Arquivos principais:**
- `services/firestore.service.ts` (funções de perfil)
- `components/pages/profile-page.tsx`
- `app/profile/page.tsx`

**Descrição funcional:**
Gerencia as informações acadêmicas e preferências do usuário armazenadas no Firestore. O perfil é criado automaticamente no primeiro login do usuário e pode ser editado a qualquer momento.

**Entradas:**
- Dados do perfil: nome, e-mail, curso, matrícula, instituição, ano e semestre de ingresso
- Configurações de privacidade: visibilidade do perfil e da grade de horários
- Número de suspensões (trancamentos totais) para cálculo de semestralização

**Saídas:**
- Documento de perfil atualizado no Firestore
- Dados do perfil disponíveis globalmente para cálculos de semestralização

**Regras de negócio:**
- O campo `uid` é imutável após a criação do documento.
- As configurações de privacidade controlam quais dados são visíveis no perfil público (`/u/[userId]`).
- O campo `suspensions` (número de períodos de suspensão) é utilizado no cálculo de semestralização.
- O campo `startYear` e `startSemester` definem o semestre de ingresso, base para o cálculo do total de semestres cursados.

---

### 5.3 Módulo de Importação de PDF (Parser SIGAA)

**Arquivos principais:**
- `lib/pdf-parser.ts`
- `components/features/action-bar.tsx` (acionamento da importação)

**Descrição funcional:**
Realiza a extração e interpretação do histórico acadêmico do estudante a partir de um arquivo PDF emitido pelo sistema SIGAA da UFBA. Todo o processamento ocorre no navegador do usuário (client-side), sem transmissão do arquivo para servidores externos.

**Entradas:**
- Arquivo PDF do histórico acadêmico emitido pelo SIGAA

**Saídas:**
- Lista de objetos `Disciplina` prontos para inserção no Firestore
- Lista de avisos (`avisos`) sobre disciplinas não reconhecidas ou fora do catálogo

**Regras de negócio:**
- O parser utiliza a biblioteca `pdfjs-dist` (PDF.js) para extração do texto bruto do PDF.
- Após a extração, o texto é processado por expressões regulares que identificam linhas de disciplina no formato do SIGAA.
- **Limpeza de nomes:** Nomes de disciplinas com professor acrescido são truncados para o nome canônico.
- **Limpeza de códigos:** O sufixo de turma (ex: letra `A` no final) é removido dos códigos de componentes curriculares.
- **Mapeamento de situações SIGAA:** As situações textuais do SIGAA (`APR`, `REP`, `REPF`, `REPMF`, `TRANC`, `CANC`, `DISP`, `CUMP`, `TRANS`, `INCORP`, `MATR`) são mapeadas para os tipos internos do sistema (`AP`, `RR`, `TR`, `DP`).
- **Inferência de natureza:** Caso a natureza da disciplina não conste no PDF, o sistema consulta o catálogo (`assets/data/disciplinas.json`) para inferir o tipo correto.
- **Deduplicação:** Disciplinas duplicadas dentro do mesmo PDF (mesma disciplina cursada mais de uma vez) são consolidadas, mantendo apenas o registro mais relevante.
- **Deduplicação com o banco:** Disciplinas já existentes no Firestore do usuário são ignoradas na importação.

**Situações mapeadas:**

| Situação SIGAA | Resultado Interno |
|----------------|------------------|
| APR, CUMP, INCORP, TRANS | AP (Aprovado) |
| REP, REPF, REPMF | RR (Reprovado) |
| TRANC | TR (Trancamento) |
| CANC | — (Ignorado) |
| DISP | DP (Dispensado) |
| MATR | emcurso: true |

---

### 5.4 Módulo de Disciplinas (Histórico Acadêmico)

**Arquivos principais:**
- `services/firestore.service.ts` (funções de disciplinas)
- `components/features/academic-history.tsx`
- `components/features/discipline-form.tsx`
- `components/features/discipline-search.tsx`
- `assets/data/disciplinas.json`
- `assets/data/matrizes.json`

**Descrição funcional:**
Módulo central do sistema. Gerencia o conjunto completo de disciplinas do estudante — aprovadas, reprovadas, trancadas, dispensadas e em curso — com operações de criação, leitura, atualização e exclusão (CRUD) sincronizadas em tempo real com o Firestore.

**Entradas:**
- Dados da disciplina: período, código, nome, natureza, carga horária (CH), nota, status (trancamento, dispensa, em curso)
- Filtros de busca: período, natureza, situação

**Saídas:**
- Lista de disciplinas renderizada com filtros aplicados
- Dados alimentando os módulos de Resumo, Grade Curricular, Simulador e Recomendações

**Regras de negócio:**
- O campo `resultado` é calculado automaticamente pela função `calcularResultado()` com base nos campos `nota`, `trancamento`, `dispensada` e `emcurso`.
- Disciplinas com `trancamento = true` têm resultado `TR` independentemente da nota.
- Disciplinas com `dispensada = true` têm resultado `DP` e não são contabilizadas no CR.
- Disciplinas marcadas como `emcurso = true` aparecem automaticamente na grade de horários.
- A nota mínima para aprovação é **5,0** (constante `NOTA_MINIMA_APROVACAO`).
- Cada crédito acadêmico equivale a **15 horas** de carga horária (constante `CH_POR_CREDITO`).

**Operações CRUD:**

| Operação | Função no Serviço | Descrição |
|----------|-----------------|-----------|
| Listar | `getDisciplines(userId)` | Recupera todas as disciplinas do usuário |
| Criar | `addDiscipline(disciplina, userId)` | Adiciona uma nova disciplina |
| Atualizar | `updateDiscipline(id, data)` | Atualiza dados de uma disciplina existente |
| Excluir | `deleteDiscipline(id)` | Remove uma disciplina |

---

### 5.5 Módulo de Resumo Acadêmico (Cálculo de CR e Progresso)

**Arquivos principais:**
- `lib/utils/calculations.ts`
- `lib/utils/statistics.ts`
- `components/features/summary.tsx`
- `components/features/charts/line-chart-summary.tsx`
- `components/features/charts/bar-chart-summary.tsx`
- `components/features/charts/pie-chart-summary.tsx`

**Descrição funcional:**
Calcula e exibe as métricas acadêmicas consolidadas do estudante: CR (Coeficiente de Rendimento), horas por natureza, progresso por categoria e evolução semestral do desempenho.

**Entradas:**
- Lista de disciplinas do usuário
- Configuração do curso (`ConfigCurso` com requisitos por natureza)
- Certificados aprovados (para contabilização de horas de AC)
- Perfil do usuário (para cálculo de semestralização)

**Saídas:**
- CR calculado (número decimal com 2 casas)
- Horas por natureza (com redistribuição de excedentes para `LV`)
- Status do CR (excelente / bom / regular / atenção)
- Semestralização atual
- Dados para os gráficos de linha, barras e pizza

**Regras de negócio do Cálculo de CR:**
- **Fórmula:** `CR = Σ(nota × CH) / Σ(CH)` para todas as disciplinas válidas.
- **Disciplinas excluídas do CR:**
  - Disciplinas com `dispensada = true`
  - Disciplinas com natureza `AC` (Atividade Complementar)
  - Disciplinas com `trancamento = true`
  - Disciplinas marcadas como `emcurso = true`
  - Disciplinas sem nota válida
- **Disciplinas incluídas:** Apenas com resultado `AP` (aprovado) ou `RR` (reprovado).

**Regras de negócio do Cálculo de Horas por Natureza:**
1. Somar horas das disciplinas concluídas (`AP` ou `dispensada`).
2. Adicionar horas dos certificados com `status = 'aprovado'` às horas de `AC`.
3. Calcular excedentes: se um categoria ultrapassar seu limite, o excedente é transferido para `LV`.
4. Aplicar os limites máximos definidos em `ConfigCurso.metadata.limites`.

**Regras de negócio da Semestralização:**
- **Fórmula:** `Semestralização = (Total de Semestres Cursados) − (Número de Suspensões) + (Perfil Inicial)`
- **Total de Semestres:** Calculado com base na data de ingresso e a data atual.
- **Suspensões:** Informadas manualmente pelo usuário no perfil.
- **Perfil Inicial:** Número de semestres em que o estudante aproveitou ≥ 75% das horas optativas da matriz curricular.

---

### 5.6 Módulo de Grade Curricular

**Arquivos principais:**
- `components/features/curriculum-map.tsx`
- `components/pages/grade-page.tsx`
- `app/grade/page.tsx`
- `assets/data/matrizes.json`
- `assets/data/disciplinas.json`

**Descrição funcional:**
Exibe a grade curricular completa do curso selecionado, organizando todas as disciplinas por semestre e por natureza, com indicação visual do status de cada disciplina (aprovada, em curso, pendente).

**Entradas:**
- Curso selecionado pelo usuário
- Lista de disciplinas cadastradas no histórico do usuário
- Arquivo `matrizes.json` (estrutura de semestres e disciplinas por curso)
- Arquivo `disciplinas.json` (catálogo de nomes e cargas horárias)

**Saídas:**
- Visualização tabular da grade por semestre (aba Obrigatórias)
- Visualização por natureza (abas: OP/OX/OG, AC/OZ, LV)
- Nota e período da aprovação em cada célula da grade

**Regras de negócio — Matching de disciplinas em três camadas:**
1. **Correspondência exata de código:** O código da disciplina no histórico é comparado diretamente com o código no catálogo.
2. **Correspondência por prefixo de turma:** O código do catálogo é prefixo do código no histórico (ex: `CTIA10` corresponde a `CTIA10B`).
3. **Correspondência por nome canônico:** O nome da disciplina no histórico é comparado com o nome no catálogo após normalização (remoção de acentos, conversão para maiúsculas).

**Nota exibida:** Sempre a nota da tentativa **aprovada** mais recente, ignorando reprovações e trancamentos anteriores para a mesma disciplina.

---

### 5.7 Módulo de Grade de Horários

**Arquivos principais:**
- `components/pages/horarios-page.tsx`
- `components/pages/public-horarios-page.tsx`
- `app/horarios/page.tsx`
- `app/u/[userId]/horarios/page.tsx`
- `services/firestore.service.ts` (funções `updateHorarioCodes`, `getHorarioCodes`)

**Descrição funcional:**
Exibe a grade horária semanal das disciplinas atualmente em curso, com suporte ao formato de código de horário padrão da UFBA. A grade é persistida no Firebase e pode ser tornada pública para visualização por terceiros.

**Entradas:**
- Disciplinas marcadas como `emcurso = true`
- Códigos de horário no formato UFBA (ex: `24M12`, `46T56`)

**Saídas:**
- Grade visual de segunda a sábado, com slots de 07:00 às 22:10
- Células com `rowspan` automático para disciplinas que ocupam múltiplos slots

**Formato do código de horário UFBA:**
- **Dígitos 1–N:** Dias da semana (2=Segunda, 3=Terça, 4=Quarta, 5=Quinta, 6=Sexta, 7=Sábado)
- **Letra:** Turno (M=Manhã, T=Tarde, N=Noite)
- **Dígitos finais:** Slots de horário dentro do turno

**Exemplo:** `46T56` → Quarta-feira e Sexta-feira, Tarde, slots 5 e 6.

---

### 5.8 Módulo de Certificados (Atividades Complementares)

**Arquivos principais:**
- `services/firestore.service.ts` (funções de certificados)
- `components/features/certificados/` (diretório com 16 arquivos)
- `components/pages/certificados-page.tsx`
- `app/certificados/page.tsx`

**Descrição funcional:**
Permite ao estudante registrar e gerenciar comprovantes de atividades complementares (certificados, declarações de participação, etc.) e acompanhar o impacto dessas horas no progresso do curso.

**Entradas:**
- Dados do certificado: título, tipo, instituição, carga horária, datas de início e fim, descrição, arquivo PDF ou URL externa
- Filtros: tipo de atividade, status, intervalo de datas

**Saídas:**
- Lista de certificados com filtros aplicados
- Estatísticas de horas por tipo de atividade
- Impacto no progresso de Atividades Complementares (AC)

**Tipos de certificado suportados:**

| Tipo | Descrição |
|------|-----------|
| `curso` | Cursos externos com carga horária |
| `workshop` | Oficinas e workshops |
| `palestra` | Participação em palestras |
| `evento` | Participação em eventos acadêmicos |
| `congresso` | Congressos e conferências |
| `projeto` | Projetos de extensão ou pesquisa |
| `pesquisa` | Iniciação científica e pesquisa |
| `monitoria` | Monitoria em disciplinas |
| `estagio` | Estágio supervisionado |
| `outro` | Outras atividades não categorizadas |

**Status do certificado:**

| Status | Descrição |
|--------|-----------|
| `pendente` | Aguardando análise ou validação manual |
| `aprovado` | Aceito e contabilizado nas horas de AC |
| `reprovado` | Não aceito; não contabilizado |

**Regras de negócio:**
- Apenas certificados com `status = 'aprovado'` são somados às horas de Atividades Complementares.
- O upload de arquivo é opcional; o usuário pode fornecer apenas um link externo.
- O armazenamento de arquivos é feito no Firebase Storage com acesso restrito ao proprietário.

---

### 5.9 Módulo Simulador de Notas

**Arquivos principais:**
- `app/simulador/simulador-client.tsx`
- `app/simulador/page.tsx`
- `lib/utils/predictions.ts`

**Descrição funcional:**
Permite ao estudante simular diferentes cenários de notas para planejar metas de CR. O simulador calcula qual nota mínima é necessária nas disciplinas em curso para atingir um determinado CR alvo.

**Entradas:**
- CR atual calculado
- Disciplinas em curso (nome, CH)
- CR alvo desejado

**Saídas:**
- Nota necessária por disciplina para atingir o CR alvo
- Estimativa de semestres restantes para conclusão do curso

**Regras de negócio:**
- O cálculo respeita a mesma fórmula de CR (média ponderada por CH) utilizada no módulo de Resumo Acadêmico.
- Notas simuladas não são persistidas no banco de dados.

---

### 5.10 Módulo de Perfil Público

**Arquivos principais:**
- `components/pages/public-profile-page.tsx`
- `components/pages/public-horarios-page.tsx`
- `app/u/[userId]/page.tsx`
- `app/u/[userId]/horarios/page.tsx`

**Descrição funcional:**
Permite que o estudante compartilhe uma visão somente leitura de seu histórico acadêmico com terceiros (recrutadores, professores, colegas) mediante configuração de privacidade.

**Entradas:**
- `userId` como parâmetro dinâmico de rota

**Saídas:**
- Perfil público com CR, horas por natureza, disciplinas aprovadas e certificados (se o perfil estiver configurado como público)
- Grade de horários pública (se a privacidade de horários estiver configurada como pública)
- Página 404 ou conteúdo vazio se o perfil for privado

**Regras de negócio:**
- O perfil só é exibível se `settings.privacy = 'public'` no documento do usuário.
- A grade de horários só é exibível se `settings.schedulePrivacy = 'public'`.
- As Firestore Security Rules validam essas condições no servidor, impedindo acesso direto à coleção mesmo via SDK.

---

### 5.11 Módulo de Exportação e Importação de Dados

**Arquivos principais:**
- `lib/export-utils.ts`
- `components/features/action-bar.tsx`
- `components/features/print-view.tsx`

**Descrição funcional:**
Permite exportar o histórico acadêmico em múltiplos formatos para uso externo ou backup, e importar dados via PDF do SIGAA.

**Formatos de exportação suportados:**

| Formato | Descrição |
|---------|-----------|
| PDF | Modo de impressão nativo do navegador (`window.print()`) com layout otimizado |
| JSON | Backup completo dos dados em formato estruturado |
| XLSX | Planilha Excel com aba de resumo e abas por semestre |

**Estrutura do arquivo XLSX exportado:**
- Aba "Resumo": CR, total de horas, horas por natureza, semestralização
- Uma aba por período cursado: lista de disciplinas com código, nome, natureza, CH, nota e resultado

---

### 5.12 Módulo de Recomendações de Disciplinas

**Arquivos principais:**
- `components/features/recommendations.tsx`
- `lib/utils/predictions.ts`

**Descrição funcional:**
Analisa o histórico do estudante e sugere as próximas disciplinas a serem cursadas, com base nos déficits de horas por categoria e na sequência lógica do currículo.

**Entradas:**
- Lista de disciplinas do usuário (aprovadas, em curso, pendentes)
- Configuração de requisitos do curso (`ConfigCurso`)

**Saídas:**
- Lista de disciplinas recomendadas, ordenadas por prioridade
- Badges indicando o déficit de horas por categoria

**Regras de negócio:**
- O painel é **ocultado automaticamente** quando as disciplinas em curso já cobrem todos os déficits restantes.
- A progressão sequencial é detectada: se Cálculo I está aprovado, recomenda Cálculo II.
- O sistema suporta progressão por numerais romanos (I→II→III) e por letras (A→B→C→D).

---

## 6. MODELO DE DADOS

### 6.1 Visão Geral das Coleções no Firestore

O banco de dados utiliza o **Cloud Firestore** (banco NoSQL orientado a documentos). A estrutura é composta por três coleções principais, todas no nível raiz do banco de dados:

```
Firestore Root
├── users/                    # Perfis de usuário
│   └── {userId}/             # Documento por usuário (UID do Firebase Auth)
├── disciplines/              # Disciplinas do histórico acadêmico
│   └── {disciplineId}/       # Documento por disciplina
└── certificados/             # Certificados de atividades complementares
    └── {certificadoId}/      # Documento por certificado
```

### 6.2 Coleção `users` — Perfil do Usuário

Armazena as informações acadêmicas e preferências de cada usuário.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `uid` | `string` (UserId) | Sim | Identificador único do usuário (igual ao UID do Firebase Auth) |
| `nome` | `string` | Não | Nome completo do usuário (campo do modelo TypeScript `Profile`) |
| `name` | `string` | Sim¹ | Campo validado pelas Firestore Security Rules na operação `write` (1–100 caracteres) |
| `email` | `string` | Não | Endereço de e-mail |
| `photoURL` | `string` | Não | URL da foto de perfil |
| `curso` | `'BICTI' \| 'ENG_PROD' \| 'ENG_ELET'` | Não | Código do curso matriculado |
| `matricula` | `string` | Não | Número de matrícula na UFBA |
| `institution` | `string` | Não | Nome da instituição de ensino |
| `startYear` | `string \| number` | Não | Ano de ingresso no curso |
| `startSemester` | `'1' \| '2'` | Não | Semestre de ingresso (1º ou 2º semestre) |
| `settings.notifications` | `boolean` | Não | Preferência de notificações |
| `settings.privacy` | `'private' \| 'public'` | Não | Visibilidade do perfil |
| `settings.schedulePrivacy` | `'private' \| 'public'` | Não | Visibilidade da grade de horários |
| `suspensions` | `number` | Não | Número de períodos de suspensão (trancamentos totais) |
| `currentSemester` | `string` | Não | Semestre atual calculado (ex: `2025.2`) |
| `createdAt` | `Timestamp` | Não | Data de criação do documento |
| `updatedAt` | `Timestamp` | Não | Data da última atualização |

> ¹ **Nota de inconsistência:** A Firestore Security Rule para a coleção `users` valida o campo `name` (`request.resource.data.name`, em inglês), enquanto a interface TypeScript `Profile` declara o campo equivalente como `nome` (em português). O campo `name` deve estar presente no documento gravado no Firestore para que a regra de escrita seja satisfeita. Esta inconsistência está documentada como encontrada no código-fonte (`firestore.rules` linha 27 vs. `types/index.ts` interface `Profile`).

### 6.3 Coleção `disciplines` — Disciplinas do Histórico

Armazena cada componente curricular cursado, em curso ou trancado pelo estudante.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (DisciplinaId) | Gerado | Identificador único do documento no Firestore |
| `userId` | `string` (UserId) | Sim | UID do usuário proprietário (imutável após criação) |
| `periodo` | `string` | Sim | Período letivo (ex: `2024.1`, `2025.2`) |
| `codigo` | `string` | Sim | Código do componente curricular |
| `nome` | `string` | Sim | Nome do componente curricular (1–200 caracteres) |
| `natureza` | `'AC' \| 'LV' \| 'OB' \| 'OG' \| 'OH' \| 'OP' \| 'OX' \| 'OZ'` | Sim | Natureza acadêmica da disciplina |
| `ch` | `number` | Sim | Carga horária em horas |
| `nota` | `number` | Sim | Nota obtida (0–10) |
| `trancamento` | `boolean` | Não | `true` se a disciplina foi trancada |
| `dispensada` | `boolean` | Não | `true` se a disciplina foi dispensada por aproveitamento |
| `emcurso` | `boolean` | Não | `true` se a disciplina está sendo cursada no período atual |
| `resultado` | `'AP' \| 'RR' \| 'TR' \| 'DP'` | Calculado | Resultado calculado automaticamente |
| `curso` | `'BICTI' \| 'ENG_PROD' \| 'ENG_ELET'` | Não | Curso ao qual a disciplina pertence |
| `createdAt` | `Timestamp` | Não | Data de cadastro |
| `updatedAt` | `Timestamp` | Não | Data da última atualização |

**Legenda de resultados:**

| Código | Descrição |
|--------|-----------|
| `AP` | Aprovado |
| `RR` | Reprovado |
| `TR` | Trancamento |
| `DP` | Dispensado |

### 6.4 Coleção `certificados` — Atividades Complementares

Armazena os comprovantes de atividades complementares registrados pelo estudante.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (CertificadoId) | Gerado | Identificador único do documento |
| `userId` | `string` (UserId) | Sim | UID do usuário proprietário (imutável após criação) |
| `titulo` | `string` | Sim | Título da atividade (1–300 caracteres) |
| `tipo` | `TipoCertificado` | Sim | Tipo da atividade complementar |
| `instituicao` | `string` | Sim | Instituição promotora da atividade |
| `cargaHoraria` | `number` | Sim | Carga horária da atividade em horas |
| `dataInicio` | `string` | Sim | Data de início (formato `DD/MM/AAAA`) |
| `dataFim` | `string` | Sim | Data de término (formato `DD/MM/AAAA`) |
| `descricao` | `string` | Não | Descrição detalhada da atividade |
| `arquivoURL` | `string` | Não | URL do arquivo do certificado no Firebase Storage |
| `nomeArquivo` | `string` | Não | Nome original do arquivo enviado |
| `linkExterno` | `string` | Não | URL externa do certificado online |
| `status` | `'pendente' \| 'aprovado' \| 'reprovado'` | Sim | Status de validação do certificado |
| `dataCadastro` | `string` | Sim | Data de cadastro no sistema (formato `DD/MM/AAAA`) |
| `createdAt` | `Timestamp` | Não | Timestamp de criação |
| `updatedAt` | `Timestamp` | Não | Timestamp da última atualização |

### 6.5 Relacionamentos entre Entidades

```
users/{userId}
    │
    ├── [1:N] disciplines/{disciplineId}
    │         └── userId == users.uid
    │
    └── [1:N] certificados/{certificadoId}
              └── userId == users.uid
```

A relação entre entidades é estabelecida pelo campo `userId` presente em `disciplines` e `certificados`, que referencia o `uid` do documento em `users`. Não há subcoleções; todas as coleções são flat (nível raiz), com filtros por `userId` aplicados nas consultas.

### 6.6 Regras de Segurança (Firestore Security Rules)

As regras de segurança são definidas no arquivo `firestore.rules` e aplicadas pelo servidor do Firebase, sendo independentes do código da aplicação:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Verifica se o perfil do usuário é público
    function isPublic(userId) {
      let data = get(/databases/$(database)/documents/users/$(userId)).data;
      return 'settings' in data
          && 'privacy' in data.settings
          && data.settings.privacy == 'public';
    }

    // Verifica se a grade de horários do usuário é pública
    function isSchedulePublic(userId) {
      let data = get(/databases/$(database)/documents/users/$(userId)).data;
      return 'settings' in data
          && 'schedulePrivacy' in data.settings
          && data.settings.schedulePrivacy == 'public';
    }

    // Valida que um campo é uma string dentro de limites de tamanho
    function isValidString(val, min, max) {
      return val is string && val.size() >= min && val.size() <= max;
    }

    // Coleção 'users'
    match /users/{userId} {
      allow read: if (request.auth != null && request.auth.uid == userId)
               || isPublic(userId) || isSchedulePublic(userId);
      allow write: if request.auth != null
                && request.auth.uid == userId
                && isValidString(request.resource.data.name, 1, 100);
    }

    // Coleção 'disciplines'
    match /disciplines/{disciplineId} {
      allow read: if (request.auth != null
                     && request.auth.uid == resource.data.userId)
               || isPublic(resource.data.userId)
               || isSchedulePublic(resource.data.userId);
      allow create: if request.auth != null
                   && request.auth.uid == request.resource.data.userId
                   && isValidString(request.resource.data.nome, 1, 200);
      allow update: if request.auth != null
                   && request.auth.uid == resource.data.userId
                   && isValidString(request.resource.data.nome, 1, 200)
                   && request.resource.data.ch is number
                   && request.resource.data.userId == resource.data.userId;
      allow delete: if request.auth != null
                   && request.auth.uid == resource.data.userId;
    }

    // Coleção 'certificados'
    match /certificados/{certificadoId} {
      allow read: if (request.auth != null
                     && request.auth.uid == resource.data.userId)
               || isPublic(resource.data.userId);
      allow create: if request.auth != null
                   && request.auth.uid == request.resource.data.userId
                   && isValidString(request.resource.data.titulo, 1, 300);
      allow update: if request.auth != null
                   && request.auth.uid == resource.data.userId
                   && isValidString(request.resource.data.titulo, 1, 300)
                   && request.resource.data.cargaHoraria is number
                   && request.resource.data.userId == resource.data.userId;
      allow delete: if request.auth != null
                   && request.auth.uid == resource.data.userId;
    }

    // Bloqueio global: nenhum outro documento é acessível
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Princípios de segurança implementados nas regras:**
- **Isolamento por usuário:** Cada usuário acessa exclusivamente seus próprios dados.
- **Imutabilidade do `userId`:** O campo `userId` não pode ser alterado após a criação (`resource.data.userId == request.resource.data.userId` na operação de update).
- **Validação de tipos no servidor:** O tipo de campos críticos (`ch is number`, `cargaHoraria is number`) é verificado no servidor.
- **Validação de tamanho de strings:** Nomes de disciplinas e títulos de certificados têm tamanho mínimo e máximo validados.
- **Bloqueio padrão:** A regra `match /{document=**}` bloqueia todas as coleções não explicitamente permitidas.

---

## 7. FLUXOS PRINCIPAIS DO SISTEMA

### 7.1 Fluxo de Cadastro e Autenticação do Usuário

```
1. Acesso Inicial
   └─► Usuário acessa https://historicoacademico.vercel.app
   └─► Middleware injeta nonce CSP na resposta
   └─► Landing page é renderizada (pública, sem autenticação)

2. Cadastro (novo usuário)
   ├─► Usuário clica em "Cadastrar" → rota /register
   ├─► Preenche e-mail, senha e nome
   ├─► Cliente chama auth.service.signUp(email, password, displayName)
   ├─► Firebase Authentication cria a conta
   ├─► AuthProvider detecta novo usuário via onAuthStateChanged
   ├─► Sistema verifica se documento em users/{uid} existe
   ├─► Se não existe → cria documento de perfil com valores padrão
   └─► Usuário redirecionado para a página principal (/profile)

3. Login (usuário existente)
   ├─► Usuário acessa /login
   ├─► Opção A: E-mail + Senha
   │   ├─► auth.service.signInWithEmail(email, password)
   │   └─► Firebase valida credenciais e retorna JWT
   ├─► Opção B: Google OAuth
   │   ├─► auth.service.signInWithGoogle()
   │   ├─► Popup de autenticação Google
   │   └─► Firebase retorna token OAuth
   ├─► AuthProvider atualiza estado global do usuário
   └─► Usuário redirecionado para a página principal

4. Recuperação de Senha
   ├─► Usuário acessa /forgot-password
   ├─► Informa e-mail → auth.service.resetPassword(email)
   ├─► Firebase envia e-mail com link de redefinição
   ├─► Usuário clica no link → redirecionado para /reset-password?oobCode=...
   ├─► auth.service.verifyPasswordResetCode(oobCode) valida o código
   ├─► Usuário define nova senha
   └─► auth.service.confirmPasswordReset(oobCode, newPassword)

5. Encerramento de Sessão
   └─► auth.service.signOut() → Firebase invalida a sessão local
```

### 7.2 Fluxo de Importação de Histórico via PDF

```
1. Usuário logado clica em "Importar PDF" na barra de ações
2. Seletor de arquivo nativo do navegador é exibido
3. Usuário seleciona o PDF do histórico emitido pelo SIGAA

4. Processamento no cliente (lib/pdf-parser.ts):
   4.1. pdfjs-dist extrai o texto bruto do PDF
   4.2. Regex processa linha por linha, identificando:
        - Período letivo (ex: "2024.1")
        - Código da disciplina (ex: "CTIA04")
        - Nome da disciplina
        - Natureza (AC, OB, OG, etc.)
        - Carga horária (CH)
        - Nota
        - Situação (APR, REP, TRANC, etc.)
   4.3. Situações são mapeadas para resultados internos
   4.4. Naturezas ausentes são inferidas do catálogo (disciplinas.json)
   4.5. Nomes são limpos (remoção de nomes de professores)
   4.6. Códigos são normalizados (remoção de sufixos de turma)
   4.7. Duplicatas internas ao PDF são eliminadas

5. Deduplicação com o banco de dados:
   5.1. Sistema busca disciplinas já existentes no Firestore
   5.2. Disciplinas já cadastradas são filtradas da importação

6. Inserção em lote:
   6.1. Novas disciplinas são inseridas via addDiscipline()
   6.2. Cada disciplina é salva como documento independente em disciplines/
   6.3. Toast de confirmação exibe: X disciplinas importadas, Y ignoradas

7. Interface atualiza automaticamente com os novos dados
```

### 7.3 Fluxo de Cálculo de Progresso e Coeficiente

```
1. Trigger: Qualquer alteração na lista de disciplinas ou certificados

2. Filtragem para cálculo do CR:
   └─► Excluir: dispensadas, AC, trancamentos, emcurso, sem nota válida
   └─► Incluir: disciplinas com resultado AP ou RR

3. Cálculo do CR:
   CR = Σ(nota_i × ch_i) / Σ(ch_i)  para todas as disciplinas válidas

4. Cálculo de horas por natureza:
   4.1. Para cada natureza N: soma CH das disciplinas com resultado AP
        ou dispensada = true
   4.2. Adicionar horas de certificados aprovados à natureza AC
   4.3. Calcular excedentes em relação aos limites do curso
   4.4. Transferir excedentes para LV (até o limite máximo de LV)
   4.5. Aplicar caps finais dos limites definidos em ConfigCurso

5. Cálculo de semestralização:
   5.1. totalSemestres = semestres desde startYear/startSemester até hoje
   5.2. Semestralização = totalSemestres - suspensions + perfilInicial

6. Atualização da interface:
   └─► Summary renderiza novo CR com classe de status
   └─► Gráficos de barras atualizam progresso por natureza
   └─► Gráfico de linha atualiza evolução semestral do CR
```

**Fórmula do Coeficiente de Rendimento (CR) — implementação em `lib/utils/calculations.ts`:**

```
CR = Σ(CHᵢ × notaᵢ) / Σ(CHᵢ)
```

Onde o conjunto de disciplinas válidas `i` é definido pelo filtro (todos os critérios devem ser satisfeitos):

| Condição | Descrição |
|----------|-----------|
| `!dispensada` | Disciplinas com dispensa/aproveitamento são excluídas |
| `natureza !== 'AC'` | Atividades Complementares não entram no CR |
| `nota ∈ [0, 10]` | Nota deve ser um valor numérico válido |
| `ch > 0` | Carga horária deve ser positiva |
| `!trancamento` | Disciplinas trancadas (TR) são excluídas |
| `!emcurso` | Disciplinas ainda em curso são excluídas |

> Disciplinas **aprovadas (AP) e reprovadas (RR)** são igualmente incluídas no cálculo do CR, pois o filtro opera sobre os campos primitivos e não sobre o campo calculado `resultado`. Notas de reprovação (abaixo de 5,0) são, portanto, contabilizadas e reduzem o CR.

**Fórmula de Semestralização — implementação em `lib/utils/calculations.ts`:**

```
Semestralização = max(1, totalSemestres − suspensões + perfilInicial)
```

Onde:
- `totalSemestres` = número de semestres decorridos desde `startYear.startSemester` até o período atual
- `suspensões` = valor do campo `profile.suspensions` (informado manualmente pelo usuário)
- `perfilInicial` = número de semestres consecutivos da matriz em que o estudante aproveitou ≥ 75% da CH obrigatória via dispensas/transferências (função `calcularPerfilInicial`)
- O resultado mínimo é sempre **1** (`Math.max(1, ...)`)

### 7.4 Fluxo do Simulador de Notas ("E Se?")

```
1. Usuário acessa /simulador
2. Sistema carrega disciplinas em curso do histórico

3. Para cada disciplina em curso:
   3.1. Usuário informa a nota hipotética desejada
   3.2. Sistema recalcula o CR simulado em tempo real:
        CR_simulado = (CR_atual × CH_atual + Σ(nota_hip_i × ch_i)) /
                      (CH_atual + Σ(ch_i_em_curso))

4. Usuário pode definir uma meta de CR alvo:
   4.1. Sistema calcula qual nota mínima é necessária em cada disciplina
        para atingir o CR alvo
   4.2. Exibe recomendações de metas por disciplina

5. Nenhum dado é persistido no banco — cálculo apenas em memória
```

### 7.5 Fluxo de Registro de Certificados e Impacto no Progresso

```
1. Usuário acessa /certificados
2. Clica em "Adicionar Certificado"

3. Preenchimento do formulário:
   3.1. Título, tipo, instituição, carga horária, datas
   3.2. Opcional: upload de arquivo ou URL externa
   3.3. Validação de campos via react-hook-form + Zod

4. Envio:
   4.1. Se arquivo foi selecionado:
        - storage.service.uploadFile() envia para Firebase Storage
        - URL de download é armazenada no campo arquivoURL
   4.2. firestore.service.addCertificate() cria documento em certificados/

5. Impacto no progresso:
   5.1. Certificados com status = 'aprovado' são somados automaticamente
        às horas de AC no cálculo de horas por natureza
   5.2. O painel de Resumo reflete o novo total de horas de AC em tempo real

6. Visualização e filtros:
   6.1. Usuário pode filtrar por tipo, status, intervalo de datas
   6.2. Estatísticas por tipo são exibidas no painel de certificados
```

### 7.6 Fluxo de Exportação do Histórico Acadêmico

```
Exportação como PDF:
1. Usuário clica em "Exportar PDF" na barra de ações
2. PrintView é renderizado no corpo do documento via React Portal
3. window.print() abre o diálogo de impressão nativo do navegador
4. CSS @media print oculta todo o restante da página
5. Usuário salva como PDF ou imprime

Exportação como JSON:
1. Usuário clica em "Exportar JSON"
2. lib/export-utils.exportAsJSON() serializa todos os dados
3. Arquivo JSON é gerado via Blob e baixado pelo navegador

Exportação como XLSX:
1. Usuário clica em "Exportar Excel"
2. ExcelJS é carregado via import() dinâmico
3. lib/export-utils.exportAsXLSX() cria planilha com:
   - Aba "Resumo": métricas consolidadas
   - Uma aba por semestre: disciplinas detalhadas
4. Arquivo .xlsx é gerado e baixado pelo navegador
```

---

## 8. INTERFACES E ROTAS

### 8.1 Mapa Completo de Rotas

| Rota | Arquivo de Página | Componente Principal | Autenticação | Descrição |
|------|------------------|---------------------|--------------|-----------|
| `/` | `app/page.tsx` | `HomePage` | Não | Landing page com apresentação do sistema |
| `/login` | `app/login/page.tsx` | `LoginPage` | Não | Tela de autenticação (e-mail/senha e Google) |
| `/register` | `app/register/page.tsx` | `RegisterPage` | Não | Cadastro de novo usuário |
| `/forgot-password` | `app/forgot-password/page.tsx` | `ForgotPasswordPage` | Não | Solicitação de redefinição de senha |
| `/reset-password` | `app/reset-password/page.tsx` | `ResetPasswordPage` | Não | Definição da nova senha (com `oobCode`) |
| `/profile` | `app/profile/page.tsx` | `ProfilePage` | Sim | Painel principal: histórico, resumo, gráficos |
| `/grade` | `app/grade/page.tsx` | `GradePage` | Sim | Grade curricular interativa por semestre |
| `/horarios` | `app/horarios/page.tsx` | `HorariosPage` | Sim | Grade de horários semanal |
| `/simulador` | `app/simulador/page.tsx` | `SimuladorPage` | Sim | Simulador de notas e metas de CR |
| `/certificados` | `app/certificados/page.tsx` | `CertificadosPage` | Sim | Gestão de certificados e atividades complementares |
| `/u/[userId]` | `app/u/[userId]/page.tsx` | `PublicProfilePage` | Não | Perfil público do estudante (somente leitura) |
| `/u/[userId]/horarios` | `app/u/[userId]/horarios/page.tsx` | `PublicHorariosPage` | Não | Grade de horários pública |
| `/legal/privacy` | `app/legal/privacy/page.tsx` | `PrivacyPage` | Não | Política de Privacidade |
| `/legal/terms` | `app/legal/terms/page.tsx` | `TermsPage` | Não | Termos de Uso |

### 8.2 Layout Global

O arquivo `app/layout.tsx` define o layout raiz da aplicação:
- Metadados globais (título, descrição, Open Graph, favicon)
- Política de Content Security Policy (CSP) via nonce injetado pelo middleware
- Fontes globais
- Wrapper `<Providers>` que encapsula `AuthProvider`, contexto de tema e provedor de toasts

### 8.3 Descrição das Interfaces Principais

#### 8.3.1 Landing Page (`/`)
- Apresentação do sistema com seção de funcionalidades
- Botões de chamada para ação (CTA): "Acessar" e "Cadastrar"
- Totalmente acessível sem login

#### 8.3.2 Painel Principal (`/profile`)
- **Header:** Nome do usuário, foto, curso, semestralização, botão de logout
- **ActionBar:** Botões de importar PDF, exportar (PDF/JSON/XLSX), adicionar disciplina manualmente
- **Summary:** Cards de CR, total de horas, status de progresso por natureza
- **Gráficos:** Evolução do CR (linha), distribuição de horas (barras, pizza)
- **Recomendações:** Disciplinas sugeridas com base no déficit atual
- **AcademicHistory:** Tabela filtrada de todas as disciplinas com opções de edição e exclusão

#### 8.3.3 Grade Curricular (`/grade`)
- Seletor de curso (BICTI, Engenharia de Produção, Engenharia Elétrica)
- Abas de natureza: Obrigatórias (OB) | Optativas (OP/OX/OG) | Complementares (AC/OZ) | Livres (LV)
- Aba Obrigatórias: cards organizados por semestre com status visual (aprovado/em curso/pendente)
- Aba Optativas: lista de optativas disponíveis com status de aprovação
- Protegida de indexação por mecanismos de busca (robots: noindex, nofollow)

#### 8.3.4 Grade de Horários (`/horarios`)
- Tabela semanal (Segunda a Sábado)
- Slots de horário de 07:00 às 22:10
- Células preenchidas com nome e código das disciplinas em curso
- Campo de edição de código de horário por disciplina
- Botão de salvar com persistência no Firestore

#### 8.3.5 Certificados (`/certificados`)
- Estatísticas no topo: total de horas aprovadas, distribuição por tipo
- Filtros: tipo, status, intervalo de datas
- Lista de certificados com cards informativos
- Modal de adição/edição com upload de arquivo
- Modal de visualização do certificado com link para arquivo/URL externa
- Modal de confirmação de exclusão

### 8.4 Componentes Reutilizáveis do Design System

| Componente | Localização | Descrição |
|-----------|------------|-----------|
| `Button` | `components/ui/button.tsx` | Botão com variantes (default, outline, ghost, destructive) |
| `Card` | `components/ui/card.tsx` | Container com borda e sombra |
| `Dialog` | `components/ui/dialog.tsx` | Modal genérico (Radix UI) |
| `Input` | `components/ui/input.tsx` | Campo de entrada de texto |
| `Select` | `components/ui/select.tsx` | Menu de seleção (Radix UI) |
| `Badge` | `components/ui/badge.tsx` | Etiqueta colorida para status |
| `Progress` | `components/ui/progress.tsx` | Barra de progresso (Radix UI) |
| `Accordion` | `components/ui/accordion.tsx` | Painel expansível (Radix UI) |
| `Sheet` | `components/ui/sheet.tsx` | Painel lateral deslizante |
| `Skeleton` | `components/ui/skeleton.tsx` | Placeholder de carregamento |
| `Checkbox` | `components/ui/checkbox.tsx` | Caixa de seleção |
| `Textarea` | `components/ui/textarea.tsx` | Área de texto multilinha |
| `Alert` | `components/ui/alert.tsx` | Mensagem de alerta contextual |
| `Breadcrumbs` | `components/ui/breadcrumbs.tsx` | Navegação hierárquica |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx` | Menu contextual (Radix UI) |
| `Label` | `components/ui/label.tsx` | Rótulo para campos de formulário |

---

## 9. SEGURANÇA E PRIVACIDADE

### 9.1 Mecanismo de Autenticação

O sistema utiliza o **Firebase Authentication** como único provedor de identidade. As sessões são gerenciadas por tokens JWT (JSON Web Tokens) com renovação automática, armazenados no `IndexedDB` do navegador pelo SDK do Firebase.

**Métodos suportados:**
- Autenticação por e-mail e senha (Firebase Email/Password)
- Autenticação OAuth 2.0 com Google (Google Identity Platform)

**Proteções implementadas:**
- Requisito de re-autenticação para operações críticas: alteração de senha e exclusão de conta.
- Proteção contra força bruta pelo Firebase Auth (bloqueio automático após múltiplas tentativas falhas).
- Tokens JWT expiram automaticamente; o Firebase SDK os renova de forma transparente.

### 9.2 Controle de Acesso e Permissões

O controle de acesso é aplicado em duas camadas:

**Camada 1 — Frontend (proteção de rotas):**
- O `AuthProvider` verifica o estado de autenticação via `onAuthStateChanged`.
- Rotas protegidas (ex: `/profile`, `/grade`, `/horarios`) redirecionam para `/login` se o usuário não estiver autenticado.

**Camada 2 — Backend (Firestore Security Rules):**
- Regras executadas no servidor do Firebase, independentes do código do cliente.
- Cada operação (read, create, update, delete) é avaliada individualmente.
- Usuário autenticado só pode operar sobre seus próprios documentos (`request.auth.uid == resource.data.userId`).
- O campo `userId` é imutável após a criação (validado nas regras de update).
- Toda coleção não explicitamente declarada nas regras é bloqueada pelo padrão global (`match /{document=**} { allow read, write: if false; }`).

### 9.3 Proteção contra Vulnerabilidades Web Comuns

**Cross-Site Scripting (XSS):**
- React aplica escaping automático de todos os valores interpolados no JSX.
- A função `sanitizeInput()` (em `lib/utils/text.ts`) remove tags HTML e atributos de evento antes de qualquer processamento de texto do usuário.
- O cabeçalho **Content-Security-Policy (CSP)** com nonce por requisição impede a execução de scripts inline não autorizados.

**Injeção de URL (Open Redirect / Protocol Injection):**
- A função `isSafeExternalUrl()` valida todos os links externos antes de serem abertos, bloqueando protocolos perigosos: `javascript:`, `data:`, `vbscript:`.
- Todos os links externos são abertos com `rel="noopener noreferrer"`.

**Content Security Policy (CSP):**
O middleware `middleware.ts` gera um nonce aleatório (`crypto.randomUUID()`) por requisição e injeta a seguinte política CSP no cabeçalho `Content-Security-Policy`:

| Diretiva | Política |
|----------|----------|
| `base-uri` | `'self'` |
| `script-src` | `'self'` `'nonce-{nonce}'` `'strict-dynamic'` + Firebase/Google APIs |
| `style-src` | `'self'` `'unsafe-inline'` |
| `img-src` | `'self'` `data:` `*.googleusercontent.com` `*.firebaseusercontent.com` |
| `font-src` | `'self'` Google Fonts |
| `connect-src` | Firebase, Google APIs, Sentry |
| `frame-src` | Firebase, Google OAuth |
| `worker-src` | `'self'` `blob:` (necessário para PDF.js) |
| `object-src` | `'none'` |

**Outros cabeçalhos de segurança HTTP:**

| Cabeçalho | Valor | Finalidade |
|-----------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Impede MIME type sniffing |
| `X-Frame-Options` | `DENY` | Impede clickjacking via iframe |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita informações no cabeçalho Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desabilita APIs sensíveis do navegador |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Força HTTPS (produção) |

### 9.4 Proteção do Armazenamento de Arquivos

As regras do Firebase Storage (`storage.rules`) garantem que:
- Apenas o proprietário do arquivo pode fazer upload ou download.
- O acesso é validado pelo `userId` armazenado nos metadados do arquivo.
- CORS é configurado em `firebase-storage-cors.json` para aceitar requisições apenas das origens autorizadas.

### 9.5 Dados Pessoais Tratados e Base Legal (LGPD)

O sistema coleta e processa os seguintes dados pessoais:

| Dado Pessoal | Finalidade | Base Legal (Lei nº 13.709/2018) |
|-------------|-----------|--------------------------------|
| Nome completo | Identificação do usuário e personalização da interface | Consentimento (Art. 7º, I) |
| Endereço de e-mail | Autenticação, recuperação de senha e comunicações | Consentimento (Art. 7º, I) |
| Foto de perfil | Personalização da interface | Consentimento (Art. 7º, I) |
| Número de matrícula | Identificação acadêmica (opcional) | Consentimento (Art. 7º, I) |
| Histórico acadêmico (disciplinas, notas) | Funcionalidade principal do sistema | Consentimento (Art. 7º, I) |
| Certificados e documentos | Comprovação de atividades complementares | Consentimento (Art. 7º, I) |
| Dados de acesso e uso (Analytics) | Melhoria do serviço | Legítimo interesse (Art. 7º, IX) |

**Direitos do titular dos dados garantidos pelo sistema:**
- **Direito de acesso:** O usuário pode visualizar todos os seus dados na interface.
- **Direito de retificação:** O usuário pode editar todos os seus dados pessoais.
- **Direito de exclusão:** A funcionalidade "Excluir conta" remove permanentemente o documento de perfil do Firestore, todas as disciplinas, certificados e arquivos do usuário.
- **Portabilidade:** A exportação em JSON permite ao usuário obter uma cópia de todos os seus dados.

### 9.6 Monitoramento de Segurança em Produção

- **Sentry** (`@sentry/nextjs`) é configurado para capturar erros e exceções em produção, com amostras de 10% para monitoramento de performance e 100% para replays em caso de erro.
- O código-fonte não é exposto em produção (source maps desabilitados).
- `console.log` e `console.debug` são removidos automaticamente no build de produção pelo Next.js.

---

## 10. REQUISITOS DO SISTEMA

### 10.1 Requisitos para o Usuário Final (Cliente)

**Hardware mínimo:**
- Processador: qualquer processador moderno capaz de executar um navegador web contemporâneo
- Memória RAM: mínimo 2 GB (4 GB recomendados para desempenho adequado)
- Armazenamento: sem requisito local (aplicação web)
- Conexão com a internet: necessária para autenticação, sincronização e carregamento da aplicação

**Software (Navegadores Suportados):**

| Navegador | Versão Mínima | Observações |
|-----------|--------------|-------------|
| Google Chrome | 90+ | Recomendado |
| Mozilla Firefox | 88+ | Compatível |
| Microsoft Edge | 90+ | Compatível |
| Apple Safari | 14+ | Compatível |
| Opera | 76+ | Compatível |

**Requisitos de software:**
- JavaScript habilitado no navegador (obrigatório)
- Cookies habilitados (necessário para autenticação Firebase)
- Suporte a IndexedDB (armazenamento de sessão do Firebase)

**Funcionalidades que requerem suporte específico do navegador:**
- Importação de PDF: suporte a File API e ArrayBuffer (todos os navegadores modernos)
- Exportação para XLSX: suporte a Blob e URL.createObjectURL (todos os navegadores modernos)
- Grade de horários com `rowspan`: renderização padrão HTML (todos os navegadores)

### 10.2 Requisitos para Ambiente de Desenvolvimento

| Requisito | Versão | Observações |
|-----------|--------|-------------|
| Node.js | 22.x | Definido em `.nvmrc` |
| NPM | Incluído com Node.js 22.x | — |
| Git | Qualquer versão recente | Para controle de versão |
| Conta Firebase | — | Projeto Firebase com Firestore, Auth e Storage habilitados |
| Conta Vercel (opcional) | — | Para deploy em produção |
| Conta Sentry (opcional) | — | Para monitoramento de erros em produção |

---

## 11. INSTALAÇÃO E CONFIGURAÇÃO

### 11.1 Pré-requisitos de Ambiente

Antes de iniciar, certifique-se de que os seguintes pré-requisitos estão atendidos:

1. **Node.js 22.x** instalado. Recomenda-se o uso do `nvm` (Node Version Manager):
   ```bash
   nvm install 22
   nvm use 22
   ```

2. **Projeto Firebase** criado no Console do Firebase com os seguintes serviços habilitados:
   - Authentication (com provedores: E-mail/Senha e Google)
   - Cloud Firestore (modo produção)
   - Cloud Storage

3. **Git** instalado para clonagem do repositório.

### 11.2 Instalação Local

**Passo 1: Clonar o repositório**
```bash
git clone https://github.com/LuisT-ls/Historico-Universitario.git
cd Historico-Universitario
```

**Passo 2: Instalar dependências**
```bash
npm install
```
> O script `postinstall` copia automaticamente o worker do PDF.js para o diretório `public/`.

**Passo 3: Configurar variáveis de ambiente**

Crie o arquivo `.env.local` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do seu projeto Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> As credenciais do Firebase são obtidas no Console do Firebase em: Configurações do Projeto → Seus aplicativos → SDK de configuração (Web).

**Passo 4: Configurar as regras do Firestore**

Publique as regras de segurança no seu projeto Firebase:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

> Requer o [Firebase CLI](https://firebase.google.com/docs/cli) instalado e autenticado.

**Passo 5: Iniciar o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 11.3 Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sim | Chave de API do projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Domínio de autenticação Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sim | ID do projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sim | Bucket do Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sim | ID do remetente Firebase Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sim | ID do aplicativo Firebase |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Não | ID do Google Analytics (necessário para Analytics) |
| `NEXT_PUBLIC_SENTRY_DSN` | Não | DSN do projeto Sentry (necessário para monitoramento de erros) |
| `SENTRY_AUTH_TOKEN` | Não | Token de autenticação do Sentry para upload de source maps |

> **Importante:** As variáveis prefixadas com `NEXT_PUBLIC_` são expostas ao cliente (navegador). Estas variáveis do Firebase são projetadas para uso cliente e são protegidas pelas Firestore Security Rules e pelas configurações do projeto Firebase (restrições de domínio e referenciador HTTP).

### 11.4 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o build de produção otimizado |
| `npm run start` | Inicia o servidor de produção (requer build prévia) |
| `npm run lint` | Executa verificação de linting com ESLint |
| `npm run type-check` | Verifica tipos TypeScript sem compilar |
| `npm run test` | Executa todos os testes unitários com Jest |
| `npm run test:watch` | Executa testes em modo watch (desenvolvimento) |
| `npm run test:coverage` | Executa testes com relatório de cobertura |
| `npm run test:e2e` | Executa testes end-to-end com Playwright |
| `npm run test:e2e:ui` | Executa testes E2E com interface gráfica do Playwright |
| `npm run test:all` | Executa testes unitários e E2E sequencialmente |

### 11.5 Deploy em Produção (Vercel)

**Passo 1:** Conectar o repositório GitHub ao projeto Vercel (via interface web ou CLI do Vercel).

**Passo 2:** Configurar as variáveis de ambiente na interface do Vercel (Settings → Environment Variables) com os mesmos valores do `.env.local`.

**Passo 3:** Configurar o domínio autorizado no Firebase:
- Console Firebase → Authentication → Settings → Authorized domains
- Adicionar o domínio Vercel (ex: `historicoacademico.vercel.app`)

**Passo 4:** O deploy é ativado automaticamente a cada `git push` para a branch `main`.

**Passo 5:** Verificar se as Firestore Security Rules e Storage Rules estão publicadas no projeto Firebase de produção.

---

## 12. ESTRUTURA DE DIRETÓRIOS

```
Historico-Universitario/
│
├── app/                          # Camada de roteamento (Next.js App Router)
│   ├── layout.tsx                # Layout raiz: metadados, CSP, fontes, providers
│   ├── page.tsx                  # Rota / → Landing page
│   ├── sitemap.ts                # Geração dinâmica do sitemap.xml
│   ├── not-found.tsx             # Página 404 customizada
│   ├── login/
│   │   └── page.tsx              # Rota /login
│   ├── register/
│   │   └── page.tsx              # Rota /register
│   ├── forgot-password/
│   │   └── page.tsx              # Rota /forgot-password
│   ├── reset-password/
│   │   └── page.tsx              # Rota /reset-password
│   ├── profile/
│   │   └── page.tsx              # Rota /profile → Painel principal
│   ├── grade/
│   │   └── page.tsx              # Rota /grade → Grade curricular
│   ├── horarios/
│   │   └── page.tsx              # Rota /horarios → Grade de horários
│   ├── simulador/
│   │   └── page.tsx              # Rota /simulador → Simulador de notas
│   ├── certificados/
│   │   └── page.tsx              # Rota /certificados → Gestão de certificados
│   ├── u/
│   │   └── [userId]/
│   │       ├── page.tsx          # Rota /u/[userId] → Perfil público
│   │       └── horarios/
│   │           └── page.tsx      # Rota /u/[userId]/horarios → Horários públicos
│   └── legal/
│       ├── privacy/
│       │   └── page.tsx          # Rota /legal/privacy → Política de Privacidade
│       └── terms/
│           └── page.tsx          # Rota /legal/terms → Termos de Uso
│
├── components/                   # Componentes React reutilizáveis
│   ├── ui/                       # Design system (componentes base Shadcn/UI)
│   │   ├── accordion.tsx         # Painel expansível
│   │   ├── alert.tsx             # Mensagem de alerta
│   │   ├── badge.tsx             # Etiqueta de status
│   │   ├── breadcrumbs.tsx       # Navegação breadcrumb
│   │   ├── button.tsx            # Botão com variantes
│   │   ├── card.tsx              # Container card
│   │   ├── checkbox.tsx          # Caixa de seleção
│   │   ├── dialog.tsx            # Modal/diálogo
│   │   ├── dropdown-menu.tsx     # Menu suspenso
│   │   ├── input.tsx             # Campo de texto
│   │   ├── label.tsx             # Rótulo de formulário
│   │   ├── progress.tsx          # Barra de progresso
│   │   ├── select.tsx            # Seletor de opções
│   │   ├── sheet.tsx             # Painel lateral deslizante
│   │   ├── skeleton.tsx          # Placeholder de carregamento
│   │   └── textarea.tsx          # Área de texto multilinha
│   │
│   ├── layout/                   # Componentes de estrutura da página
│   │   ├── header.tsx            # Cabeçalho global com navegação
│   │   └── footer.tsx            # Rodapé global com links
│   │
│   ├── pages/                    # Componentes de página completa
│   │   ├── home-page.tsx         # Conteúdo da landing page
│   │   ├── login-page.tsx        # Formulário de login
│   │   ├── register-page.tsx     # Formulário de cadastro
│   │   ├── forgot-password-page.tsx  # Formulário de recuperação
│   │   ├── reset-password-page.tsx   # Formulário de nova senha
│   │   ├── profile-page.tsx      # Painel acadêmico principal
│   │   ├── certificados-page.tsx # Interface de certificados
│   │   ├── grade-page.tsx        # Grade curricular
│   │   ├── horarios-page.tsx     # Grade de horários
│   │   ├── public-profile-page.tsx   # Perfil público (somente leitura)
│   │   ├── public-horarios-page.tsx  # Horários públicos (somente leitura)
│   │   ├── privacy-page.tsx      # Política de privacidade
│   │   └── terms-page.tsx        # Termos de uso
│   │
│   ├── features/                 # Componentes de domínio (funcionalidades)
│   │   ├── academic-calendar.tsx # Calendário acadêmico visual
│   │   ├── academic-history.tsx  # Lista de disciplinas com filtros e CRUD
│   │   ├── summary.tsx           # Cards de métricas (CR, horas, progresso)
│   │   ├── recommendations.tsx   # Painel de disciplinas recomendadas
│   │   ├── discipline-form.tsx   # Modal de adição/edição de disciplina
│   │   ├── discipline-search.tsx # Busca com autocomplete no catálogo
│   │   ├── curriculum-map.tsx    # Grade curricular por semestre e natureza
│   │   ├── print-view.tsx        # Layout de impressão (via React Portal)
│   │   ├── action-bar.tsx        # Barra de ações (importar, exportar, etc.)
│   │   ├── calendar-dialog.tsx   # Modal de seleção de datas
│   │   ├── info-dialog.tsx       # Modal de informações
│   │   └── charts/
│   │       ├── pie-chart-summary.tsx   # Gráfico de pizza: distribuição de horas
│   │       ├── bar-chart-summary.tsx   # Gráfico de barras: progresso por natureza
│   │       └── line-chart-summary.tsx  # Gráfico de linha: evolução do CR
│   │   └── certificados/         # Sub-módulo de certificados (16 arquivos)
│   │       ├── components/       # Componentes de UI do módulo
│   │       │   ├── certificado-form.tsx       # Formulário de adição/edição
│   │       │   ├── certificado-list.tsx       # Lista de certificados
│   │       │   ├── certificado-card.tsx       # Card individual
│   │       │   ├── certificado-list-item.tsx  # Item de lista
│   │       │   ├── certificado-filters.tsx    # Filtros de busca
│   │       │   ├── certificado-stats.tsx      # Estatísticas por tipo
│   │       │   ├── certificados-header.tsx    # Cabeçalho do módulo
│   │       │   ├── view-modal.tsx             # Modal de visualização
│   │       │   ├── delete-modal.tsx           # Modal de confirmação de exclusão
│   │       │   └── empty-state.tsx            # Estado vazio (sem certificados)
│   │       ├── hooks/            # Hooks React do módulo
│   │       │   ├── use-certificados.ts        # CRUD e listagem
│   │       │   ├── use-certificado-form.ts    # Estado do formulário
│   │       │   ├── use-certificado-filters.ts # Estado dos filtros
│   │       │   └── use-date-mask.ts           # Máscara de datas
│   │       └── constants.ts      # Constantes do módulo de certificados
│   │
│   ├── auth-provider.tsx         # Context Provider de autenticação
│   ├── providers.tsx             # Root providers (auth, tema, toasts)
│   ├── theme-toggle.tsx          # Botão de alternância claro/escuro
│   ├── error-boundary.tsx        # Tratamento de erros de renderização React
│   └── global.css                # Estilos globais e variáveis CSS (Tailwind)
│
├── lib/                          # Utilitários, lógica de negócio e configurações
│   ├── firebase/
│   │   └── config.ts             # Inicialização lazy do Firebase (client-side only)
│   ├── constants.ts              # Configurações dos cursos (BICTI, ENG_PROD, ENG_ELET)
│   ├── type-constants.ts         # Criadores de branded types e labels de enumerações
│   ├── pdf-parser.ts             # Extração e parsing do histórico SIGAA em PDF
│   ├── certificate-ocr.ts        # Extração de dados de certificados via OCR
│   ├── error-handler.ts          # Mapeamento de erros Firebase para mensagens PT-BR
│   ├── export-utils.ts           # Funções de exportação JSON e XLSX
│   ├── logger.ts                 # Logger centralizado (console + Sentry em produção)
│   ├── toast.ts                  # Helper para notificações toast
│   └── utils/
│       ├── index.ts              # Barrel export de todos os utilitários
│       ├── calculations.ts       # Cálculo de CR, média, semestralização, etc.
│       ├── periods.ts            # Comparação e manipulação de períodos letivos
│       ├── statistics.ts         # Compilação de estatísticas do usuário
│       ├── predictions.ts        # Previsões e recomendações acadêmicas
│       ├── storage.ts            # Helpers para localStorage
│       ├── text.ts               # Sanitização e validação de texto
│       └── ui.ts                 # Utilitários de interface (classes CSS, etc.)
│
├── services/                     # Camada de acesso ao Firebase (I/O centralizado)
│   ├── firestore.service.ts      # CRUD de disciplinas, certificados e perfis
│   ├── auth.service.ts           # Operações de autenticação
│   ├── storage.service.ts        # Upload/download no Firebase Storage
│   └── calculations.service.ts  # Serviço auxiliar de cálculos
│
├── types/
│   └── index.ts                  # Todas as interfaces e tipos TypeScript do projeto
│
├── assets/
│   ├── data/
│   │   ├── disciplinas.json      # Catálogo de disciplinas por curso (importado em build)
│   │   └── matrizes.json         # Estrutura de semestres da matriz curricular por curso
│   └── img/
│       ├── favicon/              # Ícones do favicon em múltiplos formatos
│       └── og-image.jpg          # Imagem para Open Graph (redes sociais)
│
├── __tests__/                    # Testes unitários e de integração (Jest)
│   ├── lib/                      # Testes dos módulos em lib/
│   ├── services/                 # Testes dos serviços Firebase
│   └── components/               # Testes de componentes React
│
├── e2e/                          # Testes end-to-end (Playwright)
│   ├── home.spec.ts              # Testes da landing page
│   ├── accessibility.spec.ts     # Testes de acessibilidade
│   └── navigation.spec.ts        # Testes de navegação entre rotas
│
├── docs/                         # Documentação técnica do projeto
│   ├── adr/                      # Architecture Decision Records
│   ├── documentation/            # Documentação adicional
│   ├── architecture.md           # Descrição da arquitetura
│   ├── DEPLOY_CHECKLIST.md       # Checklist de deploy
│   └── MANUAL_DO_SOFTWARE.md     # Este documento
│
├── public/                       # Assets estáticos servidos pelo Next.js
│   ├── pdf.worker.min.mjs        # Worker do PDF.js (copiado via postinstall)
│   ├── manifest.json             # Web App Manifest (PWA)
│   ├── robots.txt                # Instruções para rastreadores web
│   └── sitemap.xml               # Sitemap estático (complementar ao dinâmico)
│
├── middleware.ts                 # Middleware Next.js: injeção de CSP nonce
├── instrumentation.ts            # Inicialização do Sentry (server-side)
├── sentry.client.config.ts       # Configuração do Sentry (client-side)
│
├── next.config.ts                # Configuração do Next.js (otimizações, headers)
├── tailwind.config.ts            # Configuração do Tailwind CSS
├── tsconfig.json                 # Configuração do TypeScript
├── jest.config.js                # Configuração do Jest
├── jest.setup.js                 # Setup dos testes Jest
├── playwright.config.ts          # Configuração do Playwright (E2E)
├── postcss.config.mjs            # Configuração do PostCSS
│
├── firestore.rules               # Regras de segurança do Firestore
├── storage.rules                 # Regras de segurança do Firebase Storage
├── firebase.json                 # Configuração do Firebase CLI
├── firebase-storage-cors.json    # Configuração de CORS para o Firebase Storage
│
├── .env.example                  # Modelo de variáveis de ambiente
├── .nvmrc                        # Versão do Node.js requerida (22.x)
├── .eslintrc.json                # Configuração do ESLint
├── .gitignore                    # Arquivos ignorados pelo Git
│
├── package.json                  # Metadados, dependências e scripts do projeto
├── package-lock.json             # Lockfile de versões exatas das dependências
├── README.md                     # Documentação principal do projeto
├── CONTRIBUTING.md               # Guia de contribuição
├── TESTES.md                     # Documentação de testes
├── security.md                   # Documentação de segurança
└── LICENSE                       # Licença MIT
```

---

## 13. HISTÓRICO DE VERSÕES

| Versão | Data (Estimada) | Principais Mudanças |
|--------|----------------|---------------------|
| **v2.4** | Março de 2026 | **Grade Curricular:** nova página `/grade` com grade completa por semestre; matching em três camadas (código exato → prefixo de turma → nome canônico); abas por natureza (OB, OP/OX/OG, AC/OZ, LV); exibição da nota e período da aprovação; seleção de curso na página; proteção SEO (noindex). |
| **v2.3** | Fevereiro de 2026 | **Grade de Horários:** nova página `/horarios` com grade semanal; suporte ao formato de código UFBA (ex: `46T56`); rowspan automático para múltiplos horários; persistência dos códigos no Firebase; disciplinas em curso aparecem automaticamente. |
| **v2.2** | Janeiro de 2026 | **Segurança e Arquitetura:** correção das Firestore Rules (operações separadas por tipo); validação de URLs externas (`isSafeExternalUrl`); CSP endurecido (remoção de `unpkg.com`); camada de serviços completa em `services/`; schema do Firestore com dot-notation; localStorage exclusivo para usuários não autenticados; 88 novos testes adicionados. |
| **v2.1** | Dezembro de 2025 | **Funcionalidades e UX:** semestre dinâmico via `getCurrentSemester()`; recomendações de disciplinas com progressão sequencial (I→II, A→B); ocultação automática do painel de pendentes; gráfico de CR com linha dupla (acumulado + semestral); exportação PDF via `window.print()`; importação de PDF com deduplicação; perfil público em `/u/[userId]`. |
| **v2.0** | Novembro de 2025 | **Migração para Next.js App Router:** reestruturação completa para Next.js 15+ com App Router; migração para React 19; introdução do Shadcn/UI como design system; integração com Framer Motion para animações; suporte a dark mode; implementação do CSP com nonce via middleware. |
| **v1.x** | 2024–2025 | Versões iniciais do sistema: importação de PDF do SIGAA, cálculo básico de CR, listagem de disciplinas, autenticação Firebase básica. |

---

## 14. CONSIDERAÇÕES FINAIS

### 14.1 Limitações Conhecidas do Software

1. **Suporte a cursos:** O sistema oferece suporte completo de grade curricular (incluindo a matriz por semestre) apenas para os cursos BICTI, Engenharia de Produção e Engenharia Elétrica do Campus de Camaçari/UFBA. Estudantes de outros cursos podem utilizar as funcionalidades de importação de PDF e cálculo de CR, mas sem a visualização da grade curricular organizada por semestre.

2. **Compatibilidade de PDF:** O parser foi desenvolvido e testado especificamente para o formato do histórico acadêmico emitido pelo SIGAA da UFBA. Históricos gerados por outras universidades ou em formatos diferentes não são suportados.

3. **Operação offline:** O sistema requer conexão com a internet para autenticação e sincronização de dados. O catálogo de disciplinas (`disciplinas.json`) é incluído no bundle da aplicação e está disponível offline, mas as operações de leitura e escrita de dados do usuário requerem conectividade.

4. **Atualização automática da matriz curricular:** Mudanças nos currículos dos cursos (adição ou remoção de disciplinas obrigatórias, alteração de cargas horárias) necessitam de atualização manual dos arquivos `assets/data/disciplinas.json` e `assets/data/matrizes.json`.

5. **Simulador de formatura:** A estimativa de prazo de formatura é baseada no ritmo histórico do estudante e não leva em consideração pré-requisitos formais entre disciplinas ou limitações de vagas por semestre.

6. **Reconhecimento de certificados:** A funcionalidade de extração automática de dados de certificados via OCR (`lib/certificate-ocr.ts`) oferece suporte aos formatos de documento mais amplamente utilizados. A expansão da compatibilidade com formatos adicionais está prevista em versões futuras do sistema.

7. **Validação de status de certificados:** O status `aprovado` dos certificados é definido manualmente pelo próprio estudante no sistema, sem integração com o SIGAA ou validação por parte da coordenação do curso.

### 14.2 Trabalhos Futuros Planejados

Com base na evolução natural do sistema, os seguintes desenvolvimentos futuros são identificados:

- **Suporte a novos cursos:** Expansão do catálogo de disciplinas e matrizes curriculares para outros cursos da UFBA.
- **Integração com SIGAA via API:** Substituição da importação manual de PDF por uma integração direta com a API do SIGAA, se disponibilizada.
- **Notificações proativas:** Alertas automáticos para disciplinas em risco de reprovação com base na evolução das notas.
- **Modo offline completo:** Implementação de Service Workers para operação offline com sincronização posterior.
- **Aplicativo móvel:** Versão nativa para iOS e Android.
- **Validação automática de certificados:** Mecanismo para que coordenadores de curso possam validar certificados diretamente na plataforma.
- **Análise comparativa:** Funcionalidade de comparação anônima do desempenho do estudante com a média do curso.

### 14.3 Como Contribuir

O projeto é de código aberto sob a licença MIT. Contribuições são bem-vindas. O guia completo de contribuição está disponível no arquivo `CONTRIBUTING.md` na raiz do repositório, com instruções sobre:

- Configuração do ambiente de desenvolvimento
- Convenções de commit (Conventional Commits)
- Como estender o parser do SIGAA para novos formatos
- Como adicionar suporte a novos cursos
- Como abrir e revisar Pull Requests

Repositório oficial: https://github.com/LuisT-ls/Historico-Universitario

---

## REFERÊNCIAS NORMATIVAS

- Lei nº 9.609, de 19 de fevereiro de 1998 — Dispõe sobre a proteção da propriedade intelectual de programa de computador.
- Lei nº 9.610, de 19 de fevereiro de 1998 — Altera, atualiza e consolida a legislação sobre direitos autorais.
- Instrução Normativa INPI nº 11, de 2 de maio de 2013 — Estabelece as condições para o registro de programas de computador.
- Lei nº 13.709, de 14 de agosto de 2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).

---

*Documento gerado com base na análise do código-fonte do repositório em março de 2026.*
*Revisão 1.1 — Correções aplicadas em março de 2026.*
*Versão do software documentada: 2.4 (Grade Curricular).*
