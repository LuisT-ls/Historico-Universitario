# Configuração do Firebase - Histórico Universitário

Este guia explica como configurar o Firebase para o sistema de Histórico Universitário.

## 1. Configuração do Projeto Firebase

### 1.1 Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome: `historico-universitario-abc12`
4. Siga os passos para criar o projeto

### 1.2 Configurar Autenticação

1. No Firebase Console, vá para **Authentication** > **Sign-in method**
2. Habilite os seguintes provedores:
   - **Email/Password**
   - **Google**

#### Configuração do Google Sign-in:

1. Clique em **Google** na lista de provedores
2. Habilite o provedor
3. Adicione o domínio do seu site (ex: `localhost` para desenvolvimento)
4. Salve as configurações

### 1.3 Configurar Firestore Database

1. Vá para **Firestore Database** no console
2. Clique em **Criar banco de dados**
3. Escolha **Modo de teste** (para desenvolvimento)
4. Selecione a localização mais próxima (ex: `us-central1`)

### 1.4 Configurar Regras do Firestore

No Firestore Database, vá para **Regras** e configure as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para disciplinas
    match /disciplines/{disciplineId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Regras para histórico acadêmico
    match /academicHistory/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para requisitos de formatura
    match /graduationRequirements/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para resumos
    match /summaries/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para backups
    match /backups/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 1.5 Configurar Aplicação Web

1. No Firebase Console, vá para **Project Settings** (ícone de engrenagem)
2. Na seção **Your apps**, clique em **Add app** > **Web**
3. Digite o nome da aplicação: `Historico Universitario Web`
4. Copie a configuração fornecida

A configuração já está implementada no arquivo `js/modules/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyCP_TfNncuAqCxUTs0FvLJ0XnfXY9lorTU',
  authDomain: 'historico-universitario-abc12.firebaseapp.com',
  projectId: 'historico-universitario-abc12',
  storageBucket: 'historico-universitario-abc12.firebasestorage.app',
  messagingSenderId: '333663970992',
  appId: '1:333663970992:web:4532164b749f1e38883d75',
  measurementId: 'G-ZBMBGR6J39'
}
```

## 2. Estrutura do Banco de Dados

### 2.1 Coleções do Firestore

#### `users`

Documentos com ID do usuário (UID do Firebase Auth)

```javascript
{
  uid: "string",
  email: "string",
  name: "string",
  createdAt: "timestamp",
  lastLogin: "timestamp",
  profile: {
    course: "string",
    institution: "string",
    enrollment: "string",
    startYear: "number",
    totalCredits: "number",
    totalHours: "number"
  },
  settings: {
    theme: "string", // "light", "dark", "auto"
    notifications: "boolean",
    privacy: "string" // "private", "public"
  }
}
```

#### `disciplines`

Documentos com ID automático

```javascript
{
  userId: "string", // UID do usuário
  periodo: "string", // ex: "2025.1"
  codigo: "string", // ex: "CTIA01"
  nome: "string", // ex: "Introdução a Computação"
  natureza: "string", // "AC", "LV", "OB", "OG"
  creditos: "number",
  horas: "number",
  nota: "number",
  status: "string", // "completed", "in_progress", "pending"
  curso: "string", // curso selecionado
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `academicHistory`

Documentos com ID do usuário

```javascript
{
  userId: "string",
  totalDisciplines: "number",
  completedDisciplines: "number",
  totalCredits: "number",
  totalHours: "number",
  averageGrade: "number",
  updatedAt: "timestamp"
}
```

#### `graduationRequirements`

Documentos com ID do usuário

```javascript
{
  userId: "string",
  course: "string",
  requirements: {
    AC: { required: "number", completed: "number" },
    LV: { required: "number", completed: "number" },
    OB: { required: "number", completed: "number" },
    OG: { required: "number", completed: "number" }
  },
  updatedAt: "timestamp"
}
```

#### `summaries`

Documentos com ID do usuário

```javascript
{
  userId: "string",
  totalDisciplines: "number",
  completedDisciplines: "number",
  inProgressDisciplines: "number",
  pendingDisciplines: "number",
  totalCredits: "number",
  totalHours: "number",
  averageGrade: "number",
  progressPercentage: "number",
  lastUpdated: "timestamp"
}
```

#### `backups`

Documentos com ID do usuário

```javascript
{
  userId: "string",
  timestamp: "timestamp",
  disciplines: "array",
  academicHistory: "object",
  graduationRequirements: "object",
  summary: "object"
}
```

## 3. Funcionalidades Implementadas

### 3.1 Autenticação

- ✅ Login com email/senha
- ✅ Login com Google
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Logout
- ✅ Verificação de estado de autenticação

### 3.2 Gerenciamento de Dados

- ✅ Adicionar disciplinas
- ✅ Atualizar disciplinas
- ✅ Excluir disciplinas
- ✅ Carregar disciplinas do usuário
- ✅ Salvar histórico acadêmico
- ✅ Carregar histórico acadêmico
- ✅ Salvar requisitos de formatura
- ✅ Carregar requisitos de formatura
- ✅ Calcular e salvar resumo geral
- ✅ Backup e restauração de dados

### 3.3 Perfil do Usuário

- ✅ Atualizar informações pessoais
- ✅ Alterar senha
- ✅ Configurar preferências
- ✅ Visualizar estatísticas
- ✅ Exportar dados
- ✅ Gerenciar configurações

## 4. Segurança

### 4.1 Regras de Segurança

- Todos os dados são protegidos por autenticação
- Usuários só podem acessar seus próprios dados
- Validação de dados no cliente e servidor

### 4.2 Boas Práticas

- Uso de UID do Firebase Auth como chave primária
- Validação de dados antes de salvar
- Tratamento de erros adequado
- Logs de auditoria (timestamps)

## 5. Deploy

### 5.1 Configuração de Domínio

1. No Firebase Console, vá para **Hosting**
2. Configure o domínio do seu site
3. Atualize as configurações de autenticação com o novo domínio

### 5.2 Variáveis de Ambiente

Para produção, considere usar variáveis de ambiente para as configurações do Firebase:

```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
  // ... outras configurações
}
```

## 6. Monitoramento

### 6.1 Analytics

- Firebase Analytics está configurado
- Métricas de uso disponíveis no console

### 6.2 Logs

- Logs de autenticação disponíveis no console
- Logs de erro no Firestore

## 7. Suporte

Para problemas ou dúvidas:

1. Verifique os logs no Firebase Console
2. Teste as regras de segurança
3. Verifique a configuração de domínios autorizados
4. Consulte a documentação oficial do Firebase

## 8. Próximos Passos

- [ ] Implementar notificações push
- [ ] Adicionar mais provedores de autenticação
- [ ] Implementar cache offline
- [ ] Adicionar analytics mais detalhados
- [ ] Implementar backup automático
