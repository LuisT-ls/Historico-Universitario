import { z } from 'zod'

export const NATUREZAS = ['AC', 'LV', 'OB', 'OC', 'OG', 'OH', 'OP', 'OX', 'OZ'] as const

export const disciplinaSchema = z
  .object({
    periodo: z
      .string()
      .min(1, 'Período é obrigatório')
      .regex(/^\d{4}\.[12]$/, 'Formato inválido. Use AAAA.S (ex: 2026.1)'),
    codigo: z.string().min(1, 'Código é obrigatório').max(20, 'Código muito longo').trim(),
    nome: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo').trim(),
    natureza: z.enum(NATUREZAS, {
      errorMap: () => ({ message: 'Natureza é obrigatória' }),
    }),
    ch: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z
        .number({ required_error: 'Carga horária é obrigatória' })
        .int('Deve ser um número inteiro')
        .min(1, 'Carga horária deve ser maior que 0')
        .max(600, 'Carga horária inválida')
    ),
    nota: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number().min(0, 'Nota deve ser no mínimo 0').max(10, 'Nota deve estar entre 0 e 10').optional()
    ),
    trancamento: z.boolean().optional(),
    dispensada: z.boolean().optional(),
    emcurso: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.natureza === 'AC') return true
      if (data.trancamento || data.dispensada || data.emcurso) return true
      return data.nota !== undefined && data.nota !== null
    },
    {
      message: 'Nota é obrigatória para esta natureza',
      path: ['nota'],
    }
  )

export type DisciplinaFormValues = z.infer<typeof disciplinaSchema>
