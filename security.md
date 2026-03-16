# 🛡️ Diretrizes de Segurança - Histórico Acadêmico

> [!CAUTION]
> **Aviso:** Este projeto é uma iniciativa independente e **não possui vínculo oficial** com a UFBA ou o sistema SIGAA. O software foi desenvolvido para auxiliar a comunidade do **ICTI Camaçari**.

Este documento detalha as medidas de segurança implementadas no projeto para garantir a integridade dos dados acadêmicos e a privacidade dos estudantes da UFBA.

## 🔐 1. Autenticação e Gestão de Identidade

A plataforma utiliza o **Firebase Authentication** para gerenciar o acesso de forma robusta e segura:
- **Provedores Suportados:** Google OAuth 2.0 e Email/Senha.
- **Tokens de Acesso:** Utilização de JWT (JSON Web Tokens) com expiração automática.
- **Re-autenticação Crítica:** Operações sensíveis, como alteração de senha e exclusão permanente de conta, exigem que o usuário valide sua identidade novamente no momento da ação.

## 🗄️ 2. Segurança de Banco de Dados (Cloud Firestore)

A integridade dos dados é garantida por meio de **Firestore Security Rules** aplicadas no lado do servidor:
- **Isolamento de Dados:** Cada usuário só pode criar, editar e excluir seus próprios registros — verificado via `request.auth.uid`.
- **Regras explícitas por operação:** As coleções `disciplines` e `certificados` utilizam `allow create`, `allow update` e `allow delete` separados, em vez do atalho `allow write`. Isso garante que cada tipo de operação tenha exatamente as verificações necessárias (ex.: `allow delete` não acessa `request.resource`, que é nulo em exclusões).
- **Imutabilidade do proprietário:** O `allow update` exige `request.resource.data.userId == resource.data.userId`, impedindo que um documento seja "doado" a outro usuário.
- **Validação de Tipos e Tamanho:** Funções `isValidString` validam tamanho de strings e tipos de campos diretamente nas regras, bloqueando dados malformados antes de chegar ao banco.
- **Controle de Privacidade:** A função `isPublic(userId)` bloqueia a leitura por terceiros, salvo quando o proprietário definiu o perfil como público.
- **Bloqueio Global:** Uma regra catch-all (`match /{document=**}`) nega acesso a qualquer coleção não declarada explicitamente.

## 🧹 3. Proteção contra Injeção, XSS e URLs Maliciosas

Para prevenir ataques de Cross-Site Scripting (XSS) e injeção via interface:
- **Escapamento Automático:** React/Next.js escapa todo conteúdo renderizado via JSX por padrão — nenhum `dangerouslySetInnerHTML` é alimentado com dados do usuário.
- **Sanitização de Inputs:** A função `sanitizeInput()` remove tags HTML (`<>`), o protocolo `javascript:` e event handlers inline (`on*=`). `sanitizeLongText()` aplica as mesmas proteções em campos longos.
- **Validação de URLs Externas:** A função `isSafeExternalUrl()` valida URLs antes de qualquer chamada a `window.open()`, aceitando apenas `http://` e `https://` — bloqueando `javascript:`, `data:`, `vbscript:` e outros protocolos perigosos. Links abertos externamente incluem `noopener,noreferrer`.
- **Validação de Formulários:** Zod + React Hook Form validam todos os inputs no cliente antes do envio.
- **Cabeçalhos de Segurança HTTP** (via `next.config.ts`):
  - `Content-Security-Policy`: restringe scripts a `'self'` e domínios Firebase/Google; sem `unpkg.com` ou outros CDNs de terceiros.
  - `Strict-Transport-Security` (HSTS): ativo em produção com `preload`.
  - `X-Frame-Options: DENY`: previne clickjacking.
  - `X-Content-Type-Options: nosniff`: previne MIME sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy`: câmera, microfone e geolocalização desabilitados.

## 📁 4. Segurança de Arquivos e Assets

- **Firebase Storage Rules:** Apenas o proprietário da conta pode fazer upload ou acessar arquivos sensíveis.
- **Restrição de Domínios de Imagem:** O `next/image` aceita apenas imagens de `*.googleusercontent.com` e `*.firebaseusercontent.com` — evitando uso indevido como proxy de imagens de qualquer domínio.
- **Source Maps desabilitados em produção:** `productionBrowserSourceMaps: false` impede exposição do código-fonte ao cliente.
- **Header `X-Powered-By` removido:** `poweredByHeader: false` evita fingerprinting do servidor.

## 📊 5. Privacidade por Design

- **Exportação Transparente:** O usuário tem total controle sobre seus dados, podendo exportar em PDF, Excel ou JSON, ou excluir permanentemente a conta e todos os registros associados.
- **Minimização de Dados:** Apenas informações necessárias para o cálculo do CR e semestralização são coletadas.
- **Direito ao Apagamento (LGPD):** As Firestore Security Rules garantem que operações de exclusão funcionem corretamente, assegurando que o usuário possa de fato remover seus dados da plataforma.

## 🏗️ 6. Arquitetura e Isolamento de Código

- **Camada de Serviço Centralizada:** Todo acesso ao Firebase (Firestore, Auth, Storage) é feito exclusivamente via `services/`, isolando a lógica de negócio dos componentes de interface e facilitando auditoria e manutenção.
- **Sem rotas de API customizadas:** Não há endpoints HTTP expostos pelo servidor Next.js — toda a lógica de backend é delegada ao Firebase, reduzindo significativamente a superfície de ataque.
- **Variáveis de Ambiente:** Credenciais Firebase são lidas exclusivamente via `NEXT_PUBLIC_` env vars — nunca hardcoded no código-fonte.

## 🐛 7. Relatando Vulnerabilidades

Se você encontrar qualquer falha de segurança ou comportamento suspeito na plataforma, pedimos que **não abra uma Issue pública**. Em vez disso:
1. Envie um e-mail diretamente para o desenvolvedor: **luist_ls@outlook.pt**
2. Descreva os passos para reproduzir a falha.
3. Aguarde uma resposta para que possamos corrigir o problema de forma coordenada.

---
*A segurança da sua trajetória acadêmica é nossa prioridade.*
