# 📚 Histórico Acadêmico UFBA v2.1

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
- **Autenticação Firebase:** Login via Google ou Email/Senha.
- **Sincronização Cloud:** Seus dados são salvos no Firestore e sincronizados entre todos os seus dispositivos.
- **Privacidade:** Opção de manter seu perfil privado ou público.

### 🌐 Perfil Público
- **Link compartilhável:** Cada usuário possui um perfil público acessível em `/u/[userId]`.
- **Controle de privacidade:** Apenas perfis configurados como públicos são visíveis externamente.
- **Visão completa para terceiros:** O perfil público exibe CR, horas por categoria, disciplinas aprovadas e certificados de atividades complementares.

### 🖨️ Exportar PDF / Modo de Impressão
- **Exportar PDF:** Botão "Exportar PDF" no resumo acadêmico aciona o diálogo nativo de impressão do navegador.
- **Layout otimizado:** O modo de impressão (`@media print`) exibe um documento estruturado com cabeçalho, tabela de métricas, progresso por categoria e histórico completo de disciplinas.
- **Sem dependências extras:** Utiliza a API nativa do navegador (`window.print()`), sem bibliotecas adicionais.

### 📈 Ferramentas Avançadas
- **Simulador de Notas:** Planeje quanto precisa tirar para atingir sua meta de CR.
- **Gestão de Certificados:** Adicione horas complementares e veja o impacto no seu progresso.
- **Previsão de Formatura:** Estimativa dinâmica de quando você deve concluir o curso com base no ritmo atual.

---

## 🛠️ Stack Tecnológica

O projeto foi totalmente migrado para as tecnologias mais modernas do ecossistema Web:

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Shadcn/UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Banco de Dados & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [SheetJS (XLSX)](https://sheetjs.com/)
- **Impressão:** API nativa do navegador (`window.print()` + `@media print`)

---

## 🔄 Changelog v2.1

### Melhorias implementadas

- **Semestre dinâmico:** Substituído o valor fixo `'2025.2'` por `getCurrentSemester()` em todo o sistema — o semestre atual é calculado automaticamente com base no mês corrente.
- **Disciplinas Pendentes inteligentes:** Novo componente de recomendações com dois níveis de prioridade:
  1. Progressão sequencial — detecta automaticamente continuações de disciplinas (numerais romanos e letras).
  2. Déficit por categoria — recomenda disciplinas das naturezas onde ainda faltam horas para formatura.
- **Ocultação automática de pendentes:** Quando as disciplinas em curso já cobrem todos os déficits restantes (por natureza), o painel de recomendações é suprimido — evitando alertas desnecessários para quem está prestes a se formar.
- **Gráfico de CR expandido:** A evolução do CR agora exibe duas linhas: CR acumulado (sólida, azul) e média isolada do semestre (tracejada, verde), com tooltip detalhado e legenda.
- **Exportar PDF:** Botão no resumo aciona o modo de impressão otimizado para gerar PDF via navegador, sem dependências externas.
- **Layout de impressão:** `@media print` com visibilidade seletiva garante que apenas o resumo acadêmico seja impresso, em formato A4 estruturado.
- **Importação de PDF aprimorada:** Duplicatas internas ao PDF e registros já existentes no histórico são ignorados (não sobrescritos), com resumo informativo ao final da importação.
- **Perfil público:** Página `/u/[userId]` com controle de privacidade, exibindo CR, horas por categoria, disciplinas e certificados para visitantes autorizados.

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

O projeto conta com uma cobertura robusta de testes:

- **Unitários/Integração:** `npm run test` (Jest + React Testing Library)
- **E2E:** `npm run test:e2e` (Playwright)
- **Lint:** `npm run lint`

---

## 🤝 Contribuição

Contribuições são muito bem-vindas!
1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`).
3. Faça o commit (`git commit -m 'feat: Adiciona nova funcionalidade'`).
4. Envie para o repositório (`git push origin feature/minha-feature`).
5. Abra um Pull Request.

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
