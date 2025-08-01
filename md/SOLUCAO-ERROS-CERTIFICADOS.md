# Solução para Erros dos Certificados

## Problemas Identificados

### 1. Erro de Índice do Firestore

```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=...
```

### 2. Erro de CORS no Firebase Storage

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/historico-universitario-abc12.firebasestorage.app/o?name=certificados%2F...' from origin 'https://historicoacademico.vercel.app' has been blocked by CORS policy
```

## Soluções

### Solução 1: Criar Índice do Firestore

1. **Acesse o link fornecido no erro:**

   ```
   https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=CmJwcm9qZWN0cy9oaXN0b3JpY28tdW5pdmVyc2l0YXJpby1hYmMxMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY2VydGlmaWNhZG9zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
   ```

2. **Clique em "Criar Índice"**

3. **Aguarde alguns minutos** para o índice ser criado (pode levar até 5 minutos)

### Solução 2: Configurar CORS no Firebase Storage

#### Opção A: Usando Firebase CLI (Recomendado)

1. **Instale o Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase:**

   ```bash
   firebase login
   ```

3. **Aplique a configuração CORS:**

   ```bash
   gsutil cors set firebase-storage-cors.json gs://historico-universitario-abc12.firebasestorage.app
   ```

4. **Verifique se foi aplicado:**
   ```bash
   gsutil cors get gs://historico-universitario-abc12.firebasestorage.app
   ```

#### Opção B: Manualmente no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto `historico-universitario-abc12`
3. Vá para **Cloud Storage** > **Buckets**
4. Clique no bucket `historico-universitario-abc12.firebasestorage.app`
5. Vá para a aba **CORS**
6. Clique em **Editar**
7. Adicione a seguinte configuração:
   ```json
   [
     {
       "origin": [
         "https://historicoacademico.vercel.app",
         "http://localhost:3000",
         "http://localhost:5000"
       ],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": [
         "Content-Type",
         "Authorization",
         "Content-Length",
         "User-Agent",
         "x-goog-*"
       ]
     }
   ]
   ```
8. Clique em **Salvar**

## Verificação

Após aplicar as soluções:

1. **Teste o upload de certificados** na aplicação
2. **Verifique o console do navegador** para confirmar que não há mais erros
3. **Teste o carregamento de certificados** existentes

## Arquivos Criados

- `firebase-storage-cors.json` - Configuração CORS para o Firebase Storage
- `setup-firebase-storage-cors.js` - Script para automatizar a configuração
- `SOLUCAO-ERROS-CERTIFICADOS.md` - Esta documentação

## Notas Importantes

- O índice do Firestore pode levar alguns minutos para ser criado
- A configuração CORS pode levar alguns minutos para ser aplicada
- Se ainda houver problemas, verifique se o domínio está correto na configuração CORS
- Para desenvolvimento local, adicione `http://localhost:3000` e `http://localhost:5000` às origens permitidas
