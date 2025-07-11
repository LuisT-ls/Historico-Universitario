# 📚 Histórico Universitário

Sistema web para gerenciamento de histórico acadêmico universitário com autenticação Firebase e armazenamento em nuvem.

## 🚀 Funcionalidades

### ✅ Autenticação e Perfil

- Login com email/senha e Google
- Perfil do usuário com informações pessoais
- Configurações de tema (claro/escuro/automático)
- Notificações e privacidade
- Exportação de dados

### ✅ Gestão Acadêmica

- Adicionar/remover disciplinas
- Cálculo automático de CR
- Acompanhamento de requisitos de formatura
- Estatísticas acadêmicas
- Histórico completo

### ✅ Cursos Suportados

- **BICTI** - Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação
- **Engenharia de Produção**
- **Engenharia Elétrica**

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase (Authentication, Firestore)
- **UI/UX:** Font Awesome, CSS Grid/Flexbox
- **Deploy:** Vercel

## 📁 Estrutura do Projeto

```
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── profile.css
│   │   └── modules/
│   └── img/
├── js/
│   ├── app.js
│   └── modules/
│       ├── firebase/
│       ├── ui/
│       └── utils/
├── docs/
│   ├── documentation/
│   └── test-pages/
├── index.html
├── login.html
├── profile.html
└── firestore.rules
```

## 🔧 Configuração

### 1. Firebase Setup

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password e Google)
3. Crie um banco Firestore
4. Configure as regras de segurança (`firestore.rules`)

### 2. Configuração das Regras

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // ... outras regras
  }
}
```

### 3. Variáveis de Ambiente

Configure as credenciais do Firebase em `js/modules/firebase/config.js`

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### GitHub Pages

1. Faça push para o repositório
2. Ative GitHub Pages nas configurações
3. Configure o domínio customizado (opcional)

## 📖 Documentação

- **Configuração Firebase:** `docs/documentation/CONFIGURACAO_FIRESTORE.md`
- **Resolução de Problemas:** `docs/documentation/RESOLVER_PERMISSOES.md`
- **Testes:** `docs/test-pages/`

## 🔍 Testes

### Páginas de Teste

- `docs/test-pages/test-profile.html` - Teste do perfil
- `docs/test-pages/test-firestore.html` - Teste das regras do Firestore

### Como Testar

1. Acesse as páginas de teste
2. Verifique as funcionalidades
3. Teste autenticação e logout
4. Valide as regras do Firestore

## 🐛 Solução de Problemas

### Erro de Permissões

```
FirebaseError: Missing or insufficient permissions.
```

**Solução:** Configure as regras do Firestore conforme `docs/documentation/RESOLVER_PERMISSOES.md`

### Erro de Domínio OAuth

```
FirebaseError: Firebase: Error (auth/unauthorized-domain).
```

**Solução:**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá para **Authentication > Settings**
3. Na seção **Authorized domains**, adicione seu domínio:
   - Para produção: `historicoacademico.vercel.app`
   - Para desenvolvimento: `localhost` e `127.0.0.1`
4. Aguarde alguns minutos e teste novamente

**Arquivo de teste:** Use `test-oauth-domain.html` para verificar se o domínio está configurado corretamente.

### Logout Não Funciona

**Solução:** Verifique o console do navegador para logs detalhados

### Tema Não Persiste

**Solução:** Verifique se o localStorage está funcionando

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Luís Teixeira**

- GitHub: [@LuisT-ls](https://github.com/LuisT-ls)
- LinkedIn: [luis-tei](https://linkedin.com/in/luis-tei)

## 🙏 Agradecimentos

- Firebase pela infraestrutura
- Font Awesome pelos ícones
- Comunidade open source

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
