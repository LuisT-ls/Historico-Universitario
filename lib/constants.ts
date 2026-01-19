import type { ConfigCurso } from '@/types'

export const CURSOS: Record<string, ConfigCurso> = {
  BICTI: {
    nome: 'BICTI',
    requisitos: {
      AC: 240,
      LV: 360,
      OB: 600,
      OG: 780,
      OH: 120,
      OP: 0,
      OX: 180,
      OZ: 120,
    },
    totalHoras: 2400,
  },
  ENG_PROD: {
    nome: 'Engenharia de Produção',
    requisitos: {
      OB: 2850,
      OP: 180,
      OZ: 120,
      OX: 240,
      AC: 360,
    },
    totalHoras: 3750,
  },
  ENG_ELET: {
    nome: 'Engenharia Elétrica',
    requisitos: {
      AC: 340,
      OB: 2910,
      OP: 300,
      OX: 240,
      OZ: 120,
    },
    totalHoras: 3910,
  },
}

export const NATUREZA_LABELS: Record<string, string> = {
  AC: 'AC - Atividade Complementar',
  LV: 'LV - Componente Livre',
  OB: 'OB - Obrigatória',
  OG: 'OG - Optativa da Grande Área',
  OH: 'OH - Optativa Humanística',
  OP: 'OP - Optativa',
  OX: 'OX - Optativa de Extensão',
  OZ: 'OZ - Optativa Artística',
}

// Re-export type-safe constants for convenience
export {
  RESULTADO_LABELS,
  STATUS_CERTIFICADO_LABELS,
  TIPO_CERTIFICADO_LABELS,
  createDisciplinaId,
  createUserId,
  createCertificadoId,
} from './type-constants'
