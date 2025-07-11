# 🔧 Configuração das Regras do Firestore

## ⚠️ Problema de Permissões

O erro "Missing or insufficient permissions" indica que as regras de segurança do Firestore não estão configuradas corretamente.

## 📋 Passos para Configurar

### 1. Acessar o Console do Firebase

1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto `historico-universitario-abc12`
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras**

### 2. Substituir as Regras

Substitua o conteúdo atual pelas seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção 'users'
    match /users/{userId} {
      // Permitir leitura e escrita apenas se o usuário estiver autenticado e for o proprietário dos dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para a coleção 'disciplines' (disciplinas do usuário)
    match /disciplines/{disciplineId} {
      // Permitir leitura e escrita apenas se o usuário estiver autenticado e for o proprietário dos dados
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Regras para a coleção 'summaries' (resumos do usuário)
    match /summaries/{summaryId} {
      // Permitir leitura e escrita apenas se o usuário estiver autenticado e for o proprietário dos dados
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Regras para a coleção 'backups' (backups do usuário)
    match /backups/{backupId} {
      // Permitir leitura e escrita apenas se o usuário estiver autenticado e for o proprietário dos dados
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Negar acesso a todas as outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publicar as Regras

1. Clique em **Publicar** para salvar as novas regras
2. Aguarde alguns segundos para que as regras sejam aplicadas

## 🔍 Explicação das Regras

### Coleção `users`

- **Permissão:** Usuários autenticados podem ler e escrever apenas seus próprios dados
- **Segurança:** Cada usuário só acessa seu próprio documento

### Coleção `disciplines`

- **Permissão:** Usuários podem criar, ler e escrever disciplinas que pertencem a eles
- **Segurança:** Campo `userId` deve corresponder ao ID do usuário autenticado

### Coleção `summaries`

- **Permissão:** Usuários podem gerenciar seus próprios resumos acadêmicos
- **Segurança:** Acesso restrito ao proprietário dos dados

### Coleção `backups`

- **Permissão:** Usuários podem criar e gerenciar seus próprios backups
- **Segurança:** Dados de backup protegidos por usuário

## 🧪 Testando as Regras

Após configurar as regras:

1. **Faça logout** da aplicação
2. **Faça login** novamente
3. **Teste** salvar as informações pessoais
4. **Verifique** se não há mais erros de permissão

## 🚨 Regras Temporárias (Apenas para Desenvolvimento)

Se você quiser permitir acesso total durante o desenvolvimento (⚠️ **NÃO USE EM PRODUÇÃO**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📞 Suporte

Se ainda houver problemas após configurar as regras:

1. Verifique se o usuário está autenticado
2. Confirme se o ID do usuário está correto
3. Verifique os logs do console para mais detalhes
4. Teste com as regras temporárias para isolar o problema

---

**Nota:** As regras de segurança são essenciais para proteger os dados dos usuários. Sempre teste em um ambiente seguro antes de aplicar em produção.
