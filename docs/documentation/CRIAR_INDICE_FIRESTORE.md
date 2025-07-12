# Criar Índices no Firestore

## Problema

O Firestore está retornando erro de índice composto necessário para as consultas que filtram por `userId` e ordenam por `createdAt`.

## Solução

### 1. Acessar o Firebase Console

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `historico-universitario-abc12`
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Índices**

### 2. Criar Índices Necessários

#### Índice 1: Para consulta geral de disciplinas

- **Coleção**: `disciplines`
- **Campos**:
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Tipo**: Composto

#### Índice 2: Para consulta por curso

- **Coleção**: `disciplines`
- **Campos**:
  - `userId` (Ascending)
  - `curso` (Ascending)
  - `createdAt` (Descending)
- **Tipo**: Composto

### 3. Criar Índices via Console

#### Opção 1: Usar o link direto do erro

O erro fornece um link direto para criar o índice:

```
https://console.firebase.google.com/v1/r/project/historico-universitario-abc12/firestore/indexes?create_composite=CmFwcm9qZWN0cy9oaXN0b3JpY28tdW5pdmVyc2l0YXJpby1hYmMxMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGlzY2lwbGluZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

#### Opção 2: Criar manualmente

1. Clique em **Criar índice**
2. Selecione a coleção `disciplines`
3. Adicione os campos:
   - `userId` (Ascending)
   - `createdAt` (Descending)
4. Clique em **Criar**

### 4. Aguardar a Criação

- Os índices podem levar alguns minutos para serem criados
- O status aparecerá como "Criando" e depois "Habilitado"
- Enquanto isso, o aplicativo continuará funcionando com localStorage

### 5. Verificar se Funcionou

Após a criação dos índices:

1. Recarregue a página do aplicativo
2. Verifique o console do navegador
3. Não deve mais aparecer o erro de índice

## Consultas que Requerem Índices

### Consulta 1: Todas as disciplinas do usuário

```javascript
const q = query(
  collection(db, 'disciplines'),
  where('userId', '==', this.currentUser.uid),
  orderBy('createdAt', 'desc')
)
```

### Consulta 2: Disciplinas por curso

```javascript
const q = query(
  collection(db, 'disciplines'),
  where('userId', '==', this.currentUser.uid),
  where('curso', '==', curso),
  orderBy('createdAt', 'desc')
)
```

## Notas Importantes

- Os índices são necessários quando combinamos `where` com `orderBy`
- O Firestore cria automaticamente índices simples, mas não compostos
- Após criar os índices, as consultas funcionarão normalmente
- O sistema continuará funcionando com localStorage enquanto os índices são criados
