import type { ConfigCurso } from '@/types'

export const CURSOS: Record<string, ConfigCurso> = {
  BICTI: {
    nome: 'BICTI',
    requisitos: {
      AC: 240,
      LV: 360,
      OB: 601,
      OG: 780,
      OH: 120,
      OP: 0,
      OX: 180,
      OZ: 120,
    },
    metadata: {
      codigo: 'G20251X',
      matrizCurricular: 'INTERDISCIPLINAR EM CIÊNCIA, TECNOLOGIA E INOVAÇÃO',
      entradaVigor: '2025.2',
      totalMinima: 2401,
      prazos: {
        minimo: 6,
        medio: 6,
        maximo: 9
      },
      limites: {
        chObrigatoriaAula: 600,
        chOptativaMinima: 1560,
        chComplementarMinima: 240,
        chEletivaMaxima: 360,
        chPeriodoMaxima: 540
      }
    },
    totalHoras: 2401,
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
    metadata: {
      codigo: 'G20251X',
      matrizCurricular: 'BACHARELADO EM ENGENHARIA DE PRODUÇÃO',
      entradaVigor: '2025.2',
      totalMinima: 3810,
      prazos: {
        minimo: 10,
        medio: 10,
        maximo: 15
      },
      limites: {
        chObrigatoriaAula: 2745,
        chOptativaMinima: 540,
        chComplementarMinima: 360,
        chEletivaMaxima: 0,
        chPeriodoMaxima: 540
      }
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
    metadata: {
      codigo: 'G20251X',
      matrizCurricular: 'BACHARELADO EM ENGENHARIA ELÉTRICA',
      entradaVigor: '2025.2',
      totalMinima: 4031,
      prazos: {
        minimo: 10,
        medio: 10,
        maximo: 15
      },
      limites: {
        chObrigatoriaAula: 2895,
        chOptativaMinima: 660,
        chComplementarMinima: 340,
        chEletivaMaxima: 0,
        chPeriodoMaxima: 540
      }
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
