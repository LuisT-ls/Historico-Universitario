# Histórico Acadêmico

![Preview do Projeto](imagem-preview.png)

Uma aplicação web para gerenciar e acompanhar o histórico acadêmico dos estudantes universitários, com suporte inicial para os cursos de BICTI, Engenharia de Produção e Engenharia Elétrica.

🔗 [Acesse o projeto](https://historicoacademico.vercel.app/)

## 📋 Sobre o Projeto

O Histórico Acadêmico é uma ferramenta que permite aos estudantes:

- Registrar e gerenciar disciplinas cursadas
- Acompanhar o progresso em direção à formatura
- Calcular médias e carga horária total
- Visualizar requisitos por natureza de componente
- Buscar disciplinas específicas do seu curso
- Acessar lista de ementas do curso

### 🎓 Cursos Suportados

- BICTI (Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação)
  - Total de horas necessárias: 2400h
- Engenharia de Produção
  - Total de horas necessárias: 3750h
- Engenharia Elétrica
  - Total de horas necessárias: 3910h

## 🚀 Funcionalidades

- **Seleção de Curso**: Escolha entre BICTI, Engenharia de Produção ou Engenharia Elétrica
- **Gerenciamento de Disciplinas**:
  - Adicionar disciplinas cursadas
  - Registrar notas e carga horária
  - Marcar disciplinas como trancadas
- **Filtro e Busca**:
  - Pesquisa por código ou nome da disciplina
  - Filtragem específica por curso
- **Resumo e Métricas**:
  - Média geral
  - Total de horas cursadas
  - Horas restantes por natureza
  - Progresso para formatura
- **Planilha de Ementas**: Visualização de ementas do curso
- **Autenticação de Usuário**: Login e gerenciamento de sessão

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com organização modular)
- JavaScript (ES6+)
- LocalStorage para persistência de dados
- Font Awesome para ícones

## 📁 Estrutura do Projeto

```
.
├── assets/
│   ├── css/             # Estilos CSS organizados em módulos
│   │   ├── auth/        # Estilos específicos para autenticação
│   │   ├── main.css     # Estilos principais
│   │   └── modules/     # Módulos CSS organizados por funcionalidade
│   │       ├── base/         # Estilos base como reset, tipografia, variáveis e animações
│   │       ├── components/   # Componentes reutilizáveis
│   │       │   ├── auth/     # Estilos para componentes de autenticação
│   │       ├── features/      # Estilos específicos para funcionalidades
│   │       ├── layout/        # Estilos de layout
│   │       └── utils/         # Utilitários
│   ├── data/            # Dados JSON das disciplinas
│   │   └── disciplinas.json
│   └── img/             # Imagens e favicons
│       ├── favicon/     # Ícones de favoritos
│       ├── logo.png     # Logotipo do projeto
│       └── og-image.jpg # Imagem para Open Graph (compartilhamento em redes sociais)
├── js/
│   ├── app.js           # Arquivo principal
│   └── modules/         # Módulos JavaScript
│       ├── auth/        # Funcionalidades de autenticação
│       │   ├── firebase/       # Integração com Firebase para autenticação
│       │   ├── index.js        # Módulo de autenticação principal
│       │   └── profile-manager.js # Gerenciamento de perfis de usuário
│       ├── constants.js # Constantes do projeto
│       ├── firebase/    # Configuração e integração com Firebase
│       ├── security/    # Módulos relacionados à segurança
│       ├── simulation/  # Simulação de cálculos e cenários
│       ├── storage.js   # Manipulação de armazenamento local
│       ├── ui/          # Componentes e interações da interface do usuário
│       └── utils.js     # Utilitários JavaScript
├── legal/              # Documentação legal
│   ├── css/            # Estilos para páginas legais
│   │   └── legal.css
│   ├── privacy.html    # Página de política de privacidade
│   └── terms.html      # Página de termos de uso
├── index.html          # Página principal
├── login.html          # Página de login
├── manifest.json       # Arquivo de configuração para PWA
├── robots.txt          # Arquivo para configuração de robôs de busca
├── sitemap.xml         # Mapa do site para SEO
├── sw.js               # Service Worker para funcionalidades offline
├── imagem-preview.png  # Imagem de pré-visualização
├── LICENSE             # Licença do projeto
└── README.md           # Documentação do projeto

```

### 📊 Organização CSS

- **Base**: Reset, tipografia, variáveis, scrollbar e animações
- **Components**: Botões, formulários, ícones, tabelas, notificações, logomarca, progressos e data e hora
- **Features**: Filtros, períodos, resumos, ementa, simulação, sumário, gráficos
- **Layout**: Container, footer, grid
- **Utils**: Responsividade, status, impressão, usuário, dark mode

## 🚦 Como Usar

1. Acesse o [site do projeto](https://historicoacademico.vercel.app/)
2. Faça login na plataforma
3. Selecione seu curso (BICTI, Engenharia de Produção ou Engenharia Elétrica)
4. Adicione suas disciplinas cursadas:
   - Preencha o semestre
   - Insira código e nome da disciplina
   - Selecione a natureza
   - Informe carga horária e nota
5. Acompanhe seu progresso no painel de resumo

## 💻 Desenvolvimento Local

1. Clone o repositório:

```bash
git clone https://github.com/LuisT-ls/Historico-Universitario.git
```

2. Abra o projeto:

```bash
cd Historico-Universitario
```

3. Inicie um servidor local:

- Use o Live Server do VS Code

4. Acesse `http://localhost:5500` no navegador

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Luís Antonio Souza Teixeira - [GitHub](https://github.com/LuisT-ls)

## 🎯 Status do Projeto

🚧 Em desenvolvimento contínuo...

---

⌨️ Feito com ❤️ por [Luís Teixeira](https://github.com/LuisT-ls)
