import { z } from 'zod'

export const TIPOS_CERTIFICADO_VALUES = [
  'curso',
  'workshop',
  'palestra',
  'evento',
  'congresso',
  'projeto',
  'pesquisa',
  'monitoria',
  'estagio',
  'visita_tecnica',
  'outro',
] as const

export const certificadoSchema = z
  .object({
    titulo: z
      .string()
      .min(3, 'Título deve ter no mínimo 3 caracteres')
      .max(200, 'Título muito longo')
      .trim(),
    tipo: z
      .preprocess(
        (val) => (val === '' ? undefined : val),
        z.enum(TIPOS_CERTIFICADO_VALUES).optional()
      )
      .optional(),
    instituicao: z.string().max(200, 'Instituição muito longa').trim().optional(),
    // Recebe string do input, coerce para número
    cargaHoraria: z.coerce
      .number({
        required_error: 'Carga horária é obrigatória',
        invalid_type_error: 'Carga horária deve ser um número',
      })
      .int('Deve ser um número inteiro')
      .min(1, 'Mínimo 1 hora')
      .max(9999, 'Valor inválido'),
    // Datas chegam convertidas para ISO (YYYY-MM-DD) pelo hook
    dataInicio: z
      .string()
      .min(1, 'Data de início é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida (use DD/MM/AAAA)'),
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de conclusão inválida (use DD/MM/AAAA)')
      .optional()
      .or(z.literal('')),
    descricao: z.string().max(1000, 'Descrição muito longa').optional(),
    linkExterno: z
      .string()
      .url('URL inválida. Inclua http:// ou https://')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.dataFim || data.dataFim === '') return true
      return data.dataFim >= data.dataInicio
    },
    {
      message: 'Data de conclusão deve ser posterior à data de início',
      path: ['dataFim'],
    }
  )

export type CertificadoSchemaInput = z.input<typeof certificadoSchema>
export type CertificadoSchemaOutput = z.output<typeof certificadoSchema>

/** Erros por campo retornados pelo safeParse */
export type CertificadoFormErrors = Partial<Record<string, string>>
