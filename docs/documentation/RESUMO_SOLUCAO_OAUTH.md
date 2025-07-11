# 🚨 SOLUÇÃO RÁPIDA - Erro de Domínio OAuth

## ❌ Problema

```
FirebaseError: Firebase: Error (auth/unauthorized-domain).
The current domain is not authorized for OAuth operations.
```

## ✅ Solução (5 minutos)

### 1. Acesse o Firebase Console

- Vá para: https://console.firebase.google.com/
- Selecione seu projeto

### 2. Configure o Domínio

- Clique em **Authentication** no menu lateral
- Vá para a aba **Settings**
- Role até **Authorized domains**
- Clique em **Add domain**
- Adicione: `historicoacademico.vercel.app`
- Clique em **Add**

### 3. Teste

- Aguarde 2-3 minutos
- Tente fazer login com Google novamente

## 🔧 Ferramentas de Teste

### Script Rápido

Execute no console do navegador:

```javascript
// Copie e cole o conteúdo de verificar-dominio.js
```

### Página de Teste

Acesse: `test-oauth-domain.html`

## 📋 Checklist

- [ ] Domínio adicionado no Firebase Console
- [ ] Aguardou 2-3 minutos
- [ ] Testou em modo incógnito
- [ ] Verificou se Google OAuth está habilitado

## 🆘 Se ainda não funcionar

1. **Limpe o cache do navegador**
2. **Teste em modo incógnito**
3. **Verifique se não há espaços extras no domínio**
4. **Aguarde mais 5 minutos**

## 📞 Suporte

Se o problema persistir:

- Verifique os logs do Firebase Console
- Consulte a documentação oficial do Firebase
- Entre em contato com o suporte do Firebase

---

**⏱️ Tempo estimado para resolver: 5-10 minutos**
