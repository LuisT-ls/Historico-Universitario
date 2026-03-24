# Cobertura de Testes

Descrição do que cada suite de testes cobre e a motivação por trás dos casos.

---

## `lib/pdf-parser.test.ts`

Testa o parsing do histórico acadêmico exportado pelo SIGAA em PDF.

### Situações reconhecidas

| Código | Significado | Mapeamento |
|--------|-------------|------------|
| `APR` | Aprovado | `resultado: 'AP'` |
| `REP` / `REPF` / `REPMF` | Reprovado / por falta / por média e falta | `resultado: 'RR'` |
| `TRANC` / `CANC` | Trancado / Cancelado | `resultado: 'TR'`, `trancamento: true` |
| `DISP` / `CUMP` / `TRANS` / `INCORP` | Dispensado / Cumpriu / Transferido / Incorporado | `resultado: 'DP'`, `dispensada: true` |
| `MATR` | Matriculado (em curso) | `emcurso: true` |

### Naturezas reconhecidas

| Código PDF | Mapeamento interno |
|------------|-------------------|
| `EB` | `OB` (Equivalente Obrigatório) |
| `EP` | `OP` (Equivalente a Optativo) |
| `EC` | `AC` (Equivalente a Complementar) |
| `OB`, `OP`, `LV`, `AC`, `OG`, `OH`, `OX`, `OZ` | passam diretamente |

### Casos testados

- Nota `--` é convertida para `0` sem afetar a média (disciplinas dispensadas são excluídas do cálculo de média)
- Disciplinas com situação `TRANS` aparecem no PDF sem semestre (`--` no lugar do período) e são atribuídas ao período `0000.0`
- O período `--` não contamina o `currentPeriod` — linhas seguintes sem semestre continuam herdando o último semestre real
- Sufixo `A` de turma é removido de códigos com 6+ caracteres (ex: `CTIA01A` → `CTIA01`)
- Nome do professor é removido do nome da disciplina (detectado por `Dr.`, `Dra.`, `MSc.` ou pela presença de letras minúsculas)
- A linha de cabeçalho `Componente Curricular` e linhas com nome muito curto são descartadas
- Disciplinas de outros cursos marcadas como `OB` são reclassificadas como `OP` com aviso

---

## `lib/utils.test.ts` e `lib/utils-coverage.test.ts`

Testam as funções de cálculo acadêmico.

### `calcularResultado`

Determina o resultado (`AP`, `RR`, `TR`, `DP`) com base em nota e flags. Atividades Complementares (`AC`) não possuem resultado.

### `calcularCR` (Coeficiente de Rendimento)

Calculado como média ponderada de nota por CH, considerando apenas disciplinas com nota válida, não dispensadas, não trancadas e não em curso.

### `calcularMediaGeral`

Média aritmética das notas de disciplinas aprovadas ou reprovadas, excluindo dispensadas, trancadas e AC.

### `calcularEstatisticas`

- `completedDisciplines` conta `AP`, `RR` e também dispensadas/transferidas (`dispensada: true` e não em curso)
- `inProgressDisciplines` conta apenas `emcurso: true` — dispensadas/transferidas **não** são consideradas em andamento
- `horasPorNatureza` usa a natureza real da disciplina (sem forçar dispensadas para `LV`)
- Excesso de horas em categorias com cap (OP, OG, etc.) transborda para `LV`
- `LV` é limitado ao seu requisito máximo

### `calcularPrevisaoFormaturaCompleta`

- Usa o `totalCH` já concluído (inclui CH de disciplinas transferidas/dispensadas) para calcular horas restantes
- A média de CH por disciplina é calculada apenas com disciplinas cursadas normalmente (não dispensadas), para refletir o ritmo real do aluno
- Detecta o caso em que só faltam Atividades Complementares e exibe mensagem específica

### `calcularPerfilInicial`

Avalia quantos semestres do perfil ideal foram cumpridos via aproveitamento de disciplinas dispensadas.

---

## `lib/cr-calculation.test.ts`

Casos de borda do CR: histórico vazio, apenas reprovações, disciplinas trancadas, notas no limite de aprovação (7.0), e combinações mistas.

---

## `lib/error-handler.test.ts` e `lib/error-handler-additional.test.ts`

Cobertura completa do mapeamento de erros do Firebase Authentication, Firestore e Storage para mensagens amigáveis em português.

---

## `lib/certificate-ocr.test.ts`

Testa a extração de dados de certificados via OCR: carga horária, datas, nome do evento.

---

## `lib/normalization.test.ts`

Normalização de strings de disciplinas para comparação (remoção de acentos, pontuação, espaços extras).

---

## `services/firestore.service.test.ts`

Testa o CRUD de disciplinas no Firestore com mocks: salvar, buscar, atualizar e deletar disciplinas, além do comportamento quando o usuário não está autenticado (salvar apenas localmente).

## `services/auth.service.test.ts`

Testa login, logout e escuta de estado de autenticação.

---

## `components/`

- **`auth-provider.test.tsx`** — contexto de autenticação propagado corretamente para filhos
- **`ui/button.test.tsx`** — variantes, estados desabilitado e loading
- **`features/certificados/hooks/`** — filtros de certificados, validação do formulário, máscara de data
- **`components/utils.test.tsx`** — utilitários de componentes (cn, formatação)
