# 🔧 Criar Índice no Firestore - Solução para Erro de Query

## ⚠️ Problema Identificado

**Erro:** `The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=...`

**Causa:** O Firestore precisa de um índice composto para consultas que usam múltiplos campos (`userId` + `curso` + `createdAt`).

## 🚀 Solução Rápida (2 minutos)

### 1. Acessar o Firebase Console

1. Vá para: https://console.firebase.google.com
2. Projeto: `historico-universitario-abc12`

### 2. Criar o Índice

1. Menu lateral → **Firestore Database**
2. Aba **Indexes**
3. Clique em **Create Index**
4. Configure o índice:

#### **Collection ID:** `disciplines`

#### **Fields:**

- `userId` (Ascending)
- `curso` (Ascending)
- `createdAt` (Descending)

### 3. Ou Usar o Link Direto

Clique no link fornecido no erro:

```
https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=CmFwcm9qZWN0cy9oaXN0b3JpY28tdW5pdmVyc2l0YXJpby1hYmMxMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGlzY2lwbGluZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

### 4. Aguardar Criação

1. Clique em **Create**
2. Aguarde alguns minutos para o índice ser criado
3. Status deve mudar para "Enabled"

## 📋 Configuração do Índice

### **Índice Necessário:**

```
Collection: disciplines
Fields:
├── userId (Ascending)
├── curso (Ascending)
└── createdAt (Descending)
```

### **Por que é necessário:**

- Consultas que filtram por `userId` E `curso` E ordenam por `createdAt`
- Firestore precisa de índice composto para otimizar essas consultas
- Sem o índice, as consultas falham

## ✅ Verificação

### **1. Verificar Status do Índice:**

1. Firebase Console → Firestore Database → Indexes
2. Verificar se o índice está "Enabled"
3. Aguardar se estiver "Building"

### **2. Testar Consulta:**

1. Acesse a aplicação
2. Faça login
3. Verifique se as disciplinas carregam sem erro
4. Verifique se não há erros no console

## 🔍 Logs Esperados

### **Após criar o índice:**

```
Iniciando carregamento de dados do Firestore...
Dados do Firestore carregados para localStorage com sucesso
Carregamento concluído com sucesso
```

### **Se ainda houver erro:**

```
Erro ao buscar disciplinas: FirebaseError: The query requires an index...
```

## 🆘 Se Ainda Houver Problemas

### **Verificações:**

1. **Status do Índice:**

   - Verificar se está "Enabled"
   - Aguardar se estiver "Building"

2. **Configuração:**

   - Verificar se os campos estão corretos
   - Verificar se a ordem está correta

3. **Cache:**
   - Limpar cache do navegador
   - Testar em modo incógnito

### **Índices Adicionais (se necessário):**

```
Collection: disciplines
Fields:
├── userId (Ascending)
└── createdAt (Descending)
```

---

**⏰ Tempo estimado:** 2-5 minutos para criar o índice.

**🎯 Resultado:** Consultas funcionando sem erro!
