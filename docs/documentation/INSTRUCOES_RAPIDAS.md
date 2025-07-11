# 🚀 Instruções Rápidas - Resolver Erros de Produção

## ⚠️ Problema Principal: Domínio Não Autorizado

O erro `auth/unauthorized-domain` indica que o domínio `historicoacademico.vercel.app` não está autorizado no Firebase.

## 🔧 Solução Imediata (5 minutos)

### 1. Acesse o Firebase Console

- Vá para: https://console.firebase.google.com
- Selecione o projeto: `historico-universitario-abc12`

### 2. Configure o Domínio Autorizado

- No menu lateral, clique em **Authentication**
- Clique na aba **Settings** (Configurações)
- Role até **Authorized domains**
- Clique em **Add domain**
- Digite: `historicoacademico.vercel.app`
- Clique em **Add**

### 3. Verifique os Providers

- Na mesma página, vá para **Sign-in method**
- Certifique-se de que **Google** está habilitado
- Certifique-se de que **Email/Password** está habilitado

### 4. Aguarde e Teste

- Aguarde 2-3 minutos para propagação
- Teste o login em modo incógnito

## 📋 Checklist Completo

- [ ] Domínio adicionado no Firebase Console
- [ ] Google Provider habilitado
- [ ] Email/Password Provider habilitado
- [ ] Teste realizado em modo incógnito
- [ ] Cache do navegador limpo

## 🔍 Se o Problema Persistir

### Verifique as Regras do Firestore:

1. No Firebase Console, vá para **Firestore Database**
2. Clique em **Rules**
3. Certifique-se de que as regras estão assim:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Teste de Debug:

1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Tente fazer login
4. Verifique se há erros específicos

## 📞 Suporte

Se ainda houver problemas após seguir estes passos:

1. **Informações necessárias:**

   - Screenshot do erro no console
   - URL da aplicação
   - Data e hora do erro

2. **Verificações adicionais:**
   - Configuração do Vercel
   - Variáveis de ambiente
   - Logs do Firebase Console

---

**⏰ Tempo estimado:** 5-10 minutos para resolver o problema principal.
