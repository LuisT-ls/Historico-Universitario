# Solução para Erro de Domínio OAuth no Firebase

## Problema Identificado
O erro `auth/unauthorized-domain` indica que o domínio `historicoacademico.vercel.app` não está autorizado no Firebase para operações OAuth (login com Google).

## Solução Passo a Passo

### 1. Acessar o Console do Firebase
1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**

### 2. Configurar Domínios Autorizados
1. Na página de Authentication, clique na aba **Settings** (Configurações)
2. Role até a seção **Authorized domains** (Domínios autorizados)
3. Clique em **Add domain** (Adicionar domínio)
4. Adicione: `historicoacademico.vercel.app`
5. Clique em **Add** (Adicionar)

### 3. Verificar Configurações do Google OAuth
1. Na mesma página de Settings, vá para a aba **Sign-in method**
2. Clique em **Google** na lista de provedores
3. Verifique se está **Enabled** (Habilitado)
4. Se necessário, configure o **Project support email**

### 4. Configurações Adicionais Recomendadas

#### Para Vercel (se aplicável):
1. No dashboard da Vercel, vá para as configurações do projeto
2. Em **Environment Variables**, verifique se as variáveis do Firebase estão configuradas:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - etc.

#### Para outros domínios (se necessário):
Adicione também:
- `localhost` (para desenvolvimento local)
- `127.0.0.1` (para desenvolvimento local)
- Qualquer outro domínio que você use

### 5. Teste Após Configuração
1. Aguarde alguns minutos para as mudanças propagarem
2. Teste o login com Google novamente
3. Verifique se o erro foi resolvido

## Estrutura de Domínios Autorizados
```
Domínios que devem estar na lista:
- historicoacademico.vercel.app (produção)
- localhost (desenvolvimento)
- 127.0.0.1 (desenvolvimento)
```

## Verificação Rápida
Para verificar se está funcionando:
1. Abra o console do navegador
2. Tente fazer login com Google
3. Não deve aparecer mais o erro `auth/unauthorized-domain`

## Troubleshooting

### Se o erro persistir:
1. **Limpe o cache do navegador**
2. **Aguarde 5-10 minutos** para propagação das mudanças
3. **Verifique se o domínio foi adicionado corretamente** (sem espaços extras)
4. **Teste em modo incógnito** para descartar problemas de cache

### Logs para Debug:
```javascript
// Adicione este código temporariamente para debug
firebase.auth().onAuthStateChanged((user) => {
  console.log('Estado da autenticação:', user);
});

// No login com Google
signInWithPopup(auth, provider)
  .then((result) => {
    console.log('Login bem-sucedido:', result);
  })
  .catch((error) => {
    console.error('Erro detalhado:', error);
  });
```

## Comandos Úteis para Verificação

### Verificar configuração atual:
```bash
# No console do Firebase, verifique:
# Authentication > Settings > Authorized domains
```

### Teste rápido no navegador:
```javascript
// No console do navegador, execute:
console.log('Domínio atual:', window.location.hostname);
```

## Próximos Passos
Após resolver o problema:
1. Teste todos os métodos de login
2. Verifique se o logout funciona corretamente
3. Teste a persistência dos dados
4. Documente as configurações para futuras referências

## Contato para Suporte
Se o problema persistir após seguir estes passos:
1. Verifique os logs do Firebase Console
2. Consulte a documentação oficial do Firebase
3. Entre em contato com o suporte do Firebase se necessário 