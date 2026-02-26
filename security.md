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

A integridade dos dados é garantida por meio de **Firestore Security Rules**, que operam no lado do servidor (Server-Side):
- **Isolamento de Dados:** Cada usuário só pode escrever e editar seus próprios registros.
- **Validação de Tipos e Tamanho:** Implementamos funções de validação (`isValidString`) que verificam o tamanho das strings e o tipo dos campos (ex: CH deve ser número >= 0) diretamente nas regras, impedindo o envio de dados corrompidos ou maliciosos.
- **Controle de Privacidade:** Através da função `isPublic(userId)`, a leitura de dados por terceiros é bloqueada, a menos que o proprietário tenha explicitamente marcado seu perfil como "Público".

## 🧹 3. Proteção contra Injeção e XSS

Para prevenir ataques de Cross-Site Scripting (XSS) e outras injeções via interface:
- **Cabeçalhos de Segurança:** Implementados via `next.config.ts`, incluindo `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS) e `X-Frame-Options` para mitigar ataques de injeção e clickjacking.
- **Escapamento Automático:** O uso do React/Next.js garante que o conteúdo renderizado seja escapado por padrão, minimizando riscos de execução de scripts maliciosos.

## 📁 4. Segurança de Arquivos e Assets

- **Firebase Storage Rules:** Regras que garantem que apenas o proprietário da conta possa fazer upload ou visualizar arquivos sensíveis (como fotos de perfil personalizadas).
- **CORS Policy:** Políticas de Cross-Origin Resource Sharing restritivas para garantir que apenas o domínio oficial da aplicação (`*.vercel.app`) possa interagir com os recursos de armazenamento.

## 📊 5. Privacidade por Design

- **Exportação Transparente:** O usuário tem total controle sobre seus dados, podendo exportar tudo o que o sistema possui (PDF, Excel, JSON) ou excluir permanentemente sua conta e todos os dados associados.
- **Mininização de Dados:** Coletamos apenas as informações estritamente necessárias para o cálculo do CR e da semestralização acadêmica.

## 🐛 6. Relatando Vulnerabilidades

Se você encontrar qualquer falha de segurança ou comportamento suspeito na plataforma, pedimos que **não abra uma Issue pública**. Em vez disso:
1. Envie um e-mail diretamente para o desenvolvedor: **luist_ls@outlook.pt**
2. Descreva os passos para reproduzir a falha.
3. Aguarde uma resposta para que possamos corrigir o problema de forma coordenada.

---
*A segurança da sua trajetória acadêmica é nossa prioridade.*
