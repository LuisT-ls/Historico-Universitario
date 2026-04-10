# 📚 Histórico Acadêmico UFBA v2.7

> [!IMPORTANT]
> **Aviso Legal:** Este é um projeto **independente** desenvolvido para auxiliar os estudantes do **ICTI/UFBA (Campus de Camaçari)**. Este software **não possui vínculo oficial** com a Universidade Federal da Bahia (UFBA) ou com a administração do SIGAA.

Uma plataforma moderna e intuitiva para estudantes da UFBA gerenciarem sua trajetória acadêmica. O sistema permite o upload do histórico do SIGAA, calcula estatísticas em tempo real e oferece uma visão clara do progresso rumo à formatura.

![Dashboard Preview](imagem-preview.png)

## 🚀 Acesse Agora
[https://historicoacademico.vercel.app](https://historicoacademico.vercel.app)

---

## ✨ Funcionalidades Principais

### 📊 Gestão Acadêmica Inteligente
- **Importação de PDF:** Basta subir seu histórico do SIGAA e o sistema extrai todas as disciplinas automaticamente, ignorando duplicatas e registros já existentes.
- **Cálculo de CR:** Coeficiente de Rendimento calculado em tempo real, seguindo as normas da UFBA.
- **Semestralização Oficial:** Cálculo de período letivo baseado na fórmula oficial do SIGAA, com suporte a suspensões e perfil inicial.
- **Semestre Atual Dinâmico:** O semestre corrente é calculado automaticamente com base na data do sistema, sem necessidade de configuração manual.
- **Visualização de Progresso:** Gráficos e barras de progresso por natureza de disciplina (OB, OG, OX, OH, OZ, OP, AC, LV).

### 💡 Disciplinas Pendentes e Recomendações
- **Recomendações Contextuais:** O sistema analisa seu histórico e recomenda disciplinas com base nas suas necessidades reais:
  - **Sequência lógica:** Se você concluiu Cálculo A, recomenda Cálculo B automaticamente (suporte a numerais romanos I→V e letras A→D).
  - **Déficit de horas:** Prioriza disciplinas das categorias onde ainda faltam horas para a formatura.
  - **Detecção de formatura:** Se as disciplinas em curso já cobrem todos os déficits restantes, o painel de recomendações é ocultado automaticamente.
- **Badges de déficit:** Exibe quanto falta em cada categoria (ex: `OG: 144h`) diretamente no cabeçalho do painel.

### 📈 Evolução do CR
- **Gráfico de linha duplo:** Visualize o CR acumulado (linha sólida) e a média isolada de cada semestre (linha tracejada) no mesmo gráfico.
- **Tendência de desempenho:** Identifique visualmente semestres de melhora ou queda no rendimento.
- **Linhas de referência:** Marcações em 5,0 e 7,0 para contextualizar o desempenho.
- **Tooltip detalhado:** Ao passar o mouse, exibe CR acumulado e média do semestre lado a lado.

### 🔐 Segurança e Sincronização
- **Autenticação Firebase:** Login via Google ou Email/Senha com re-autenticação exigida para operações sensíveis.
- **Sincronização Cloud:** Dados salvos no Firestore com regras de segurança server-side por operação (`create`, `update`, `delete`).
- **Validação de URLs:** Links externos de certificados são validados antes de serem abertos (`https://` / `http://` apenas).
- **Privacidade:** Opção de manter seu perfil privado ou público, com controle granular.

### 🌐 Perfil Público
- **Link compartilhável:** Cada usuário possui um perfil público acessível em `/u/[userId]`.
- **Controle de privacidade:** Apenas perfis configurados como públicos são visíveis externamente.
- **Visão completa para terceiros:** O perfil público exibe CR, horas por categoria, disciplinas aprovadas e certificados de atividades complementares.

### 🖨️ Exportar PDF / Modo de Impressão
- **Exportar PDF:** Botão "Exportar PDF" no resumo acadêmico aciona o diálogo nativo de impressão do navegador.
- **Layout otimizado:** O modo de impressão (`@media print`) exibe um documento estruturado com cabeçalho, tabela de métricas, progresso por categoria e histórico completo de disciplinas.
- **Sem dependências extras:** Utiliza a API nativa do navegador (`window.print()`), sem bibliotecas adicionais.

### 🗓️ Grade de Horários
- **Visualização automática:** Disciplinas marcadas como "em curso" aparecem automaticamente na grade semanal.
- **Código de horário:** Insira códigos no formato UFBA (ex: `46T56` = Quarta+Sexta, Tarde, slots 5–6) para posicionar cada disciplina na grade.
- **Grade visual:** Exibe os horários de Segunda a Sexta (e Sábado quando necessário), de 07:00 às 22:10, com rowspan automático para aulas de múltiplos horários.
- **Persistência:** Códigos de horário salvos no Firebase — disponíveis após logout e novo login.

### 🎓 Grade Curricular
- **Visualização completa:** Todas as disciplinas obrigatórias do curso organizadas por semestre, com status de conclusão em tempo real.
- **Múltiplas naturezas:** Abas dedicadas para Obrigatórias (OB), Optativas (OP/OX/OG), Atividades Complementares (AC/OZ) e Livres (LV).
- **Matching inteligente:** Correspondência em três camadas — código exato → prefixo de turma (ex: `CTIA10B`) → nome canônico — para garantir que disciplinas cursadas em períodos diferentes sejam corretamente reconhecidas.
- **Nota e período corretos:** Exibe sempre a nota e o semestre da tentativa aprovada, ignorando reprovações e trancamentos anteriores.
- **Seleção de curso:** Suporte a múltiplos cursos do catálogo (ex: BICTI, Eng. de Computação), com alternância direta na página.
- **Sem dados:** Funciona mesmo sem importação — exibe todas as disciplinas como pendentes até que o histórico seja importado.

### 👥 Grupos de Estudo
- **Criação e entrada por código:** Crie um grupo e compartilhe o código de convite de 6 caracteres; outros membros entram digitando o código.
- **Quadro Kanban avançado:** Colunas padrão (A Fazer, Em Andamento, Concluído) + colunas personalizadas. Arraste cartões entre colunas e reordene as próprias colunas por drag-and-drop.
- **Cartões estilo post-it:** Cor de fundo personalizável via paleta pré-definida ou seletor manual. Contraste de texto calculado automaticamente (fórmula WCAG) para garantir legibilidade em qualquer cor.
- **Detalhes da tarefa:** Modal com título, descrição (WYSIWYG), responsável, data de entrega, cor, etiquetas, checklists, links e histórico de atividade.
- **Etiquetas coloridas:** 8 etiquetas fixas (Prioridade, Bloqueado, Em revisão, etc.) exibidas como faixas coloridas no cartão.
- **Checklists:** Múltiplas listas de verificação nomeadas por cartão, com barra de progresso e contagem concluídos/total visível no quadro.
- **Links/Anexos:** Adicione links com rótulo opcionais; contador exibido no cartão.
- **Membros online:** Indicador de presença em tempo real — avatares com pulsação verde mostram quem está visualizando o quadro no momento.
- **Notificações de atividade:** Toast automático quando outro membro edita, move ou comenta uma tarefa, exibindo o nome real da pessoa.
- **Menu de opções da lista:** Adicionar cartão, ordenar por (data/nome), copiar lista, mover esquerda/direita, remover lista.
- **Busca e filtros:** Filtre cartões por texto, etiqueta, responsável ou prazo (atrasados/próximos) sem sair do quadro.
- **Modo compacto:** Alterne para visualização de linha única (sem ornamentos) para ter mais cartões na tela; tecla de atalho `C`.
- **Atalhos de teclado:** `/` foca a busca, `N` abre o formulário de novo cartão na primeira coluna.
- **Animação de arraste:** Cartão gira e escala ao ser arrastado; animação de "settle" ao ser solto.
- **Progresso do grupo:** Barra de progresso com percentual de tarefas concluídas na página do grupo.
- **Gerenciamento de membros:** Lista de membros com destaque para o criador; controles de dono para editar/excluir o grupo. Membros podem sair a qualquer momento.

### 🧠 Mapa Mental Colaborativo
Canvas interativo de mapas mentais integrado à aba "Mapa Mental" de cada grupo de estudo, construído sobre `@xyflow/react` v12 com persistência em Firestore e suporte a múltiplos usuários simultâneos.

**Canvas e nós:**
- **CRUD completo:** Adicionar, editar (duplo clique / toque duplo), duplicar e excluir nós via menu de contexto ou atalhos.
- **Formas:** `rounded` (padrão), `pill` e `diamond` por nó.
- **Temas WCAG:** 5 temas pré-definidos com combinações bg + texto de alto contraste (Padrão, Destaque Escuro, Alerta, Sucesso, Atenção). Preview com texto "Aa" no menu.
- **Emoji prefix:** Campo emoji opcional exibido à esquerda do rótulo.
- **Drop to Create:** Arraste a handle de saída de um nó e solte no canvas — cria novo nó conectado automaticamente no ponto de soltura.

**Conexões:**
- **Smoothstep edges** com cor `#64748b` (slate-500) e espessura 2px — visíveis em fundos claros e escuros.
- **`defaultEdgeOptions`** garante estilo consistente para todas as arestas, incluindo mapas legados sem `style` gravado.
- **Conexão manual:** Arraste entre handles para criar arestas customizadas.

**Histórico local (Undo/Redo):**
- **Pilhas `pastRef`/`futureRef`** com até 30 snapshots shallow-copied.
- **`Ctrl+Z` / `Cmd+Z`** desfaz; **`Ctrl+Y` / `Cmd+Shift+Z`** refaz.
- Botões na toolbar com feedback visual reativo (`canUndo`/`canRedo` como `useState`).
- Snapshots capturados no início de cada CRUD, drag-start e exclusão por teclado.
- **`isOwnSaveRef`**: distingue o bounce do próprio save do Firestore de updates remotos — preserva histórico após salvar, limpa apenas em updates de outros usuários.

**Multi-seleção:**
- **`Shift+Click`** seleciona múltiplos nós; **`Shift+Drag`** seleciona por área.
- Menu de contexto detecta se o nó está selecionado: aplica cor ou exclusão em todos os nós selecionados com `deleteNodes(ids)` / `updateNodesData(ids, data)`.
- Label do botão destrutivo exibe contagem: "Excluir 3 nós".

**Auto-layout:**
- Botão **"Organizar"** (ícone varinha) na toolbar aplica layout direcional esquerda→direita via **Dagre**.
- Após o layout, `fitView` é acionado automaticamente (350ms) para encaixar o grafo na tela.

**Exportar como PNG:**
- `html-to-image` captura `.react-flow__viewport` (não o container externo) para incluir nós + arestas SVG.
- `getNodesBounds` + `getViewportForBounds` calculam dimensões exatas: `imageWidth = bounds.width + 200px`, `imageHeight = bounds.height + 200px` — imagem recortada ao conteúdo sem nós minúsculos.
- Fundo adaptativo: `#020617` (dark mode) ou `#ffffff` (light mode), detectado em tempo real pela classe `.dark-mode` / `.dark` no `<html>`.
- Resolução 2× (`pixelRatio: 2`) para telas retina.

**Cursores multiplayer:**
- `onPointerMove` no canvas converte coordenadas para espaço de fluxo via `screenToFlowPosition` e transmite via `updateCursorPosition()` com debounce de 50ms.
- `<CursorOverlay>` usa `useViewport()` + `flowToScreenPosition()` para renderizar cursores SVG com badge de nome sobre o canvas; cores determinísticas por `userId` (hash → paleta de 8 cores).

**Vincular materiais:**
- Nós aceitam `attachments[]` (id, name, url) vinculados via modal que carrega `getGroupMaterials()`.
- Badge `Paperclip` com contador no nó indica materiais vinculados.
- Anexos listados diretamente no menu de contexto como itens clicáveis com `ExternalLink`.

**Integração Kanban:**
- "Converter em tarefa" no menu de contexto cria um cartão no Kanban (`status: 'pending'`) a partir do rótulo do nó.

**Atalhos de teclado:**
| Tecla | Ação |
|---|---|
| `Tab` | Cria nó filho conectado à direita |
| `Enter` | Cria nó irmão abaixo |
| `Delete` | Remove nó(s) selecionado(s) |
| `Ctrl/Cmd+Z` | Desfazer |
| `Ctrl/Cmd+Y` ou `Ctrl/Cmd+Shift+Z` | Refazer |

**Persistência e performance:**
- Auto-save com debounce de 600ms para Firestore (`groups/{groupId}/mindMap/board`).
- `isRemoteUpdateRef` previne loop write→snapshot→write.
- `nodeTypes` definido fora do componente — evita remount de todos os nós a cada render.
- `memo()` nos nós e toolbar; `useCallback` em todos os handlers; `useMemo` no context value.

**Responsividade:**
- Toolbar com `overflow-x-auto scrollbar-none` e `max-w-[calc(100%-1rem)]` — nunca extrapola o container.
- Zoom +/− ocultos em mobile (`hidden sm:inline-flex`) — substituídos por pinch-to-zoom nativo.
- Botões da toolbar: `h-8 w-8` em mobile → `h-9 w-9` em desktop.
- Handles dos nós: `16px` para toque confortável.
- Altura do canvas: `clamp(340px, calc(100svh - 380px), 80svh)`.
- Dica do empty state: "duplo clique" em desktop, "toque duplo" em mobile.

### 📈 Ferramentas Avançadas
- **Simulador de Notas:** Planeje quanto precisa tirar para atingir sua meta de CR.
- **Gestão de Certificados:** Adicione horas complementares e veja o impacto no seu progresso.
- **Previsão de Formatura:** Estimativa dinâmica de quando você deve concluir o curso com base no ritmo atual.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 16.1.6 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Shadcn/UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Banco de Dados & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Canvas interativo:** [@xyflow/react v12](https://reactflow.dev/) (Mapa Mental)
- **Layout de grafos:** [Dagre](https://github.com/dagrejs/dagre) (Auto-layout do Mapa Mental)
- **Exportação de imagem:** [html-to-image](https://github.com/bubkoo/html-to-image) (PNG do Mapa Mental)
- **Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [SheetJS (XLSX)](https://sheetjs.com/)
- **Impressão:** API nativa do navegador (`window.print()` + `@media print`)

---

## 🔄 Changelog

### v2.7 — Mapa Mental Colaborativo

**Canvas e nós:**
- Canvas interativo construído sobre `@xyflow/react` v12 com `ReactFlowProvider`, `nodeTypes` estático e `memo()` em todos os nós e toolbar.
- CRUD completo via menu de contexto (`@radix-ui/react-context-menu`): adicionar, editar inline, duplicar, excluir, alterar forma, aplicar tema de cor WCAG.
- 5 temas de cor pré-definidos com contraste garantido (Padrão, Destaque Escuro, Alerta, Sucesso, Atenção) com preview "Aa" no submenu.
- Drop to Create: arrastar handle → soltar no canvas → novo nó conectado no ponto exato (`onConnectEnd` + `screenToFlowPosition`).

**Histórico (Undo/Redo):**
- Pilhas `pastRef`/`futureRef` (até 30 estados) com shallow copy de nós e arestas.
- `pushHistory()` chamado antes de cada mutação local e no início de drag.
- `isOwnSaveRef` resolve o bug de bounce: o próprio save no Firestore não limpa o histórico; apenas updates de outros usuários limpam.
- Botões Undo/Redo na toolbar com estado reativo (`canUndo`/`canRedo` como `useState`), habilitados/desabilitados com feedback visual.

**Multi-seleção:**
- `Shift+Click` / `Shift+Drag` seleciona múltiplos nós (suporte nativo do React Flow).
- Menu de contexto aplica cor ou exclusão em massa quando o nó clicado está selecionado: `deleteNodes(ids)` / `updateNodesData(ids, data)`.

**Auto-layout:**
- Botão "Organizar" aplica `rankdir: 'LR'` via Dagre + `fitView` automático após 50ms.

**Exportação PNG:**
- Estratégia oficial xyflow: captura `.react-flow__viewport` com `getNodesBounds` + `getViewportForBounds`.
- Dimensões calculadas a partir dos bounds reais (`+200px` de padding) — sem nós minúsculos no centro.
- Fundo detectado em runtime; arestas com `stroke` hexadecimal absoluto e `strokeWidth: 2` para garantir visibilidade.

**Multiplayer:**
- Cursores em tempo real: `onPointerMove` → debounce 50ms → `updateCursorPosition()` no Firestore.
- `<CursorOverlay>` com `useViewport()` + `flowToScreenPosition()` para re-renderizar em pan/zoom.

**Ecossistema:**
- Vincular materiais do grupo a nós (`attachments[]` + modal + badge Paperclip).
- Converter nó em tarefa do Kanban com um clique ("Converter em tarefa").

**Responsividade:**
- Toolbar adaptativa: zoom oculto em mobile, `overflow-x-auto`, botões `h-8` em mobile.
- Altura do canvas com `clamp(340px, calc(100svh - 380px), 80svh)`.
- Handles de 16px para toque confortável.

---

### v2.6 — Kanban Avançado

- **Cartões post-it:** Cor de fundo personalizável por paleta pré-definida ou seletor manual de cor. Contraste de texto calculado via luminância WCAG — texto sempre legível em qualquer cor.
- **Etiquetas:** 8 etiquetas fixas com cores distintas (Prioridade, Bloqueado, Em revisão, Design, etc.) exibidas como faixas coloridas no cartão. Ocultas por padrão, visíveis ao editar o cartão.
- **Checklists:** Múltiplas listas de verificação nomeadas por cartão. Barra de progresso e contador `concluídos/total` visível diretamente no quadro.
- **Links/Anexos:** Adicione links com rótulo opcional; indicador com ícone e contador no cartão.
- **Membros online:** Presença em tempo real via Firestore heartbeat (20 s) + TTL (45 s). Avatares com pulsação verde exibem quem está visualizando o quadro. Subcoleção `presence` protegida por regras Firestore.
- **Notificações de atividade:** Toast automático ao detectar novas entradas de atividade de outros membros; exibe nome real do autor (salvo junto à entrada de atividade no Firestore).
- **Menu de opções da lista:** Adicionar cartão, ordenar por (mais recentes, mais antigos, A→Z, Z→A), copiar lista para área de transferência, mover lista esquerda/direita, remover lista customizada.
- **Colunas personalizadas:** Crie, reordene e remova colunas além das padrão. Ordem persistida no Firestore.
- **Busca e filtros:** Barra com busca textual, filtro por etiqueta (dots coloridos), filtro por responsável e filtro por prazo (atrasados / próximos 2 dias). Botão "Limpar" remove todos os filtros.
- **Data de entrega inline:** Campo de prazo disponível diretamente no formulário de criação de cartão, sem abrir o modal.
- **Modo compacto:** Tecla `C` ou botão na barra de filtros alterna para linha única por cartão (sem faixa, sem dobra, sem indicadores expandidos).
- **Atalhos de teclado:** `/` foca a busca; `N` abre o add-card na primeira coluna.
- **Animação drag-and-drop:** Cartão gira 2° e escala ao ser arrastado; keyframe `card-settle` aplica micro-bounce ao soltar.
- **Descrição como ícone:** Cartões com descrição exibem ícone em vez de trecho de texto.

---

### v2.5 — Grupos de Estudo

- **Nova página `/grupos`:** Módulo completo de gestão de grupos de estudo.
- **Criação e entrada por convite:** Crie grupos e compartilhe o código gerado automaticamente; membros entram digitando o código na tela de grupos.
- **Quadro Kanban:** Quadro de tarefas estilo Trello com três colunas (A Fazer, Em Andamento, Concluído), adição inline por coluna e drag-and-drop para mover cartões.
- **Detalhes da tarefa:** Modal de edição com título, descrição, responsável e data de entrega.
- **Barra de progresso:** Percentual de tarefas concluídas exibido na página do grupo.
- **Controles de dono:** Editar nome/descrição do grupo e excluir grupo (somente dono). Membros podem sair do grupo a qualquer momento.
- **Regras Firestore:** Coleções `groups`, `groups/materials` e `groups/tasks` protegidas — leitura/escrita restrita a membros autenticados; entrada por convite via `onlyAddingSelf()`.
- **Foto de perfil no nav:** Avatar do cabeçalho prioriza foto personalizada (Firestore) > foto do Google OAuth > inicial do nome. Menu do usuário condensado em dropdown para Perfil e Certificados.

---

### v2.4 — Grade Curricular

- **Nova página `/grade`:** Grade Curricular completa e interativa.
- **Disciplinas por semestre:** Obrigatórias organizadas por semestre do curso, com status visual (aprovado, em curso, pendente).
- **Matching em três camadas:** Código exato → prefixo de turma (sufixo de turma como `CTIA10B`) → nome canônico do catálogo — resolve casos onde o código do SIGAA difere do catálogo.
- **Nota e período da aprovação:** Sempre exibe a nota e o semestre da tentativa aprovada, nunca de reprovações ou trancamentos.
- **Abas por natureza:** OB, OP/OX/OG, AC/OZ, LV — cada grupo com sua própria visualização.
- **Seleção de curso:** Alternância de curso diretamente na página, sem necessidade de recarregar.
- **SEO protegido:** Página autenticada com `robots: noindex, nofollow`.

---

### v2.3 — Grade de Horários

- **Nova página `/horarios`:** Grade semanal interativa das disciplinas em curso, com visualização de Segunda a Sábado e slots de 07:00 às 22:10.
- **Código de horário:** Suporte ao formato padrão UFBA (ex: `46T56` — dias, turno e slots). Células com múltiplos horários usam rowspan automático.
- **Persistência no Firebase:** Códigos de horário salvos em `users/{userId}.horarioCodes` — disponíveis após logout e re-login.
- **Disciplinas automáticas:** Disciplinas marcadas como "em curso" aparecem automaticamente na grade, sem configuração manual.

---

### v2.2 — Qualidade, Segurança e Arquitetura

#### 🔒 Segurança
- **Firestore Rules corrigidas:** Regras separadas por operação (`allow create`, `allow update`, `allow delete`) corrigem bug que bloqueava silenciosamente todas as exclusões em produção. Adicionada imutabilidade do campo `userId` nos updates.
- **Validação de URLs externas:** Função `isSafeExternalUrl()` bloqueia protocolos perigosos (`javascript:`, `data:`, `vbscript:`) antes de qualquer `window.open()`. Links externos abertos com `noopener,noreferrer`.
- **CSP endurecido:** Removido `https://unpkg.com` do `script-src`. Domínios de imagem restritos a `*.googleusercontent.com` e `*.firebaseusercontent.com`. Removido header `X-XSS-Protection` depreciado.

#### 🏗️ Arquitetura
- **Camada de serviço completa:** Todo acesso ao Firebase consolidado em `services/` — eliminados imports diretos do Firebase nos componentes de interface.
- **Schema do Firestore corrigido:** `updateProfile` agora usa dot-notation (`profile.course`, `profile.enrollment`, etc.) para atualizar campos aninhados sem sobrescrever o objeto `profile` inteiro.
- **Import estático do catálogo:** `disciplinas.json` migrado de fetch runtime (com cache-busting) para static import em tempo de build — elimina requisição de rede e garante disponibilidade offline.
- **localStorage como cache-only:** Escrita no localStorage gateada com `!user` — usuários logados usam exclusivamente o Firestore como fonte de verdade.
- **Componentes `Select` padronizados:** Todos os `<select>` nativos substituídos pelo componente `Select` do design system (shadcn/ui), garantindo consistência visual e suporte a dark mode.
- **Dirty-check por campo:** Substituído `JSON.stringify` na comparação de perfil por `isProfileDirty()` — evita serialização desnecessária e falsos positivos.

#### 🧪 Testes
- **88 novos testes:** Cobertura adicionada para `services/firestore.service.ts`, `services/auth.service.ts` e `lib/certificate-ocr.ts` — incluindo mocks de Firestore, guards de autenticação e todos os padrões de extração OCR.
- **Thresholds por arquivo:** Coverage mínimo configurado individualmente para os módulos críticos de `lib/` e `services/`.

---

### v2.1 — Funcionalidades e Experiência

- **Semestre dinâmico:** Substituído o valor fixo `'2025.2'` por `getCurrentSemester()` em todo o sistema.
- **Disciplinas Pendentes inteligentes:** Recomendações com progressão sequencial (numerais romanos e letras) e priorização por déficit de categoria.
- **Ocultação automática de pendentes:** Painel suprimido quando disciplinas em curso já cobrem todos os déficits restantes.
- **Gráfico de CR expandido:** CR acumulado (linha sólida) e média isolada por semestre (linha tracejada) no mesmo gráfico, com tooltip detalhado.
- **Exportar PDF:** Modo de impressão otimizado via `window.print()`, sem dependências externas.
- **Importação de PDF aprimorada:** Duplicatas internas ao PDF e registros já existentes são ignorados, com resumo ao final.
- **Perfil público:** Página `/u/[userId]` com controle de privacidade e visão completa para visitantes autorizados.

---

## 📐 Lógica de Semestralização (UFBA)

O sistema implementa rigorosamente a fórmula de período letivo do SIGAA:

`Semestralização = (Total de Semestres Cursados) – (Número de Suspensões) + (Perfil Inicial)`

- **Total de Semestres:** Tempo transcorrido desde o ingresso.
- **Suspensões:** Períodos de trancamento total ou mobilidade.
- **Perfil Inicial:** Créditos externos (dispensas/transferências) que aceleram a semestralização.
  - *Nota: Disciplinas cursadas normalmente na UFBA não alteram o perfil inicial, apenas o tempo decorrido.*

---

## 📁 Estrutura do Projeto

```text
Historico-Universitario/
├── 📁 app/               # Rotas e Páginas (Next.js App Router)
├── 📁 components/        # Componentes UI e lógicas de interface
│   ├── 📁 features/      # Funcionalidades específicas
│   │   └── 📁 groups/
│   │       ├── 📁 components/
│   │       │   ├── 📁 mind-map/   # Canvas, nós, toolbar, overlays
│   │       │   └── ...            # Kanban, materiais, presença
│   │       └── 📁 hooks/          # useMindMap, usePresence, useCursorBroadcast
│   ├── 📁 layout/        # Cabeçalho, Rodapé, Sidebar
│   └── 📁 ui/            # Componentes base (Shadcn)
├── 📁 lib/               # Utilitários, Config Firebase, Lógicas de cálculo
├── 📁 public/            # Assets estáticos e imagens
├── 📁 services/          # Camada de acesso ao Firebase (Firestore, Storage)
├── 📁 types/             # Definições de tipos TypeScript
├── 📁 __tests__/         # Testes Unitários e Integração (Jest)
└── 📁 e2e/               # Testes de Ponta a Ponta (Playwright)
```

---

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js 22.x ou superior
- NPM ou Yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/LuisT-ls/Historico-Universitario.git
cd Historico-Universitario
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (.env.local):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... (restante das credenciais do Firebase)
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

---

## 🧪 Testes

Cobertura robusta com Jest + React Testing Library e Playwright para E2E.
Veja [TESTES.md](./TESTES.md) para comandos, estrutura e detalhes de cobertura por suite.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para configuração do ambiente, convenções de commit, como estender o parser do SIGAA, adicionar novos cursos e abrir um PR.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Desenvolvedor
**Luís Antonio Souza Teixeira**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/LuisT-ls)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/luis-tei)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/luis.tei)

---
⭐ **Gostou do projeto? Deixe uma estrela no GitHub!**
