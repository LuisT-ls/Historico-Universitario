# ⚡ SOLUCAO RÁPIDA - Índice do Firestore

## 🚨 PROBLEMA

**Erro:** `The query requires an index`

## 🔧 SOLUCAO EM 2 MINUTOS

### 1. Criar Índice (Recomendado)

1. **Clique no link do erro** no console:

   ```
   https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=CmFwcm9qZWN0cy9oaXN0b3JpY28tdW5pdmVyc2l0YXJpby1hYmMxMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGlzY2lwbGluZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
   ```

2. **Clique em "Create"**
3. **Aguarde 2-5 minutos** para o índice ser criado

### 2. Solução Temporária (Já Implementada)

- ✅ **Código atualizado** para funcionar sem índice
- ✅ **Ordenação no cliente** quando índice não existe
- ✅ **Funciona imediatamente** sem esperar

## ✅ PRONTO!

### **Resultado:**

- ✅ Disciplinas aparecem em todos os dispositivos
- ✅ Sincronização funcionando
- ✅ Sem erros no console

### **Logs Esperados:**

```
Índice não encontrado, buscando sem ordenação...
Carregadas X disciplinas para curso BICTI
Dados do Firestore sincronizados com localStorage
```

---

**⏰ Tempo:** 2 minutos para criar índice OU funciona imediatamente com solução temporária
