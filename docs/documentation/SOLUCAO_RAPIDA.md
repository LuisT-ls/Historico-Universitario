# 🚀 Solução Rápida - Erro de Permissões

## ⚠️ Problema

```
FirebaseError: Missing or insufficient permissions.
```

## 🔧 Solução Imediata

### 1. Acesse o Console do Firebase

- Vá para: https://console.firebase.google.com
- Selecione seu projeto: `historico-universitario-abc12`

### 2. Configure as Regras do Firestore

- No menu lateral, clique em **Firestore Database**
- Clique na aba **Regras**
- **Substitua** todo o conteúdo por:

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

### 3. Publique as Regras

- Clique em **Publicar**
- Aguarde 30 segundos

### 4. Teste a Aplicação

- Faça logout
- Faça login novamente
- Teste salvar as informações pessoais

## 🧪 Teste Rápido

Acesse `test-firestore.html` para verificar se as regras estão funcionando.

## 🚨 Solução Temporária (Desenvolvimento)

Se ainda houver problemas, use estas regras temporárias (⚠️ **NÃO USE EM PRODUÇÃO**):

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

## ✅ Verificação

Após configurar as regras, você deve conseguir:

- ✅ Salvar informações pessoais
- ✅ Alterar tema
- ✅ Ativar/desativar notificações
- ✅ Ver estatísticas do perfil

---

**Tempo estimado:** 2-3 minutos
