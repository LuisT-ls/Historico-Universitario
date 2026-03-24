# Contribuindo

## Configuração do ambiente

```bash
npm install
cp .env.local.example .env.local  # preencher com credenciais do Firebase
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Comandos

```bash
npm run dev           # servidor de desenvolvimento
npm run build         # build de produção
npm run lint          # ESLint
npm run type-check    # TypeScript sem emitir arquivos
npm run test          # testes unitários
npm run test:watch    # testes em modo watch
npm run test:coverage # cobertura de testes
npm run test:e2e      # testes end-to-end (Playwright)
```

---

## Estrutura do projeto

```
app/            # Rotas (Next.js App Router)
components/
  ui/           # Componentes Shadcn/UI (não modificar diretamente)
  layout/       # Header, Footer
  pages/        # Componentes de página completa
  features/     # Lógica de domínio (histórico, resumo, gráficos, certificados)
lib/
  pdf-parser.ts       # Parser do histórico SIGAA
  utils/              # Cálculos acadêmicos (CR, previsão, estatísticas)
  constants.ts        # Configuração dos cursos
services/       # Toda comunicação com Firebase passa aqui
types/          # Interfaces e tipos TypeScript
assets/data/    # Catálogo de disciplinas (disciplinas.json)
```

**Regra principal:** componentes não chamam Firebase diretamente — toda operação de I/O passa pelos `services/`.

---

## Convenções de código

### Commits

Seguir o padrão [Conventional Commits](https://www.conventionalcommits.org):

```
feat: adicionar suporte a novo curso
fix: corrigir cálculo de CH para disciplinas transferidas
refactor: extrair lógica de parsing para função separada
docs: atualizar documentação do parser
test: adicionar casos de borda para TRANS
chore: atualizar dependências
```

### TypeScript

- Preferir tipos explícitos a `any`
- Novos tipos e interfaces vão em `types/index.ts`
- Usar branded types (`DisciplinaId`, `UserId`) para IDs — evita mistura acidental em tempo de compilação

### Componentes React

- Client Components apenas quando necessário (estado, eventos, efeitos)
- Componentes de UI reutilizáveis vão em `components/ui/`
- Lógica de domínio vai em `components/features/`

---

## Modificar o parser do histórico (`lib/pdf-parser.ts`)

O parser lê o texto extraído pelo PDF.js linha a linha via regex. Ao modificá-lo:

1. Adicionar o caso no `mapSituacao` ou `mapNatureza` conforme aplicável
2. Atualizar a regex `rowRegex` se o novo código não for capturado
3. Adicionar testes em `__tests__/lib/pdf-parser.test.ts`

Códigos de situação reconhecidos: `APR`, `REP`, `REPF`, `REPMF`, `TRANC`, `CANC`, `DISP`, `CUMP`, `TRANS`, `INCORP`, `MATR`.

Naturezas reconhecidas: `OB`, `OP`, `LV`, `AC`, `OG`, `OH`, `OX`, `OZ`, `EB` (→`OB`), `EP` (→`OP`), `EC` (→`AC`).

---

## Adicionar um novo curso

1. Criar a entrada em `lib/constants.ts` com `totalHoras` e `requisitos` por natureza
2. Adicionar o tipo em `types/index.ts` (`Curso`)
3. Adicionar as disciplinas no `assets/data/disciplinas.json` sob `cursos.<SIGLA>`
4. Verificar se os cálculos de redistribuição de horas em `lib/utils/statistics.ts` se comportam corretamente para o novo perfil

---

## Testes

Todo código novo deve ter testes correspondentes. Ver [TESTES.md](./TESTES.md) para detalhes de cobertura por suite.

```bash
npm run test          # verificar antes de abrir PR
npm run type-check    # sem erros de tipo
npm run lint          # sem warnings de lint
```

A cobertura mínima é de 70% para branches e lines.

---

## Pull Requests

- Descrever o problema resolvido ou funcionalidade adicionada
- Incluir testes para o comportamento novo ou corrigido
- Garantir que `npm run build` e `npm run test` passam sem erros
