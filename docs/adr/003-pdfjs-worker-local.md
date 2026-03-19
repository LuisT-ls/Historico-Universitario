# ADR-003 — PDF.js worker servido localmente

**Status:** Aceito
**Data:** 2025

## Contexto

`pdfjs-dist` requer um Web Worker para processar PDFs. O caminho padrão aponta para um CDN externo (`cdnjs.cloudflare.com`). A CSP do projeto bloqueia workers de origens externas (`worker-src 'self'`), causando erro de carregamento.

## Decisão

Copiar o worker do `node_modules` para `public/` via script `postinstall`, e configurar `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'`.

```json
// package.json
"postinstall": "node scripts/copy-pdf-worker.js"
```

## Consequências

**Positivas:**
- CSP satisfeita sem relaxar `worker-src`
- Worker servido do mesmo domínio — sem latência de CDN externo
- Funciona em ambientes offline (localhost, Codespaces)

**Negativas/Compensações:**
- O arquivo `public/pdf.worker.min.mjs` (~1 MB) precisa ser atualizado manualmente quando `pdfjs-dist` é atualizado — o script `postinstall` garante isso automaticamente em cada `npm install`
- O arquivo não deve ser commitado no Git (está em `.gitignore`) — é regenerado no build

## Alternativa Considerada

Usar `blob:` URI para criar o worker dinamicamente. Rejeitada porque também exige relaxar a CSP.
