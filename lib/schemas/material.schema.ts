import { z } from 'zod'

export const CURSOS_VALUES = ['BICTI', 'ENG_PROD', 'ENG_ELET', 'BI_HUM'] as const
export const TIPOS_MATERIAL_VALUES = [
  'lista',
  'apostila',
  'prova',
  'resumo',
  'slides',
  'atividade',
  'outro',
] as const

export const materialSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Título muito longo')
    .trim(),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  curso: z.enum(CURSOS_VALUES, {
    errorMap: () => ({ message: 'Selecione o curso' }),
  }),
  disciplina: z
    .string()
    .min(2, 'Informe a disciplina')
    .max(100, 'Nome da disciplina muito longo')
    .trim(),
  semestre: z.string().min(1, 'Selecione o semestre'),
  tipo: z.enum(TIPOS_MATERIAL_VALUES, {
    errorMap: () => ({ message: 'Selecione o tipo' }),
  }),
})

export type MaterialFormValues = z.infer<typeof materialSchema>
