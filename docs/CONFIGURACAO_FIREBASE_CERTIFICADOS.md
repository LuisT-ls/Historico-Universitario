# Configuração do Firebase para Certificados

Este documento explica como configurar o Firebase para suportar o upload e armazenamento de certificados em PDF.

## 📋 Pré-requisitos

- Projeto Firebase configurado
- Firebase CLI instalado (`npm install -g firebase-tools`)
- Acesso de administrador ao projeto Firebase

## 🔧 Configuração do Firebase Storage

### 1. Ativar Firebase Storage

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em "Storage"
4. Clique em "Começar" se ainda não estiver ativado
5. Escolha o local do servidor (recomendado: us-central1)
6. Selecione o modo de segurança (recomendado: "Modo de produção")

### 2. Configurar Regras de Segurança

As regras de segurança já estão configuradas no arquivo `storage.rules`. Para aplicá-las:

```bash
# Fazer login no Firebase
firebase login

# Deploy das regras de segurança
firebase deploy --only storage
```

### 3. Configurar CORS para Upload de PDFs

Execute o script de configuração CORS:

```bash
# Instalar dependências (se necessário)
npm install

# Executar script de configuração
node setup-firebase-storage-cors.js
```

Depois, aplique a configuração CORS:

```bash
# Aplicar configuração CORS (substitua pelo nome do seu bucket)
gsutil cors set firebase-storage-cors.json gs://SEU-PROJETO-ID.appspot.com

# Verificar se foi aplicado
gsutil cors get gs://SEU-PROJETO-ID.appspot.com
```

## 📁 Estrutura de Armazenamento

Os certificados serão armazenados na seguinte estrutura:

```
gs://seu-projeto-id.appspot.com/
└── certificados/
    └── {userId}/
        ├── {timestamp}_{nome-do-arquivo}.pdf
        ├── {timestamp}_{nome-do-arquivo}.pdf
        └── ...
```

## 🔒 Regras de Segurança Implementadas

### Firestore (certificados)

- ✅ Apenas usuários autenticados podem acessar
- ✅ Usuários só podem acessar seus próprios certificados
- ✅ Validação de propriedade por `userId`

### Storage (arquivos PDF)

- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Usuários só podem acessar seus próprios arquivos
- ✅ Validação de tipo de arquivo (apenas PDF)
- ✅ Limite de tamanho: 10MB por arquivo
- ✅ Estrutura organizada por usuário

## 📊 Limites e Quotas

### Firebase Storage

- **Tamanho máximo por arquivo**: 10MB
- **Tipos de arquivo permitidos**: PDF apenas
- **Estrutura de pastas**: `certificados/{userId}/`

### Firestore

- **Coleção**: `certificados`
- **Campos obrigatórios**: `userId`, `titulo`, `tipo`, `instituicao`, `cargaHoraria`
- **Campos opcionais**: `descricao`, `dataInicio`, `dataFim`

## 🚀 Testando a Configuração

### 1. Verificar Storage Rules

```bash
# Verificar regras atuais
firebase firestore:rules:get
```

### 2. Verificar CORS

```bash
# Verificar configuração CORS
gsutil cors get gs://SEU-PROJETO-ID.appspot.com
```

### 3. Testar Upload

1. Acesse a página de certificados
2. Faça login com uma conta válida
3. Tente fazer upload de um PDF
4. Verifique se o arquivo aparece na lista

## 🔧 Solução de Problemas

### Erro: "Permission denied"

- Verifique se as regras de segurança foram aplicadas
- Confirme se o usuário está autenticado
- Verifique se o `userId` está correto

### Erro: "CORS policy"

- Execute novamente o script de configuração CORS
- Verifique se o domínio está na lista de origens permitidas
- Aguarde alguns minutos para a propagação

### Erro: "File too large"

- Verifique se o arquivo tem menos de 10MB
- Confirme se o tipo de arquivo é PDF

### Erro: "Invalid file type"

- Verifique se o arquivo é realmente um PDF
- Confirme se a extensão do arquivo é `.pdf`

## 📝 Monitoramento

### Firebase Console

1. Acesse "Storage" no console
2. Monitore o uso de armazenamento
3. Verifique os arquivos por usuário

### Logs

```bash
# Ver logs do Firebase
firebase functions:log

# Ver logs específicos do Storage
firebase functions:log --only storage
```

## 🔄 Backup e Recuperação

### Backup dos Certificados

Os certificados são automaticamente sincronizados com o Firestore, mas você pode fazer backup manual:

1. Acesse o Firebase Console
2. Vá para "Storage"
3. Selecione os arquivos desejados
4. Faça download ou use a API

### Limpeza de Arquivos

Para limpar arquivos órfãos:

```bash
# Listar arquivos antigos (mais de 1 ano)
gsutil ls -l gs://SEU-PROJETO-ID.appspot.com/certificados/ | grep "2023"

# Remover arquivos específicos (cuidado!)
gsutil rm gs://SEU-PROJETO-ID.appspot.com/certificados/USER_ID/arquivo.pdf
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Firebase Console
2. Confirme se todas as configurações foram aplicadas
3. Teste com um arquivo PDF pequeno primeiro
4. Verifique se o usuário está autenticado corretamente

## ✅ Checklist de Configuração

- [ ] Firebase Storage ativado
- [ ] Regras de segurança aplicadas (`storage.rules`)
- [ ] CORS configurado para PDFs
- [ ] Teste de upload funcionando
- [ ] Validação de tamanho (10MB) funcionando
- [ ] Validação de tipo (PDF) funcionando
- [ ] Acesso restrito por usuário funcionando

---

**Nota**: Substitua `SEU-PROJETO-ID` pelo ID real do seu projeto Firebase em todos os comandos e URLs.
