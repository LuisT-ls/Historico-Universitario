# ✅ Checklist de Deploy para Vercel

## 🎯 Status do Build

✅ **Build bem-sucedido!** O projeto compila sem erros.

## 📋 Verificações Realizadas

### ✅ Build e Compilação
- [x] Build do Next.js executado com sucesso
- [x] TypeScript sem erros
- [x] Todas as rotas geradas corretamente:
  - `/` (Home)
  - `/login`
  - `/certificados`
  - `/profile`
  - `/legal/privacy`
  - `/legal/terms`

### ✅ Configurações
- [x] `next.config.ts` configurado corretamente
- [x] `tsconfig.json` válido
- [x] `package.json` com todas as dependências
- [x] `.gitignore` configurado corretamente

### ✅ Arquivos Estáticos
- [x] Favicons em `public/assets/img/favicon/`
- [x] `manifest.json` em `public/`
- [x] `robots.txt` em `public/`
- [x] `sitemap.xml` em `public/`
- [x] Imagem OG em `public/assets/img/og-image.jpg`

### ✅ Componentes e Funcionalidades
- [x] Página inicial (Home)
- [x] Página de login
- [x] Página de perfil
- [x] Página de certificados
- [x] Páginas legais (Privacidade e Termos)
- [x] Header e Footer
- [x] Autenticação Firebase
- [x] Integração com Firestore
- [x] Integração com Firebase Storage

## 🔧 Configuração no Vercel

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel do Vercel:

```env
# Configure estas variáveis com suas credenciais reais do Firebase
# Consulte .env.example para o template completo
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

**Importante:** As credenciais do Firebase agora devem ser configuradas exclusivamente via variáveis de ambiente. O código não contém mais valores padrão por questões de segurança.

### 2. Configurações do Projeto

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (padrão)
- **Output Directory:** `.next` (padrão)
- **Install Command:** `npm install` (padrão)
- **Node Version:** 20.x ou superior

### 3. Domínio e DNS

- Configure o domínio customizado se necessário
- Verifique se o domínio está apontando para o Vercel

## ⚠️ Observações Importantes

### vercel.json
O arquivo `vercel.json` contém configurações para o sistema antigo (HTML estático). 
**Para Next.js, essas configurações não são necessárias**, pois o Next.js gerencia as rotas automaticamente.

Você pode:
- **Opção 1:** Remover o `vercel.json` (recomendado para Next.js)
- **Opção 2:** Manter apenas as configurações de headers se necessário

### Firebase Storage
Certifique-se de que:
- Firebase Storage está ativado no console
- Regras de segurança estão configuradas (`storage.rules`)
- CORS está configurado para uploads

### Firestore Rules
Verifique se as regras do Firestore estão configuradas corretamente:
- `firestore.rules` deve estar deployado
- Usuários só podem acessar seus próprios dados

## 🚀 Comandos para Deploy

### Deploy via Vercel CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Deploy via GitHub

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

## 📝 Checklist Final Antes do Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Firebase Storage ativado e configurado
- [ ] Firestore Rules deployadas
- [ ] Domínio configurado (se aplicável)
- [ ] Testar build local: `npm run build`
- [ ] Verificar se não há erros no console
- [ ] Testar funcionalidades principais:
  - [ ] Login (email/senha)
  - [ ] Login (Google)
  - [ ] Adicionar disciplina
  - [ ] Editar disciplina
  - [ ] Excluir disciplina
  - [ ] Adicionar certificado
  - [ ] Visualizar certificado
  - [ ] Exportar dados
  - [ ] Alterar senha
  - [ ] Excluir conta

## 🎉 Pronto para Deploy!

O projeto está pronto para deploy no Vercel. Todos os arquivos estão configurados corretamente e o build passa sem erros.

