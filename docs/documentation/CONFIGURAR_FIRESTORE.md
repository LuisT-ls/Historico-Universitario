# 🔧 Configurar Regras do Firestore - Solução Completa

## ⚠️ Problema Atual

**Erro:** `Missing or insufficient permissions`

O Firestore está bloqueando o acesso porque as regras de segurança não estão configuradas corretamente.

## 🚀 Solução Passo a Passo

### 1. Acessar o Firebase Console

1. Vá para: https://console.firebase.google.com
2. Selecione seu projeto: `historico-universitario-abc12`

### 2. Configurar Regras do Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Rules**
3. Substitua as regras atuais pelas seguintes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados aos seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Permitir acesso para dados acadêmicos do usuário
    match /users/{userId}/academic_records/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Permitir acesso para configurações do usuário
    match /users/{userId}/settings/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Permitir acesso para histórico do usuário
    match /users/{userId}/history/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Negar acesso a todos os outros documentos
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Clique em **Publish** para salvar as regras

### 3. Verificar Configuração

1. Aguarde alguns segundos para as regras serem aplicadas
2. Teste o login novamente

## 🔍 Regras Temporárias (Para Teste)

Se você quiser testar rapidamente, pode usar regras mais permissivas temporariamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMISSIVO - APENAS PARA TESTE
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE:** Use as regras permissivas apenas para teste e volte para as regras seguras depois.

## 📋 Checklist de Verificação

### Firebase Console:

- [ ] Acessou o projeto correto
- [ ] Navegou para Firestore Database > Rules
- [ ] Substituiu as regras existentes
- [ ] Clicou em Publish
- [ ] Aguardou a aplicação das regras

### Teste:

- [ ] Limpou cache do navegador
- [ ] Testou login em modo incógnito
- [ ] Verificou se não há erros no console

## 🛠️ Solução Alternativa via Firebase CLI

Se preferir usar o Firebase CLI:

1. **Instalar Firebase CLI:**

```bash
npm install -g firebase-tools
```

2. **Fazer login:**

```bash
firebase login
```

3. **Inicializar projeto:**

```bash
firebase init firestore
```

4. **Criar arquivo `firestore.rules`:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/academic_records/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/settings/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/history/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. **Deploy das regras:**

```bash
firebase deploy --only firestore:rules
```

## 🔧 Debug Avançado

### Verificar Regras Atuais:

1. No Firebase Console, vá para **Firestore Database > Rules**
2. Verifique se as regras estão aplicadas corretamente

### Testar Regras:

1. No Firebase Console, vá para **Firestore Database > Rules**
2. Clique em **Rules Playground**
3. Teste com diferentes cenários

### Logs de Erro:

1. No Firebase Console, vá para **Functions > Logs**
2. Verifique se há erros relacionados ao Firestore

## 📞 Se o Problema Persistir

### Informações para Debug:

1. **Regras atuais do Firestore** (screenshot)
2. **Erro completo do console** (screenshot)
3. **Data e hora do erro**
4. **URL da aplicação**

### Verificações Adicionais:

1. **Firebase Project Settings:**

   - Verificar se o projeto está ativo
   - Verificar se há cobrança pendente

2. **Authentication:**

   - Verificar se os providers estão habilitados
   - Verificar se há usuários criados

3. **Firestore Database:**
   - Verificar se o banco está criado
   - Verificar se há dados existentes

---

**⏰ Tempo estimado:** 10-15 minutos para configurar as regras corretamente.
