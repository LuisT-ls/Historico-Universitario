# 📚 Histórico Acadêmico UFBA v2.0

> [!IMPORTANT]
> **Aviso Legal:** Este é um projeto **independente** desenvolvido para auxiliar os estudantes do **ICTI/UFBA (Campus de Camaçari)**. Este software **não possui vínculo oficial** com a Universidade Federal da Bahia (UFBA) ou com a administração do SIGAA.

Uma plataforma moderna e intuitiva para estudantes da UFBA gerenciarem sua trajetória acadêmica. O sistema permite o upload do histórico do SIGAA, calcula estatísticas em tempo real e oferece uma visão clara do progresso rumo à formatura.

![Dashboard Preview](imagem-preview.jpg)

## 🚀 Acesse Agora
[https://historicoacademico.vercel.app](https://historicoacademico.vercel.app)

---

## ✨ Funcionalidades Principais

### 📊 Gestão Acadêmica Inteligente
- **Importação de PDF:** Basta subir seu histórico do SIGAA e o sistema extrai todas as disciplinas automaticamente.
- **Cálculo de CR:** Coeficiente de Rendimento calculado em tempo real, seguindo as normas da UFBA.
- **Semestralização Oficial:** Novo sistema de cálculo de período letivo baseado na fórmula oficial do SIGAA.
- **Visualização de Progresso:** Gráficos e barras de progresso por natureza de disciplina (OB, OP, AC, etc.).

### 🔐 Segurança e Sincronização
- **Autenticação Firebase:** Login via Google ou Email/Senha.
- **Sincronização Cloud:** Seus dados são salvos no Firestore e sincronizados entre todos os seus dispositivos.
- **Privacidade:** Opção de manter seu perfil privado ou público.

### 📈 Ferramentas Avançadas
- **Simulador de Notas:** Planeje quanto precisa tirar para atingir sua meta de CR.
- **Gestão de Certificados:** Adicione horas complementares e veja o impacto no seu progresso.
- **Exportação completa:** Exporte seus dados em **PDF estilizado**, **Excel (XLSX)** ou **JSON**.

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
