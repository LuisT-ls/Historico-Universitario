# 🔧 Resolver Erro de Permissões do Firestore

## ⚠️ Problema Atual

```
FirebaseError: Missing or insufficient permissions.
```

## 🚀 Solução Imediata

### Passo 1: Acessar Firebase Console

1. Vá para: https://console.firebase.google.com
2. Selecione o projeto: `historico-universitario-abc12`

### Passo 2: Configurar Regras do Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Regras**
3. **Substitua** todo o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /disciplines/{disciplineId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /summaries/{summaryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /backups/{backupId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Passo 3: Publicar Regras

1. Clique em **Publicar**
2. Aguarde 30-60 segundos

### Passo 4: Testar

1. Faça logout da aplicação
2. Faça login novamente
3. Teste salvar informações pessoais

## 🧪 Teste Rápido

Acesse `test-firestore.html` para verificar se as regras estão funcionando.

## 🚨 Solução Temporária (Desenvolvimento)

Se ainda houver problemas, use estas regras temporárias:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## ✅ Melhorias Implementadas

### 1. **Dados Salvos nos Inputs**

- ✅ Após salvar, os dados ficam visíveis nos campos
- ✅ Notificação de confirmação com ícone ✅

### 2. **Tema Global**

- ✅ Tema escuro/claro aplicado em todas as páginas
- ✅ Persistência no localStorage
- ✅ Aplicação automática ao carregar a página

### 3. **Header Equilibrado**

- ✅ Logo à esquerda
- ✅ Navegação centralizada
- ✅ Menu do usuário à direita
- ✅ Layout responsivo

### 4. **Notificações Melhoradas**

- ✅ Ícones nas notificações
- ✅ Mensagens mais claras
- ✅ Confirmação de sucesso

## 📱 Responsividade

- **Desktop:** Layout completo
- **Tablet:** Navegação compacta
- **Mobile:** Header otimizado

---

**Tempo estimado para resolver:** 2-3 minutos
