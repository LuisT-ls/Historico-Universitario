# 📚 Histórico Universitário

Sistema web completo para gerenciamento de histórico acadêmico universitário com autenticação Firebase, sincronização em tempo real e armazenamento em nuvem.

## ✨ Funcionalidades Principais

### 🔐 Autenticação Avançada

- **Login múltiplo:** Email/senha e Google OAuth
- **Sincronização automática:** Dados sincronizados entre dispositivos em tempo real
- **Perfil personalizado:** Informações acadêmicas e configurações
- **Segurança:** Proteção CSRF e validação de tokens

### 📊 Gestão Acadêmica Completa

- **Disciplinas dinâmicas:** Adicionar, editar e remover disciplinas
- **Cálculo automático:** CR (Coeficiente de Rendimento) em tempo real
- **Requisitos de formatura:** Acompanhamento visual de progresso
- **Estatísticas detalhadas:** Total de disciplinas, horas, créditos
- **Filtros avançados:** Por período, natureza, status

### 🎨 Interface Moderna

- **Tema responsivo:** Claro, escuro e automático
- **Design adaptativo:** Funciona em desktop, tablet e mobile
- **Animações suaves:** Transições e feedback visual
- **Acessibilidade:** Suporte completo a leitores de tela

### 📈 Recursos Avançados

- **Simulação acadêmica:** Planeje sua trajetória acadêmica
- **Exportação de dados:** PDF, Excel e CSV
- **Backup automático:** Dados salvos na nuvem
- **URLs amigáveis:** Navegação limpa sem extensões .html

## 🎯 Cursos Suportados

- **BICTI** - Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação
- **ENG PROD** - Engenharia de Produção
- **ENG ELE** - Engenharia Elétrica

## 🛠️ Stack Tecnológica

### Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com Grid/Flexbox
- **JavaScript ES6+** - Lógica dinâmica e modular
- **Font Awesome** - Ícones profissionais

### Backend & Infraestrutura

- **Firebase Authentication** - Autenticação segura
- **Firestore Database** - Banco de dados NoSQL
- **Firebase Security Rules** - Regras de segurança
- **Vercel** - Deploy e CDN global

### Funcionalidades Especiais

- **Service Worker** - Cache offline
- **PWA** - Instalação como app
- **Sincronização em tempo real** - Dados sempre atualizados
- **Proteção CSRF** - Segurança contra ataques

## 📁 Arquitetura do Projeto

```
Historico-Universitario/
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── main.css
│   │   ├── profile.css
│   │   └── 📁 modules/
│   │       ├── 📁 auth/
│   │       ├── 📁 components/
│   │       ├── 📁 features/
│   │       ├── 📁 layout/
│   │       └── 📁 utils/
│   └── 📁 img/
├── 📁 js/
│   ├── app.js
│   └── 📁 modules/
│       ├── 📁 firebase/
│       │   ├── auth.js
│       │   ├── data.js
│       │   └── sync-manager.js
│       ├── 📁 ui/
│       ├── 📁 security/
│       └── utils.js
├── 📁 docs/
├── 📁 legal/
├── index.html
├── login.html
├── profile.html
├── vercel.json
└── firestore.rules
```

## 🚀 Configuração Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/LuisT-ls/Historico-Universitario.git
cd Historico-Universitario
```

### 2. Configure o Firebase

1. **Crie um projeto no [Firebase Console](https://console.firebase.google.com)**
2. **Ative Authentication:**
   - Email/Password
   - Google Sign-in
3. **Crie um banco Firestore**
4. **Configure as regras de segurança** (use o arquivo `firestore.rules`)

### 3. Configure as Credenciais

Edite `js/modules/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: 'sua-api-key',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto-id',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '123456789',
  appId: 'seu-app-id'
}
```

### 4. Deploy

#### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

#### GitHub Pages

1. Push para o repositório
2. Ative GitHub Pages nas configurações
3. Configure domínio customizado (opcional)

## 🔧 Funcionalidades Técnicas

### Sincronização em Tempo Real

- **Dados sempre atualizados** entre dispositivos
- **Sincronização automática** a cada 30 segundos
- **Detecção de mudanças** inteligente
- **Backup automático** na nuvem

### Segurança Avançada

- **Proteção CSRF** em todas as operações
- **Validação de tokens** em tempo real
- **Regras Firestore** restritivas
- **Sanitização de dados** completa

### Performance Otimizada

- **Lazy loading** de componentes
- **Cache inteligente** de dados
- **Compressão de assets**
- **CDN global** via Vercel

## 📖 Documentação

### Guias Detalhados

- **Configuração Firebase:** `docs/documentation/`
- **Regras de Segurança:** `firestore.rules`
- **Testes:** `docs/test-pages/`

### Páginas de Teste

- `docs/test-pages/test-profile.html` - Teste do perfil
- `docs/test-pages/test-firestore.html` - Teste das regras
- `docs/test-pages/test-login.html` - Teste de autenticação

## 🐛 Solução de Problemas

### Erro de Permissões Firestore

```
FirebaseError: Missing or insufficient permissions.
```

**Solução:** Configure as regras conforme `firestore.rules`

### Sincronização Não Funciona

**Verifique:**

1. Conexão com internet
2. Configuração do Firebase
3. Console do navegador para erros

### Tema Não Persiste

**Solução:** Verifique localStorage e cookies do navegador

## 🤝 Como Contribuir

1. **Fork** o projeto
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/NovaFuncionalidade
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/NovaFuncionalidade
   ```
5. **Abra um Pull Request**

### Padrões de Código

- Use **ES6+** para JavaScript
- Siga **BEM** para CSS
- Mantenha **semântica HTML**
- Documente funções complexas

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para detalhes.

## 👨‍💻 Desenvolvedor

**Luís Antonio Souza Teixeira**

- 🌐 **GitHub:** [@LuisT-ls](https://github.com/LuisT-ls)
- 💼 **LinkedIn:** [luis-tei](https://linkedin.com/in/luis-tei)
- 📸 **Instagram:** [@luis.tei](https://instagram.com/luis.tei)

## 🙏 Agradecimentos

- **Firebase** pela infraestrutura robusta
- **Font Awesome** pelos ícones profissionais
- **Vercel** pela plataforma de deploy
- **Comunidade open source** pelo suporte

## 📊 Estatísticas do Projeto

- ✅ **100% Funcional** - Todas as features implementadas
- 🔒 **Seguro** - Proteção CSRF e validação completa
- 📱 **Responsivo** - Funciona em todos os dispositivos
- ⚡ **Rápido** - Otimizado para performance
- 🌐 **Acessível** - Suporte completo a acessibilidade

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**

**Acesse:** [https://historicoacademico.vercel.app](https://historicoacademico.vercel.app)
