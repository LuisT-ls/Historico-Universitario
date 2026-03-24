# Testes

## Executar

```bash
npm run test              # todos os testes unitários
npm run test:watch        # modo watch
npm run test:coverage     # com relatório de cobertura
npm run test:e2e          # testes end-to-end (Playwright)
npm run test:all          # unitários + E2E
```

## Cobertura mínima

| Métrica    | Threshold |
|------------|-----------|
| Branches   | 70%       |
| Lines      | 70%       |
| Functions  | 60%       |
| Statements | 60%       |

Total atual: **364 testes** (360 passando, 4 skipped).

## Estrutura

```
__tests__/
├── lib/
│   ├── pdf-parser.test.ts
│   ├── utils.test.ts
│   ├── utils-coverage.test.ts
│   ├── utils-additional.test.ts
│   ├── cr-calculation.test.ts
│   ├── normalization.test.ts
│   ├── certificate-ocr.test.ts
│   ├── error-handler.test.ts
│   └── error-handler-additional.test.ts
├── components/
│   ├── auth-provider.test.tsx
│   ├── features/certificados/hooks/
│   │   ├── use-certificado-filters.test.ts
│   │   ├── use-certificado-form.test.ts
│   │   └── use-date-mask.test.ts
│   ├── ui/button.test.tsx
│   └── utils.test.tsx
└── services/
    ├── auth.service.test.ts
    └── firestore.service.test.ts
```

Para detalhes sobre o que cada suite cobre, ver [TESTES.md](./TESTES.md).
