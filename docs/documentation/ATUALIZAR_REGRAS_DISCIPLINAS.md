# 🔧 Atualizar Regras do Firestore - Problema das Disciplinas

## ⚠️ Problema Atual
**Erro:** `Missing or insufficient permissions` ao adicionar disciplinas

O problema é que as regras do Firestore não incluem a coleção `disciplines` que é usada para salvar as disciplinas dos usuários.

## 🚀 Solução Rápida (3 minutos)

### 1. Acessar o Firebase Console
1. Vá para: https://console.firebase.google.com
2. Projeto: `historico-universitario-abc12`

### 2. Atualizar Regras do Firestore
1. Menu lateral → **Firestore Database**
2. Aba **Rules**
3. **SUBSTITUA** as regras atuais por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados aos seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir acesso para disciplinas do usuário
    match /disciplines/{documentId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Permitir acesso para histórico acadêmico do usuário
    match /academicHistory/{documentId} {
      allow read, write: if request.auth != null && 
        (documentId == request.auth.uid || 
         (resource != null && resource.data.userId == request.auth.uid));
    }
    
    // Permitir acesso para requisitos de formatura do usuário
    match /graduationRequirements/{documentId} {
      allow read, write: if request.auth != null && 
        (documentId == request.auth.uid || 
         (resource != null && resource.data.userId == request.auth.uid));
    }
    
    // Permitir acesso para resumos do usuário
    match /summaries/{documentId} {
      allow read, write: if request.auth != null && 
        (documentId == request.auth.uid || 
         (resource != null && resource.data.userId == request.auth.uid));
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

4. Clique em **Publish**

### 3. Testar
1. Aguarde 30 segundos
2. Tente adicionar uma disciplina novamente
3. Verifique se não há erros no console

## 📋 O que foi adicionado

### Novas Regras:
- ✅ **`disciplines`** - Para salvar disciplinas dos usuários
- ✅ **`academicHistory`** - Para histórico acadêmico
- ✅ **`graduationRequirements`** - Para requisitos de formatura
- ✅ **`summaries`** - Para resumos gerais

### Segurança:
- ✅ Apenas usuários autenticados podem acessar
- ✅ Usuários só podem acessar seus próprios dados
- ✅ Validação de `userId` em cada documento

## 🔍 Estrutura das Coleções

### `disciplines`:
```javascript
{
  userId: "user_id",
  codigo: "CTIA01",
  nome: "INTRODUÇÃO À COMPUTAÇÃO",
  natureza: "OB",
  // ... outros campos
}
```

### `academicHistory`:
```javascript
{
  userId: "user_id",
  // ... dados do histórico
}
```

### `graduationRequirements`:
```javascript
{
  userId: "user_id",
  // ... requisitos de formatura
}
```

### `summaries`:
```javascript
{
  userId: "user_id",
  // ... resumos gerais
}
```

## ✅ Checklist

- [ ] Regras atualizadas no Firebase Console
- [ ] Regras publicadas com sucesso
- [ ] Teste de adicionar disciplina realizado
- [ ] Sem erros no console
- [ ] Disciplina salva corretamente

## 🆘 Se Ainda Houver Problemas

### Verificações:
1. **Firebase Console:**
   - Verificar se as regras foram aplicadas
   - Verificar se há erros de sintaxe

2. **Console do Navegador:**
   - Verificar se há erros específicos
   - Verificar se o usuário está autenticado

3. **Dados:**
   - Verificar se o `userId` está sendo incluído
   - Verificar se a estrutura dos dados está correta

---

**⏰ Tempo estimado:** 3 minutos para resolver o problema das disciplinas. 