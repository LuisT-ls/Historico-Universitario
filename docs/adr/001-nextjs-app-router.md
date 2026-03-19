# ADR-001 — Migração para Next.js App Router

**Status:** Aceito
**Data:** 2024

## Contexto

O projeto nasceu como uma SPA vanilla (HTML/CSS/JS). Com o crescimento de funcionalidades, ficou necessário:
- Roteamento declarativo sem reconstrução manual do DOM
- SSR/SSG para melhor SEO e performance inicial
- Melhor DX com TypeScript nativo e bundler integrado

## Decisão

Migrar para **Next.js 16 com App Router** (React 19, Server Components).

## Consequências

**Positivas:**
- Rotas como diretórios — fácil de navegar e escalar
- Server Components reduzem JS enviado ao cliente
- `next/image`, `next/font` e otimizações de build incluídas
- Vercel deploy com zero configuração adicional

**Negativas/Compensações:**
- Server Components não podem usar hooks ou estado — componentes de página ficam em `components/pages/` como Client Components, com `app/` apenas fazendo o import
- Curva de aprendizado do modelo de composição Server/Client

## Alternativas Consideradas

- Vite + React Router: DX similar, mas sem SSR nativo e sem integração Vercel
- Manter vanilla JS: inviável para o volume de funcionalidades atual
