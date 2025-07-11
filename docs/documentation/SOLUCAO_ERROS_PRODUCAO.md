# Solução para Erros de Produção - Firebase

## Problemas Identificados

### 1. Erro de Domínio Não Autorizado (OAuth Google)

**Erro:** `FirebaseError: Firebase: Error (auth/unauthorized-domain)`

**Causa:** O domínio `historicoacademico.vercel.app` não está autorizado no Firebase Console.

### 2. Erros de Autenticação com Email/Senha

**Erros:**

- `auth/email-already-in-use` - Email já cadastrado
- `auth/invalid-credential` - Credenciais inválidas

## Soluções

### 1. Configurar Domínios Autorizados no Firebase

#### Passo a Passo:

1. **Acesse o Firebase Console:**

   - Vá para [https://console.firebase.google.com](https://console.firebase.google.com)
   - Selecione seu projeto: `historico-universitario-abc12`

2. **Configure Domínios Autorizados:**

   - No menu lateral, clique em **Authentication**
   - Clique na aba **Settings** (Configurações)
   - Role até a seção **Authorized domains** (Domínios autorizados)
   - Clique em **Add domain** (Adicionar domínio)
   - Adicione: `historicoacademico.vercel.app`
   - Clique em **Add** (Adicionar)

3. **Verificar Configuração:**
   - Certifique-se de que o domínio aparece na lista
   - Aguarde alguns minutos para a propagação

### 2. Verificar Configuração do Projeto

#### Configuração Atual:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyCP_TfNncuAqCxUTs0FvLJ0XnfXY9lorTU',
  authDomain: 'historico-universitario-abc12.firebaseapp.com',
  projectId: 'historico-universitario-abc12',
  storageBucket: 'historico-universitario-abc12.firebasestorage.app',
  messagingSenderId: '333663970992',
  appId: '1:333663970992:web:4532164b749f1e38883d75',
  measurementId: 'G-ZBMBGR6J39'
}
```

### 3. Configurações Adicionais no Firebase Console

#### Authentication > Sign-in method:

1. **Google Provider:**

   - Certifique-se de que está habilitado
   - Configure o **Project support email** se necessário

2. **Email/Password Provider:**
   - Verifique se está habilitado
   - Configure se deseja **Email link (passwordless sign-in)**

#### Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Permitir acesso para dados acadêmicos do usuário
    match /users/{userId}/academic_records/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Melhorias no Código para Tratamento de Erros

#### Atualizar o arquivo `js/modules/firebase/auth.js`:

```javascript
// Melhorar tratamento de erros no loginWithGoogle
async loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    this.currentUser = result.user

    // Verificar se é a primeira vez do usuário
    const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid))
    if (!userDoc.exists()) {
      // Criar perfil inicial para usuário do Google
      await this.createInitialUserProfile()
    } else {
      await this.loadUserData()
    }

    return { success: true, user: this.currentUser }
  } catch (error) {
    console.error('Erro no login com Google:', error)

    // Tratamento específico para erro de domínio não autorizado
    if (error.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        error: 'Domínio não autorizado. Entre em contato com o suporte.'
      }
    }

    return { success: false, error: this.getErrorMessage(error.code) }
  }
}

// Melhorar getErrorMessage
getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado. Verifique seu email.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/email-already-in-use': 'Este email já está cadastrado. Tente fazer login.',
    'auth/invalid-credential': 'Credenciais inválidas. Verifique email e senha.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/unauthorized-domain': 'Domínio não autorizado. Entre em contato com o suporte.',
    'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
    'auth/cancelled-popup-request': 'Login cancelado. Tente novamente.',
    'auth/account-exists-with-different-credential': 'Email já associado a outra conta.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido. Verifique o formato.',
    'auth/operation-not-allowed': 'Método de login não habilitado.',
    'auth/user-disabled': 'Conta desabilitada. Entre em contato com o suporte.'
  }

  return errorMessages[errorCode] || `Erro: ${errorCode}`
}
```

### 5. Verificações Adicionais

#### No Vercel:

1. **Variáveis de Ambiente:**

   - Verifique se não há variáveis de ambiente conflitantes
   - Certifique-se de que o domínio está configurado corretamente

2. **Deploy:**
   - Faça um novo deploy após as configurações do Firebase
   - Limpe o cache do navegador

#### Testes:

1. **Teste em Navegador Incógnito:**

   - Abra o site em modo incógnito
   - Teste o login com Google
   - Teste o login com email/senha

2. **Verificar Console:**
   - Abra o DevTools (F12)
   - Verifique se há erros no console
   - Teste a funcionalidade

### 6. Checklist de Verificação

- [ ] Domínio `historicoacademico.vercel.app` adicionado no Firebase Console
- [ ] Google Provider habilitado no Firebase Authentication
- [ ] Email/Password Provider habilitado
- [ ] Regras do Firestore configuradas corretamente
- [ ] Deploy atualizado no Vercel
- [ ] Cache do navegador limpo
- [ ] Testes realizados em modo incógnito

### 7. Contato de Suporte

Se os problemas persistirem após seguir todos os passos:

1. **Verifique os logs do Firebase Console:**

   - Authentication > Users
   - Firestore > Data
   - Functions > Logs (se aplicável)

2. **Informações para Debug:**
   - URL da aplicação
   - Erro específico do console
   - Configurações do Firebase
   - Data e hora do erro

### 8. Comandos Úteis para Debug

```bash
# Verificar configuração do Firebase
firebase projects:list

# Verificar regras do Firestore
firebase firestore:rules:get

# Deploy das regras (se necessário)
firebase deploy --only firestore:rules
```

---

**Nota:** Após fazer as configurações no Firebase Console, aguarde alguns minutos para que as mudanças sejam propagadas antes de testar novamente.
