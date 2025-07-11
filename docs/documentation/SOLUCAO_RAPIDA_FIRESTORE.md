# ⚡ SOLUÇÃO RÁPIDA - Erro de Permissões do Firestore

## 🚨 PROBLEMA

**Erro:** `Missing or insufficient permissions`

## 🔧 SOLUÇÃO EM 3 MINUTOS

### 1. Acesse o Firebase Console

- URL: https://console.firebase.google.com
- Projeto: `historico-universitario-abc12`

### 2. Configure as Regras

1. Menu lateral → **Firestore Database**
2. Aba **Rules**
3. **SUBSTITUA** as regras atuais por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Clique em **Publish**

### 3. Teste

- Aguarde 30 segundos
- Teste o login novamente

## ✅ PRONTO!

Se ainda der erro, use estas regras temporárias (menos seguras, mas funcionam):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE:** Volte para as regras seguras depois do teste!

---

**Tempo:** 3 minutos
**Dificuldade:** Fácil
