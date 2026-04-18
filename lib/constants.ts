import type { ConfigCurso, ConcentracaoBICTI, ConcentracaoBIHUM, Instituto } from '@/types'

export interface InfoItem {
  label: string
  value: string
  href?: string
  copyable?: boolean
}

export interface InfoSection {
  title: string
  icon: string
  items: InfoItem[]
}

export interface ConfigInstituto {
  nome: string
  sigla: string
  cursos: string[]
  info: InfoSection[]
}

export const INSTITUTOS: Record<Instituto, ConfigInstituto> = {
  ICTI: {
    nome: 'Instituto de Ciências, Tecnologia e Inovação',
    sigla: 'ICTI',
    cursos: ['BICTI', 'ENG_PROD', 'ENG_ELET'],
    info: [
      {
        title: 'Emails importantes ✨',
        icon: 'Mail',
        items: [
          { label: 'Colegiado BICTI (Prof. Carina)', value: 'colicti@ufba.br', href: 'mailto:colicti@ufba.br', copyable: true },
          { label: 'Colegiado Eng. Produção (Prof. Renato)', value: 'renato.vivas@ufba.br', href: 'mailto:renato.vivas@ufba.br', copyable: true },
          { label: 'Secretaria acadêmica', value: 'seacicti@ufba.br', href: 'mailto:seacicti@ufba.br', copyable: true },
          { label: 'Secretaria acadêmica', value: 'italo.caiana@ufba.br', href: 'mailto:italo.caiana@ufba.br', copyable: true },
          { label: 'Direção (Prof. Maiana)', value: 'icti@ufba.br', href: 'mailto:icti@ufba.br', copyable: true },
          { label: 'NOAE', value: 'noae.icti@ufba.br', href: 'mailto:noae.icti@ufba.br', copyable: true },
        ],
      },
      {
        title: 'Documentos',
        icon: 'FolderOpen',
        items: [
          { label: 'Drive do DA', value: 'Acesse o Drive', href: 'https://drive.google.com/drive/folders/1y9asx8s_i6nJ7Qcl1w9KTZPYCXOGlTD6' },
        ],
      },
      {
        title: 'Comunidades',
        icon: 'MessageCircle',
        items: [
          { label: 'Grupo Informativo ICTI', value: 'WhatsApp', href: 'https://chat.whatsapp.com/Gkm4vKJcL1D3skgIcJWr4b' },
        ],
      },
    ],
  },
  HUMANIDADES: {
    nome: 'Instituto de Humanidades, Artes e Ciências',
    sigla: 'IHAC',
    cursos: ['BI_HUM'],
    info: [],
  },
}

export const CONCENTRACOES_BICTI: Record<ConcentracaoBICTI, { nome: string }> = {
  CIENCIA_DADOS: { nome: 'Ciência de Dados' },
  ESTUDOS_ENGENHARIA: { nome: 'Estudos de Engenharia' },
}

export const CONCENTRACOES_BIHUM: Record<ConcentracaoBIHUM, { nome: string }> = {
  ESTUDOS_JURIDICOS:      { nome: 'Estudos Jurídicos' },
  ESCRITA_CRIATIVA:       { nome: 'Escrita Criativa' },
  ESTUDOS_SUBJETIVIDADE:  { nome: 'Estudos da Subjetividade e do Comportamento Humano' },
  POLITICAS_CULTURA:      { nome: 'Políticas e Gestão da Cultura' },
  RELACOES_INTERNACIONAIS:{ nome: 'Relações Internacionais' },
}

export const CURSOS: Record<string, ConfigCurso> = {
  BICTI: {
    nome: 'BICTI',
    instituto: 'ICTI',
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
    concentracoes: {
      CIENCIA_DADOS: {
        nome: 'Ciência de Dados',
        requisitos: {
          AC: 240,
          LV: 360,
          OB: 601,
          OH: 120,
          OG: 240,
          OZ: 120,
          OX: 180,
        },
      },
      ESTUDOS_ENGENHARIA: {
        nome: 'Estudos de Engenharia',
        requisitos: {
          AC: 240,
          LV: 360,
          OB: 601,
          OC: 60,
          OH: 120,
          OZ: 120,
          OX: 180,
        },
      },
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
    instituto: 'ICTI',
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
      totalMinima: 3750,
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
  BI_HUM: {
    nome: 'BI em Humanidades',
    instituto: 'HUMANIDADES' as const,
    requisitos: {
      OB: 301,
      OP: 1740,
      AC: 360,
    },
    metadata: {
      codigo: 'G20251',
      matrizCurricular: 'HUMANIDADES - SALVADOR - BACHARELADO - Presencial - MT',
      entradaVigor: '2025.2',
      totalMinima: 2401,
      prazos: { minimo: 6, medio: 6, maximo: 9 },
      limites: {
        chObrigatoriaAula: 301,
        chOptativaMinima: 1740,
        chComplementarMinima: 360,
        chEletivaMaxima: 1020,
        chPeriodoMaxima: 540,
      },
    },
    totalHoras: 2401,
  },
  ENG_ELET: {
    nome: 'Engenharia Elétrica',
    instituto: 'ICTI',
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
  OC: 'OC - Optativa de Concentração',
  OG: 'OG - Optativa da Grande Área',
  OH: 'OH - Optativa Humanística',
  OP: 'OP - Optativa',
  OX: 'OX - Optativa de Extensão',
  OZ: 'OZ - Optativa Artística',
}

/** Carga horária necessária para equivaler a 1 crédito acadêmico */
export const CH_POR_CREDITO = 15

/** Nota mínima (inclusiva) para aprovação em disciplinas regulares */
export const NOTA_MINIMA_APROVACAO = 5.0

// Re-export type-safe constants for convenience
export {
  RESULTADO_LABELS,
  STATUS_CERTIFICADO_LABELS,
  TIPO_CERTIFICADO_LABELS,
  createDisciplinaId,
  createUserId,
  createCertificadoId,
} from './type-constants'
