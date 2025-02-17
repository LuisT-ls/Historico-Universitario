# Histórico Universitário UFBA

![Preview do Projeto](imagem-preview.jpg)

Uma aplicação web para gerenciar e acompanhar o histórico acadêmico dos estudantes da Universidade Federal da Bahia (UFBA), com suporte inicial para os cursos de BICTI e Engenharia de Produção.

🔗 [Acesse o projeto](https://historicoufba.vercel.app/)

## 📋 Sobre o Projeto

O Histórico Universitário UFBA é uma ferramenta que permite aos estudantes:

- Registrar e gerenciar disciplinas cursadas
- Acompanhar o progresso em direção à formatura
- Calcular médias e carga horária total
- Visualizar requisitos por natureza de componente
- Buscar disciplinas específicas do seu curso

### 🎓 Cursos Suportados

- BICTI (Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação)
  - Total de horas necessárias: 2400h
- Engenharia de Produção
  - Total de horas necessárias: 3750h

## 🚀 Funcionalidades

- **Seleção de Curso**: Escolha entre BICTI e Engenharia de Produção
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
│   ├── css/           # Estilos CSS organizados em módulos
│   │   ├── auth/      # Estilos específicos para autenticação
│   │   │   └── login.css
│   │   ├── main.css   # Estilos principais
│   │   └── modules/   # Módulos CSS organizados por funcionalidade
│   │       ├── base/  # Estilos base como reset, tipografia, variáveis e animações
│   │       ├── components/ # Componentes reutilizáveis como botões, formulários, ícones, etc.
│   │       ├── features/   # Estilos específicos para funcionalidades como filtros, períodos, resumos
│   │       ├── layout/     # Estilos de layout como container, footer, grid
│   │       └── utils/      # Utilitários como responsividade, status, etc.
│   ├── data/          # Dados JSON das disciplinas
│   └── img/           # Imagens e favicons
├── js/
│   ├── app.js         # Arquivo principal
│   └── modules/       # Módulos JavaScript
│       ├── auth/      # Módulos de autenticação
│       ├── constants.js # Constantes do projeto
│       ├── storage.js  # Gerenciamento de LocalStorage
│       ├── ui/         # Módulos de interface do usuário
│       └── utils.js    # Utilitários JavaScript
├── index.html         # Página principal
├── login.html         # Página de login
├── manifest.json      # Arquivo de configuração para PWA
├── robots.txt         # Arquivo para configuração de robôs de busca
├── sitemap.xml        # Mapa do site para SEO
└── sw.js              # Service Worker para funcionalidades offline
```

### 📊 Organização CSS

- **Base**: Reset, tipografia, variáveis e animações
- **Components**: Botões, formulários, ícones, tabelas
- **Features**: Filtros, períodos, resumos
- **Layout**: Container, footer, grid
- **Utils**: Responsividade, status

## 🚦 Como Usar

1. Acesse o [site do projeto](https://historicoufba.vercel.app/)
2. Faça login na plataforma
3. Selecione seu curso (BICTI ou Engenharia de Produção)
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

Luís Teixeira - [GitHub](https://github.com/LuisT-ls)

## 🎯 Status do Projeto

🚧 Em desenvolvimento contínuo...

---

⌨️ com ❤️ por [Luís Teixeira](https://github.com/LuisT-ls)

```

```
