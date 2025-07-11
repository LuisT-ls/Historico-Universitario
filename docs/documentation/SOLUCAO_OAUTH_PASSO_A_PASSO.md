# 🔧 SOLUÇÃO DEFINITIVA - Erro de Domínio OAuth

## ❌ Problema Atual

```
FirebaseError: Firebase: Error (auth/unauthorized-domain).
The current domain is not authorized for OAuth operations.
```

## ✅ Solução Passo a Passo (COM IMAGENS)

### Passo 1: Acessar o Firebase Console

1. Abra: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Selecione o projeto `historico-academico`

### Passo 2: Navegar para Authentication

1. No menu lateral esquerdo, clique em **Authentication**
2. Você verá uma página com abas

### Passo 3: Acessar Settings

1. Clique na aba **Settings** (Configurações)
2. Role para baixo até encontrar **Authorized domains**

### Passo 4: Adicionar o Domínio

1. Na seção **Authorized domains**, clique em **Add domain**
2. Digite exatamente: `historicoacademico.vercel.app`
3. Clique em **Add**

### Passo 5: Verificar Configuração

1. O domínio deve aparecer na lista
2. Verifique se não há espaços extras
3. Aguarde 2-3 minutos

## 🔍 Verificação Rápida

### Teste no Console do Navegador

Execute este código no console do seu site:

```javascript
// Verificar domínio atual
console.log('Domínio atual:', window.location.hostname)

// Verificar se é o correto
if (window.location.hostname === 'historicoacademico.vercel.app') {
  console.log('✅ Domínio correto')
} else {
  console.log('❌ Domínio incorreto:', window.location.hostname)
}
```

### Teste de Login

1. Abra o site em modo incógnito
2. Tente fazer login com Google
3. Se ainda der erro, aguarde mais 5 minutos

## 🚨 Troubleshooting

### Se ainda não funcionar:

#### 1. Verificar se o domínio foi adicionado corretamente

- Vá para Firebase Console > Authentication > Settings
- Verifique se `historicoacademico.vercel.app` está na lista
- Certifique-se de que não há espaços extras

#### 2. Verificar se Google OAuth está habilitado

- No Firebase Console, vá para Authentication > Sign-in method
- Clique em **Google**
- Verifique se está **Enabled**
- Configure o **Project support email** se necessário

#### 3. Limpar cache e testar

```javascript
// No console do navegador
localStorage.clear()
sessionStorage.clear()
location.reload()
```

#### 4. Verificar variáveis de ambiente no Vercel

- Acesse o dashboard da Vercel
- Vá para Settings > Environment Variables
- Verifique se as variáveis do Firebase estão configuradas

## 📋 Checklist Completo

- [ ] Domínio adicionado no Firebase Console
- [ ] Aguardou 2-3 minutos
- [ ] Testou em modo incógnito
- [ ] Google OAuth está habilitado
- [ ] Variáveis de ambiente configuradas
- [ ] Cache do navegador limpo

## 🆘 Se NADA funcionar

### Opção 1: Contatar Suporte Firebase

1. Acesse: https://firebase.google.com/support
2. Crie um ticket de suporte
3. Inclua os logs de erro

### Opção 2: Verificar Configuração Manual

```javascript
// Execute no console para debug completo
console.log('=== DEBUG OAUTH ===')
console.log('Hostname:', window.location.hostname)
console.log('Protocol:', window.location.protocol)
console.log('User Agent:', navigator.userAgent)
console.log('Firebase Config:', firebase.app().options)
```

### Opção 3: Teste Alternativo

1. Temporariamente, teste com `localhost`
2. Se funcionar localmente, o problema é específico do domínio
3. Verifique se há algum proxy ou CDN interferindo

## 📞 Contatos Úteis

- **Firebase Support:** https://firebase.google.com/support
- **Vercel Support:** https://vercel.com/support
- **Documentação Firebase:** https://firebase.google.com/docs/auth

## ⏱️ Tempo Estimado

- **Configuração:** 5 minutos
- **Propagação:** 2-5 minutos
- **Teste:** 2 minutos
- **Total:** 10-15 minutos

---

**💡 Dica:** Se você seguir exatamente estes passos, o problema será resolvido em 10-15 minutos.
