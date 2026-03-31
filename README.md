# 📚 Histórico Acadêmico UFBA v2.6

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

### 📈 Ferramentas Avançadas
- **Simulador de Notas:** Planeje quanto precisa tirar para atingir sua meta de CR.
- **Gestão de Certificados:** Adicione horas complementares e veja o impacto no seu progresso.
- **Previsão de Formatura:** Estimativa dinâmica de quando você deve concluir o curso com base no ritmo atual.

---

## 🛠️ Stack Tecnológica

O projeto foi totalmente migrado para as tecnologias mais modernas do ecossistema Web:

- **Framework:** [Next.js 16.1.6 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Shadcn/UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Banco de Dados & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [SheetJS (XLSX)](https://sheetjs.com/)
- **Impressão:** API nativa do navegador (`window.print()` + `@media print`)

---

## 🔄 Changelog

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
│   ├── 📁 features/      # Funcionalidades específicas (Dashboard, Summary)
│   ├── 📁 layout/        # Cabeçalho, Rodapé, Sidebar
│   └── 📁 ui/            # Componentes base (Shadcn)
├── 📁 lib/               # Utilitários, Config Firebase, Lógicas de cálculo
├── 📁 public/            # Assets estáticos e imagens
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
